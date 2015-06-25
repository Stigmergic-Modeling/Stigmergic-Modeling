/**
 *  dbOperation flow control
 */
var dbOperation  = require('./db_operation');
var ObjectID = require("mongodb").ObjectID;
var async = require("async");
var fs = require('fs');

//copy data
var Copy = function(dataSet){
    for(var key in dataSet){
        this[key] = dataSet[key];
    };
};

var Merge = function(dataSet,newInfo){
    for(var key in dataSet){
        this[key] = dataSet[key];
    };
    for(key in newInfo){
        var tmpKey = key.split(".");

        var tmpDIr=this;
        for(var i=0;i<(tmpKey.length-1);i++){
            if(tmpDIr[tmpKey[i]] == undefined)  tmpDIr[tmpKey[i]] = {};
            tmpDIr = tmpDIr[tmpKey[i]];
        }
        tmpDIr[tmpKey[i]] = newInfo[key];
    };
}

var ErrUpdate = function(state,newError){
    if(newError != null){
        state += newError;
    }
    return state;
}

/**
 *  get individual model
 */

var getIndividualModel = function (projectID, user, callback) {
    var model = [{}, {}, {
        clazz: {},
        //attr: {},  // 格式 className-attributeName : attributeId
        relation: {}
    }];
    var mutex = 2;  // 对应 getClass 和 getRelation 这两个任务

    // 获取所有 class
    individualModel.getClassSet(projectID, user, model[2]['clazz'], function(classSet) {  // model[2] 是name到id的映射

        var classSetLen = Object.keys(classSet).length;
        // 若 class 个数为 0，则直接退出 getClass 任务
        if (!classSetLen) {
            if (--mutex === 0) {
                return callback(null, model);
            }
            return;
        }

        // 若 class 个数不为 0，则退出 getClassSet 任务，同时加入所有 class 之下的任务（原子性得到保证）
        mutex += classSetLen - 1;

        // 对每个 class
        for (var key in classSet) {

            var item = model[0][key] = [{},{"order":classSet[key]["order"]}];

            //当前已知该class的name，和所包含的attribute的name(在order中)
            // 对某个 class，获取所有 attribute
            individualModel.getAttribute(projectID, user, item, classSet[key].classId, model[2]['clazz'][key].attribute, function (item, attributeSet, attributeNameToId) {

                var attributeSetLen = attributeSet.length;
                if (!attributeSetLen) {
                    if (--mutex === 0) {
                        return callback(null, model);
                    }
                    return;
                }

                mutex += attributeSetLen - 1;
                for (var i=0;i<attributeSetLen;i++) {
                    //获得对应attribute的Property
                    var attributeId = attributeSet[i];
                    individualModel.getAttributeProperty(projectID, user, attributeId, function(attributeId,propertySet){
                        //转换并存储
                        var name =  propertySet.role;
                        item[0][name] = [{}];
                        var property = item[0][name][0];

                        attributeNameToId[name] = {id: attributeId};  // name到id的映射

                        for(var key in propertySet){
                            if(key == "role"){
                                property["name"] = propertySet[key];
                            }else if(key == "class"){
                                property["type"] = propertySet[key];
                            }else if(key == "isAttribute"){
                                continue;
                            }
                            else{
                                property[key] = propertySet[key];
                            }
                        }
                        console.log("return 2");
                        if (--mutex === 0) {
                            return callback(null, model);
                        }
                    });
                }
            });
        }
    });

    // get relation
    individualModel.getRelationGroupAndRelation(projectID, user, function (err, relationGroupSet) {
        var rlgSetLen = Object.keys(relationGroupSet).length;

        // 若 relationGroup 个数为 0，则直接退出 getRelationGroupAndRelation 任务
        if (!rlgSetLen) {
            if (--mutex === 0) {
                console.log("return 3");
                return callback(null, model);
            }
            return;
        }

        // 若 relationGroup 个数不为 0，则退出 getRelationGroupAndRelation 任务，同时加入所有 relationGroup 之下的任务（原子性得到保证）
        mutex += rlgSetLen - 1;

        model[1] = relationGroupSet;
        //console.log('model', model);
        //console.log('model[1]', model[1]);
        //console.log('relationGroupSet', relationGroupSet);

        // 对每一个 relationGroup
        for (var rlg in relationGroupSet) {
            var relationArray = relationGroupSet[rlg][1]['order'];
            var relationArrayLen = relationArray.length;

            for(var i=0;i<relationArray.length;i++){
                model[2]['relation'][relationArray[i]] = relationArray[i];
            }

            // 若 relation 个数为 0，则直接退出 getRelationGroupAndRelation 任务
            if (!relationArrayLen) {
                if (--mutex === 0) {
                    return callback(null, model);
                }
                continue;
            }

            // 若 relation 个数不为 0，则退出 getRelationGroupAndRelation 任务，同时加入所有 relation 之下的任务（原子性得到保证）
            mutex += relationArrayLen - 1;

            for (var i = 0; i < relationArrayLen; i++) {
                individualModel.getRelationProperty(projectID, user, rlg, ObjectID(relationArray[i]), function (err, relationGroupName, relationId, propertySet) {

                    //console.log('relationId', relationId);
                    //console.log('relationId.toString()', relationId.toString());
                    //console.log('propertySet', propertySet);
                    //console.log('model[1]', model[1]);
                    model[1][relationGroupName][0][relationId.toString()] = [propertySet];

                    if (--mutex === 0) {
                        console.log("return 4");
                        return callback(err, model);
                    }
                });
            }
        }
    });
}

var individualModel = {
    getClassSet: function(projectID, user, classNameToId, callback) {
        //获取classId,className和class的attributeOrder
        var filter = {
            projectID : projectID,
            user : user,
            type : 'class'
        };
        //获取className和attributeOrder
        dbOperation.get("conceptDiag_order",filter,function(err,docs){
            var classSet = {};
            var classNameArray = [];
            docs.forEach(function(element){
                classNameArray.push(element.identifier);
                classSet[element.identifier] = {order:element.order};
            });

            var filter2 = {
                projectID : projectID,
                user : user,
                "relation":{
                    "direction": '',
                    "attribute": 'className'
                },
                "target": {"$in":classNameArray}
            }
            dbOperation.get("conceptDiag_edge",filter2,function(err,docs){
                docs.forEach(function(element){
                    classSet[element.target]["classId"] = element.source;
                    classNameToId[element.target] = {id: element.source, attribute: {}};  // 提取name到id的映射，并为其中attribute的映射开辟空间
                });
                return callback(classSet);
            });
        });
    },

    getAttribute: function (projectID, user, item, classId, attributeNameToId, callback) {
        var filter = {
            projectID: projectID,
            user: user
        }
        //找到所有与class相关的可能作为attribute的relation节点
        var relationFilter = new Merge(filter, {
            relation : {
                direction: '0',
                attribute: 'class'
            },
            target: classId
        });
        dbOperation.get("conceptDiag_edge", relationFilter ,function (err, docs) {

            var relationArray = [];
            docs.forEach(function(element){
                // attribute or relation
                relationArray.push(element.source);
            });

            // find attribute ones
            var relationFilter = new Merge(filter,{
                "source":{"$in":relationArray},
                relation:{
                    direction: '1',
                    attribute: 'isAttribute'
                },
                "target": '1'
            });

            dbOperation.get("conceptDiag_edge", relationFilter, function (err, docs) {

                var attributeArray = [];
                docs.forEach(function(element){
                    attributeArray.push(element.source);  // direction 默认为1
                });
                return callback(item, attributeArray, attributeNameToId);
            })
        });
    },

    getAttributeProperty: function (projectID, user, attributeId, callback) {
        var filter = {
            projectID: projectID,
            user: user,
            "source":attributeId,
            "relation.direction": '1'
        }

        //find attributeProperty
        dbOperation.get("conceptDiag_edge",filter,function(err,docs){
            var property = {};

            docs.forEach(function(element){
                property[element.relation.attribute] = element.target;
            });

            if(property["class"] != undefined){
                class_.getName(projectID, user, property["class"],function(className){
                    if(className != null) property["class"]  = className;
                    return callback(attributeId,property);
                })
            }
        });
    },


    getRelationGroupAndRelation: function (projectID, user, callback) {
        var filter = {
            projectID : projectID,
            user : user,
            type : 'relation_group'
        }

        // 获取所有的 relation group 的name，以及其中所有 relation 的 id
        dbOperation.get("conceptDiag_order", filter, function (err, docs) {
            if (err) {
                return callback(err, null);
            }
            var relationGroupSet = {};

            docs.forEach(function (element) {
                relationGroupSet[element.identifier] = [];  // relationGroupSet[element.identifier][0] 的位置被预留
                relationGroupSet[element.identifier][0] = {};
                relationGroupSet[element.identifier][1] = {
                    order: element.order
                };
            });

            return callback(err, relationGroupSet);
        });
    },

    getRelationProperty: function (projectID, user, relationGroupName, relationId, callback) {
        var filter = {
            projectID: projectID,
            user: user,
            source: relationId
        };

        dbOperation.get("conceptDiag_edge", filter, function (err, docs) {
            if (err) {
                return callback(err, null);
            }
            var propertySet = {};

            docs.forEach(function (element) {
                var propertyName = element.relation.attribute;  // 这里缺少 name 和 type，需要从另外获取
                var direction = ('0' === element.relation.direction) ? 0 : 1;
                var propertyValue = element.target;

                // 若有表示relation类型的edge，则记录类型
                if ('isAssociation' === propertyName) {
                    propertySet['type'] = [];
                    propertySet['type'][0] = 'Association';

                } else if ('isComposition' === propertyName) {
                    propertySet['type'] = [];
                    propertySet['type'][0] = 'Composition';

                } else if ('isAggregation' === propertyName) {
                    propertySet['type'] = [];
                    propertySet['type'][0] = 'Aggregation';

                } else {  // 若不是表示relation类型的edge，则正常记录property
                    if (propertySet[propertyName] === void 0) {
                        propertySet[propertyName] = [];
                    }
                    propertySet[propertyName][direction] = propertyValue;
                }
            });

            // 获取 name
            filter = {
                _id: relationId,
                projectID: projectID,
                user: user
            };

            dbOperation.get("conceptDiag_vertex", filter, function (err, docs) {
                if (err) {
                    return callback(err, null);
                }
                if (propertySet['type'] === void 0) {  // 若 propertySet['type'] 未定义，则说明类型不是edge中可能有的那3种
                    propertySet['type'] = [];
                    propertySet['type'][0] = 'Generalization';  // 不是那3种，就是这一种了
                }

                propertySet['type'][1] = docs[0].name ? docs[0].name : '';  // 在前端模型中，name 存储在 ‘type’ 中

                class_.getName(projectID, user, ObjectID(propertySet["class"][0]),function(className0){
                    propertySet["class"][0] = className0;

                    class_.getName(projectID, user, ObjectID(propertySet["class"][1]),function(className1){
                        propertySet["class"][1] = className1;

                        return callback(err, relationGroupName, relationId, propertySet);
                    })
                })

            });
        });
    },

    transAttribute: function(attributeSet){
        var newAttributeSet = {};
        var banList = {'isAttribute':{},'role':{}};
        for(var key in attributeSet){
            var attributeName = attributeSet[key][0]['role'];
            newAttributeSet[attributeName] = [{}];
            for(var subkey in attributeSet[key][0]){
                if(banList[subkey]) continue;
                newAttributeSet[attributeName][0][subkey] = attributeSet[key][0][subkey];
            }
        }
        return newAttributeSet;
    }
}

/**
 *  add, delete, revise
 */

var class_ = {
    getName: function(projectID, user, classId, callback){
        var filter = {
            projectID: projectID,
            user:user
        }
        //找到包含className的边，其边的source为classId
        var classFilter = new Merge(filter,{
            "relation":{
                "direction": '',
                "attribute": 'className'
            },
            "source": classId
        });
        dbOperation.get("conceptDiag_edge",classFilter,function(err,docs){
            var className = null;
            if(docs){
                if(docs[0]) className=docs[0].target;
            }
            return callback(className);
        });
    },
    getId: function(projectID, user, className, callback){
        var filter = {
            projectID: projectID,
            user:user
        }
        //找到包含className的边，其边的source为classId
        var classFilter = new Merge(filter,{
            "relation":{
                "direction": '',
                "attribute": 'className'
            },
            "target": className
        });
        dbOperation.get("conceptDiag_edge",classFilter,function(err,docs){
            var classId = null;
            if(docs){
                if(docs[0]) classId=docs[0].source;
            }
            return callback(classId);
        });
    },
    createId: function(projectID, user, className, callback){
        //创建class的节点
        //尝试找到包含className的所有节点
        var filter = {
            projectID: projectID
        }
        //找到包含className的边，其边的source为classId
        var classNameFilter = new Merge(filter,{
            "relation":{
                "direction": '',
                "attribute": 'className'
            },
            "target": className
        });
        dbOperation.get("conceptDiag_edge",classNameFilter,function(err,docs){

            //筛选出其中未被当前user使用的节点
            var classIdArray = [];
            var refSet = {};
            docs.forEach(function(element){
                classIdArray.push(element.source);
                refSet[element.source] = element.user.length;
            });

            var classIdFilter = new Merge(filter,{
                "_id":{"$in":classIdArray},
                "user":{"$nin":[user]},
                "type":"class"
            });
            dbOperation.get("conceptDiag_vertex", classIdFilter, function (err, docs){
                //对于所有可能的classId，找到使用className做多的一个点。
                // TODO 此处存在疑问，具体应该暂存className数量最多，还是所占比例最多。此处采用数量最多。基于前提是任意一个className已经找到了最合适的classId点
                var maxRef = -1;
                var classId;
                docs.forEach(function(element){
                    if(refSet[element._id] > maxRef){
                        classId = element._id;
                        maxRef =  refSet[element._id];
                    }
                });

                if(classId != undefined){
                    var dataSet = {
                        'collection': "conceptDiag_vertex",
                        'projectID': projectID,
                        '_id': classId,
                        'user':user,
                        "type":"class"
                    };
                    //TODO 此save函数存在问题
                    saveData(dataSet,function(err,result){
                        return callback(classId);
                    });
                }
                else{
                    //如果不存在合适的节点，则返回新增节点
                    var dataSet = {
                        projectID: projectID,
                        user: [user],
                        "type":"class"
                    };
                    dbOperation.forceToCreate("conceptDiag_vertex",dataSet,function(err,docs){
                        return callback(docs[0]._id);
                    })
                }
            });
        });
    },
    add : function(projectID,user,className,type,classId,callback){
        //首先创建class vertex
        //this.createId(projectID, user, className, function(classId){
            //创建子信息
            var dateSetBase = {
                projectID: projectID,
                user: user
            };

            var errs = null;
            var mutex = 0;

            //save className
            mutex ++;
            var dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': classId,
                'target': className,
                'relation':{
                    'direction': '',  // 不是连在relationship两端的edge，因此direction是空串
                    'attribute':'className'
                }
            });;
            saveData(dataSet,function(err,doc){
                errs = ErrUpdate(errs,err);
                if(--mutex === 0) return callback(errs);
            });

            //save class edge (type of class)
            mutex ++;
            if (type) {
                var dataSet = new Merge(dateSetBase,{
                    'collection': "conceptDiag_edge",
                    'source': classId,
                    'target': type,
                    'relation':{
                        'direction': '',  // 不是连在relationship两端的edge，因此direction是空串
                        'attribute':'classType'
                    }
                });
                saveData(dataSet,function(err,doc){
                    errs = ErrUpdate(errs,err);
                    if(--mutex === 0) return callback(errs);
                })
            }

            // 为 class 中 attribute 的顺序数组开辟 document
            mutex ++;
            var dataSet4Order = {};
            dataSet4Order.collection = 'conceptDiag_order';
            dataSet4Order.filter = {
                projectID: projectID,
                user: user,
                type: 'class',
                identifier: className
            };
            dataSet4Order.updateData = {
                order: []
            };
            updateData(dataSet4Order,function(err,doc){
                errs = ErrUpdate(errs,err);
                //console.log('attribute order [] updated');
                if(--mutex === 0) return callback(errs);
            });
        //});
    },

    delete: function(projectID,user,className,callback){
        //首先获取classId
        this.getId(projectID,user,className,function(classId){
            if(classId == null) return; //TODO return what?
            var dateSetBase = {
                projectID: projectID,
                user: user
            };
            var errs = null;
            var mutex = 0;

            //删除vertex
            mutex++;
            var dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_vertex",
                '_id': classId
            });
            deleteData(dataSet,function(err,doc){   //TODO 这是属于哪个集合啊？
                errs = ErrUpdate(errs,err);
                if(--mutex === 0) return callback(errs);
            });


            //TODO 由于前台提示了删除哪些属性，所以不需要进行属性删除？？？
            //删除value
            mutex ++;
            dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': classId
            });
            deleteData(dataSet,function(err,doc){
                errs = ErrUpdate(errs,err);
                if(--mutex === 0) return callback(errs);
            });

            // 删除该 class 的 order TODO: 此处没参与序列化，不安全。
            mutex ++;
            var filter4Delete = {
                projectID: projectID,
                user: user,
                type: 'class',
                identifier: className
            };
            dbOperation.delete('conceptDiag_order', filter4Delete, function (err, doc) {
                errs = ErrUpdate(errs,err);
                if (--mutex === 0) return callback(errs);
            });
        })
    },

    revise:function(projectID,user,oldClassName,newClassName,callback){
        //class的revise的含义：修改 class name
        this.getId(projectID,user,oldClassName,function(classId){
            var dateSetBase = {
                projectID: projectID,
                user: user
            };
            var errs = null;
            var mutex = 0;

            //删除旧name
            var oldDataSet4Edge = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': classId,
                'target': oldClassName,
                'relation':{
                    'direction': '',  // 不是连在relationship两端的edge，因此direction是空串
                    'attribute':'className'
                }
            });
            deleteData(oldDataSet4Edge,function(err,doc){
                errs = ErrUpdate(errs,err);
                if(--mutex === 0) return callback(errs);
            });

            //添加新name
            var newDataSet4Edge = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': classId,
                'target': newClassName,
                'relation':{
                    'direction': '',  // 不是连在relationship两端的edge，因此direction是空串
                    'attribute':'className'
                }
            });
            saveData(newDataSet4Edge,function(err,doc){
                errs = ErrUpdate(errs,err);
                if(--mutex === 0) return callback(errs);
            })


            // revise order of attribute
            mutex ++;
            var dataSet4Order = {};
            dataSet4Order.collection = 'conceptDiag_order';
            dataSet4Order.filter = {
                projectID: projectID,
                user: user,
                type: 'class',
                identifier: oldClassName
            };
            dataSet4Order.updateData = {
                identifier: newClassName
            };
            updateData(dataSet4Order,function(err,doc){
                errs = ErrUpdate(errs,err);
                //console.log('attribute order [] updated');
                if(--mutex === 0) return callback(errs);
            });
        });
    }
}

var attribute = {
    getId: function(projectID, user, className, attributeName, callback){
        class_.getId(projectID, user, className, function(classId){
            individualModel.getAttribute(projectID, user, null, classId, null, function(item,attributeIdArray){
                // 找到className，attributeName同时存在的关系Relation (有可能是非属性关系)
                var relationFilter = {
                    projectID : projectID,
                    user: user,
                    'source':  {"$in":attributeIdArray},
                    "relation":{
                        "direction":'1',
                        "attribute": 'role'
                    },
                    "target": attributeName  // 关键
                };

                //找到其中名字对应的
                dbOperation.get("conceptDiag_edge",relationFilter,function(err,docs){
                    // 找到此关系中属于属性的关系 (唯一)
                    var attributeId;  // attribute应该只有一个否则存在问题
                    if(docs.length === 1) attributeId = docs[0].source;
                    return callback(attributeId);  // TODO: 需要在第一个参数处加入err
                })
            })
        });
    },
    createId: function(projectID, user, className, attributeName, callback){
        var filter = {
            projectID: projectID,
            "user":{"$nin":[user]}
        };
        //为空如何处理??
        class_.getId(projectID, {"$nin":[]}, className, function(classId){
            console.log("classId: "+classId);

            //找到所有与class相关的可能作为attribute的relation节点
            var relationFilter = new Merge(filter, {
                target: classId,
                relation : {
                    direction: '0',
                    attribute: 'class'
                }
            });
            dbOperation.get("conceptDiag_edge", relationFilter ,function (err, docs) {

                //寻找所有当前user未使用的节点
                var relationIdArray = [];
                docs.forEach(function(element){
                    relationIdArray.push(element.source);
                });
                var relationIdFilter = new Merge(filter,{
                    "_id":{"$in":relationIdArray},
                    "type":"association"
                });
                dbOperation.get("conceptDiag_vertex", relationIdFilter, function (err, docs){

                    //找到对该name的引用次数
                    var relationIdArray = [];
                    docs.forEach(function(element){
                        relationIdArray.push(element._id);
                    });
                    var attributeNameFilter = new Merge(filter,{
                        "source":{"$in":relationIdArray},
                        "relation":{
                            "direction": '1',
                            "attribute": 'role'
                        },
                        "type": "association",
                        "target": attributeName
                    });

                    dbOperation.get("conceptDiag_edge",attributeNameFilter,function(err,docs){
                        //对于所有可能的relationId，找到使用attributeName做多的一个点。
                        // TODO 此处存在疑问，具体应该暂存attributeName数量最多，还是所占比例最多。此处采用数量最多。基于前提是任意一个attributeName已经找到了最合适的relationId点
                        var maxRef = -1;
                        var attributeId;
                        docs.forEach(function(element){
                            if(element.user.length > maxRef){
                                attributeId = element.source;
                                maxRef =  element.user.length;
                            }
                        });
                        if(attributeId != undefined){
                            var dataSet = {
                                'collection': "conceptDiag_vertex",
                                'projectID': projectID,
                                '_id': attributeId,
                                'user':user,
                                "type":"association"
                            };
                            saveData(dataSet,function(err,result){
                                if(result){
                                    return callback(attributeId);
                                }else{
                                    return callback(null);
                                }

                            });
                        }
                        else{
                            //如果不存在合适的节点，则返回新增节点
                            var dataSet = {
                                projectID: projectID,
                                user: [user],
                                "type":"association"
                            };
                            dbOperation.forceToCreate("conceptDiag_vertex",dataSet,function(err,docs){
                                return callback(docs[0]._id);
                            })
                        }
                    });
                });
            });
        });
    },
    add : function(projectID,user,className,attributeName,attributeId,callback){
        var errs = null;
        var mutex = 0;
        //this.getId(projectID,user,className,attributeName,function(attributeId){
        //    if(attributeId != undefined)  return callback("Aleady Exists",null);
            //not exist
        //    attribute.createId(projectID, user, className, attributeName,function(attributeId){

                //建立类到属性的连线
                mutex ++;
                class_.getId(projectID, user, className, function(classId){
                    var newDataSet = {
                        'projectID': projectID,
                        'user': user,
                        'collection': "conceptDiag_edge",
                        'source': attributeId,
                        'relation':{
                            direction: '0',
                            attribute: 'class'
                        },
                        'target':classId
                    };
                    saveData(newDataSet,function(err,doc){
                        errs = ErrUpdate(errs,err);
                        if(--mutex === 0) return callback(errs);
                    });
                });

                //save attribute edges
                mutex ++;
                attributeProperty.add(projectID,user,attributeId,'isAttribute','1',function(){
                    if(--mutex === 0) return callback(errs);
                });
                mutex ++;
                attributeProperty.add(projectID,user,attributeId,'role',attributeName,function(){
                    if(--mutex === 0) return callback(errs);
                });
        //    });
        //});
    },

    delete: function(projectID,user,className,attributeName,callback){
        //find Attirubte
        this.getId(projectID,user,className,attributeName,function(attributeId){
            if(attributeId == undefined)  return callback("Not Exists");  // TODO: getId 的回调函数增加err后，这里也要改动。
            var dateSetBase = {
                projectID: projectID,
                user: user
            };
            //delete attribute vertex
            var dataSet = new Merge(dateSetBase,{
                'collection': 'conceptDiag_vertex',
                '_id': attributeId
            });
            var errs = null;
            var mutex = 0;
            mutex++;
            deleteData(dataSet,function(err,doc){
                errs = ErrUpdate(errs,err);
                if(--mutex === 0) return callback(errs);
            });

            //delete attribute edges
            mutex++;
            dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': attributeId
            });

            deleteData(dataSet,function(err,doc){
                errs = ErrUpdate(errs,err);
                if(--mutex === 0) return callback(errs);
            });
        });
    },

    revise:function(projectID,user,className,oldAttributeName,newAttributeName,callback){

        // Attribute 的修改就是更改其 property 的 name（数据库中是 role）
    }
}

var attributeProperty = {
    add: function (projectID, user, attributeId, propertyName, propertyValue, callback) {

        // 由于 role 特性的存在，不需要存储 name 特性
        if ('name' === propertyName) {
            return callback(null);
        }

        // attribute 的 type 在底层数据库中是以 class 的形式存在的
        if ('type' === propertyName) {
            propertyName = 'class';
            class_.getId(projectID, user, propertyValue, function(classId){
                if(classId != undefined)    propertyValue = classId;
                var dataSet = {
                    projectID: projectID,
                    user: user,
                    collection: "conceptDiag_edge",
                    source: attributeId,
                    relation:{
                        direction:'1',
                        attribute:propertyName
                    },
                    target:propertyValue
                };

                saveData(dataSet,function(err,doc){
                    return callback(err);
                });
            });
        }else{
            var dataSet = {
                projectID: projectID,
                user: user,
                collection: "conceptDiag_edge",
                source: attributeId,
                relation:{
                    direction:'1',
                    attribute:propertyName
                },
                target:propertyValue
            };

            saveData(dataSet,function(err,doc){
                return callback(err);
            });
        }
    },

    delete: function (projectID, user, attributeId, propertyName, callback) {

        // attribute 的 type 在底层数据库中是以 class 的形式存在的
        if ('type' === propertyName) {
            propertyName = 'class';
        }

        var dataSet = {
            projectID: projectID,
            user: user,
            collection: "conceptDiag_edge",
            source: attributeId,
            relation:{
                direction:'1',
                attribute:propertyName
            }
        };
        deleteData(dataSet,function(err,doc){
            return callback(err);
        });
    },

    revise: function (projectID, user, attributeId, propertyName, newPropertyValue, callback) {
        var errs = null;

        this. delete(projectID, user, attributeId, propertyName, function(err){
            errs = ErrUpdate(errs, err);

            this.add(projectID, user, attributeId, propertyName, newPropertyValue, function(err){
                errs = ErrUpdate(errs, err);
                return callback(errs);
            })
        });
    }
}

var relationGroup = {
    add: function (projectID, user, relationGroupName, callback) {
        var dataSet = {};
        dataSet.collection = 'conceptDiag_order';
        dataSet.filter = {
            projectID: projectID,
            user: user,
            type: 'relation_group',
            identifier: relationGroupName
        };
        dataSet.updateData = {
            order: []  // 以空数组初始化
        };

        updateData(dataSet, function (err, doc) {
            return callback(err, doc);
        });
    },

    delete: function (projectID, user, relationGroupName, callback) {

        // 获取 relationGroup 下包含的全部 relation 的 id
        var filter = {
            projectID: projectID,
            user: user,
            type: 'relation_group',
            identifier: relationGroupName
        };

        dbOperation.get('conceptDiag_order', filter, function (err, docs) {
            if (err) {
                return callback(err, null);
            }
            var relationIds = docs[0].order;

            var mutex = relationIds.length + 1;

            // 删除该 relationGroup 的 order
            var filter4Delete = {
                projectID: projectID,
                user: user,
                type: 'relation_group',
                identifier: relationGroupName
            };

            dbOperation.delete('conceptDiag_order', filter4Delete, function (err, doc) {
                if (--mutex === 0) return callback(err, doc);
            });

            if (0 === relationIds.length) {
                if (mutex === 0) return callback(null, null);  // 当rlg中没有relation时，不必mutex减一，因为这里没有任务被执行了
            }

            // 删除所有集合中的 relation  TODO: 此处没参与序列化，不安全。
            relationIds.forEach(function (relationId) {
                relation.delete(projectID, user, ObjectID(relationId), function (err, doc) {

                    if (--mutex === 0) return callback(err, doc);
                });
            });
        });
    },

    revise: function (projectID, user, oldRlgName, newRlgName, callback) {

        // 修改 relaltionGroup 的 name
        var dataSet = {};
        dataSet.collection = 'conceptDiag_order';
        dataSet.filter = {
            projectID: projectID,
            user: user,
            type: 'relation_group',
            identifier: oldRlgName
        };
        dataSet.updateData = {
            identifier: newRlgName
        };

        updateData(dataSet, function (err, doc) {
            return callback(err, doc);
        });
    }
}

var relation = {
    createId: function (projectID, user, relationId, callback) {
        //save vertex
        var dataSet = {
            _id: relationId,
            projectID: projectID,
            name: '',
            user: [user]
        };

        dbOperation.forceToCreate("conceptDiag_vertex", dataSet, function (err, docs) {

            // 直接回调，Index在ADDPOR的时候再建立，此时尚缺少type数据
            return callback(err, docs);
        });
    },
    add: function (projectID, user, relationId, callback) {
        var dataSet = {
            'collection': "conceptDiag_vertex",
            'projectID': projectID,
            '_id': relationId,
            'user':user,
            "type":"association"
        };
        //TODO 此save函数存在问题
        saveData(dataSet,function(err,result){
            return callback(err,result);
        });
    },

    delete: function(projectID,user,relationId,callback){

        //删除relation节点
        var dateSetBase = {
            projectID: projectID,
            user: user
        };

        var errs = null;
        var mutex = 0;

        //delete vertex
        mutex++;
        var dataSet = new Merge(dateSetBase, {
            'collection': "conceptDiag_vertex",
            '_id': relationId
        });
        deleteData(dataSet, function (err, doc) {
            errs = ErrUpdate(errs, err);
            if(--mutex === 0) return callback(errs);
        });

        //TODO 要根据回传的信息考虑具体要删除了什么
        //delete edge
        mutex++;
        dataSet = new Merge(dateSetBase, {
            'collection': "conceptDiag_edge",
            'source': relationId
        });
        deleteData(dataSet, function (err, doc) {
            errs = ErrUpdate(errs, err);
            if(--mutex === 0) return callback(errs);
        });
    }
}

var relationProperty = {

    add: function (projectID, user, relationId, propertyName, propertyValue, callback) {

        var errs = null;
        var mutex = 0;

        // 当 propertyName 是 type 时，特殊对待
        if ('type' === propertyName) {
            var type = propertyValue[0];
            var name = propertyValue[1];

            // 若是Association，需要增加一条edge标识其具体类型（Association、Composition or Aggregation）
            if ('Generalization' !== type) {
                mutex ++;
                var dataSet4AssoTypeEdge = {
                    projectID: projectID,
                    user: user,
                    collection: 'conceptDiag_edge',
                    source: relationId,
                    target: '1',
                    relation: {
                        direction: '1',  // 固定加在 E1 端，与 isAttribute 的位置一致
                        attribute: 'is' + type  // 'isAssociation', 'isComposition' or 'isAggregation'
                    }
                }

                saveData(dataSet4AssoTypeEdge, function (err, doc) {
                    errs = ErrUpdate(errs, err);
                    if(--mutex === 0) return callback(errs);
                });
            }

            // 更新该 relation 的 vertex 中的 name
            mutex ++;
            var dataSet4Vertex = {};
            dataSet4Vertex.collection = 'conceptDiag_vertex';
            dataSet4Vertex.filter = {
                _id: relationId,
                projectID: projectID,
                user: user
            }
            dataSet4Vertex.updateData = {
                name : name
            }

            updateData(dataSet4Vertex, function (err, doc) {
                errs = ErrUpdate(errs, err);
                if(--mutex === 0) return callback(errs);
            });

        } else if(propertyName === 'class'){
            // 添加 relation 的 property （增加 edge）
            mutex += 2;
            class_.getId(projectID, user, propertyValue[0], function(classId0){
                var dataSet4left = {
                    projectID: projectID,
                    user: user,
                    collection: "conceptDiag_edge",
                    source: relationId,
                    relation: {
                        direction: '0',
                        attribute: propertyName
                    },
                    target: classId0
                };

                saveData(dataSet4left, function (err, doc) {
                    errs = ErrUpdate(errs, err);
                    if (--mutex === 0) return callback(errs);
                });


                class_.getId(projectID, user, propertyValue[1], function(classId1){
                    var dataSet4right = {
                        projectID: projectID,
                        user: user,
                        collection: "conceptDiag_edge",
                        source: relationId,
                        relation: {
                            direction: '1',
                            attribute: propertyName
                        },
                        target: classId1
                    };

                    saveData(dataSet4right, function (err, doc) {
                        errs = ErrUpdate(errs, err);
                        if (--mutex === 0) return callback(errs);
                    });
                });
            });
        }
        else{  // 当 propertyName 不是 type 时

            // 添加 relation 的 property （增加 edge）
            mutex += 2;
            var dataSet4left = {
                projectID: projectID,
                user: user,
                collection: "conceptDiag_edge",
                source: relationId,
                relation: {
                    direction: '0',
                    attribute: propertyName
                },
                target: propertyValue[0]
            };

            saveData(dataSet4left, function (err, doc) {
                errs = ErrUpdate(errs, err);
                if (--mutex === 0) return callback(errs);
            });

            var dataSet4right = {
                projectID: projectID,
                user: user,
                collection: "conceptDiag_edge",
                source: relationId,
                relation: {
                    direction: '1',
                    attribute: propertyName
                },
                target: propertyValue[1]
            };

            saveData(dataSet4right, function (err, doc) {
                errs = ErrUpdate(errs, err);
                if (--mutex === 0) return callback(errs);
            });
        }
    },

    delete: function(projectID, user, relationId, propertyName, callback) {

        var errs = null;
        var mutex = 0;

        // 当 propertyName 是 type 时，特殊对待
        if ('type' === propertyName) {

            // 若是Association，需要删除标识其具体类型（Association、Composition or Aggregation）的 edge
            var dataSet4AssoTypeEdge = {
                projectID: projectID,
                user: user,
                collection: 'conceptDiag_edge',
                source: relationId,
                target: '1',
                relation: {
                    direction: '1',  // 固定加在 E1 端，与 isAttribute 的位置一致
                    attribute: {'$in': ['isAssociation', 'isComposition', 'isAggregation']}
                }
            }
            mutex ++;

            deleteData(dataSet4AssoTypeEdge, function (err, doc) {
                errs = ErrUpdate(errs, err);
                if(--mutex === 0) return callback(errs);
            });

            // name 的删除只在修改时出现，而修改name时相关操作都交由新建处理

        } else {  // 当 propertyName 不是 type 时

            // 删除 relation 的 property （删除 edge）
            mutex += 2;
            var dataSet4left = {
                projectID: projectID,
                user: user,
                collection: "conceptDiag_edge",
                source: relationId,
                relation: {
                    direction: '0',
                    attribute: propertyName
                }
            };

            deleteData(dataSet4left, function (err, doc) {
                errs = ErrUpdate(errs, err);
                if (--mutex === 0) return callback(errs);
            });

            var dataSet4right = {
                projectID: projectID,
                user: user,
                collection: "conceptDiag_edge",
                source: relationId,
                relation: {
                    direction: '1',
                    attribute: propertyName
                }
            };

            deleteData(dataSet4right, function (err, doc) {
                errs = ErrUpdate(errs, err);
                if (--mutex === 0) return callback(errs);
            });
        }
    }
}

var order = {
    update: function (projectID, user, orderChanges, callback) {
        var mutex = 0;
        var errs = null;

        var dataSet4C = {};
        var classes = orderChanges.classes;

        for (var class_ in classes) {
            dataSet4C.collection = 'conceptDiag_order';
            dataSet4C.filter = {
                projectID: projectID,
                user: user,
                type: 'class',
                identifier: class_
            };

            dataSet4C.updateData = {
                order: classes[class_]
            };

            mutex++;
            updateData(dataSet4C, function (err, doc) {
                mutex--;
                errs = ErrUpdate(errs, err);
                if (!mutex) return callback(errs);
            });
        }

        var dataSet4R = {};
        var relationGroups = orderChanges.relationGroups;

        for (var relationGroup in relationGroups) {
            dataSet4R.collection = 'conceptDiag_order';
            dataSet4R.filter = {
                projectID: projectID,
                user: user,
                type: 'relation_group',
                identifier: relationGroup
            };
            dataSet4R.updateData = {
                order: relationGroups[relationGroup]
            };

            mutex++;
            updateData(dataSet4R, function (err, doc) {
                mutex--;
                errs = ErrUpdate(errs, err);
                if (!mutex) return callback(errs);
            });
        }
    }
}

//DELETE = 0; SAVE = 1;  UPDATE = 2
//pool for operations
var m_flowList = [];
var flowOffset = 0;
var callbackList = [];
var flowControl = function(errs,results,callback){
    async.series([
        function(callback){
            //if(m_flowList.length == 0)  return callback(null,null);
            var dateSet = new Copy(m_flowList[0][1]);

            switch(m_flowList[0][0]){
                case 0: // DELETE
                    deleteFunc(dateSet,function(err,result){
                        errs.push(err);
                        results.push(result);
                        return callback(errs,results);
                    });
                    break;
                case 1: // SAVE
                    saveFunc(dateSet,function(err,result){
                        errs.push(err);
                        results.push(result);
                        return callback(errs,results);
                    });
                    break;
                case 2:  // UPDATE
                    updateFunc(dateSet,function(err,result){
                        errs.push(err);
                        results.push(result);
                        return callback(errs,results);
                    });
                    break;
                default:
                    errs.push(null);
                    results.push(null);
                    return callback(errs,results);
            };
        }
    ],function(errs, results){
        results = results[0];//async.series会将result放入数组中
        var x = m_flowList.shift();

        //console.log('m_flowList', m_flowList);
        //console.log('callbackList', callbackList);

        if(m_flowList.length > 0){
            flowControl(errs,results,function(errs,results){
                return callback(errs,results);
            });
        }else{
            //console.log('errs', errs, 'results', results)
            for(var i=0;i<callbackList.length;i++){
                callbackList[i](errs[i],results[i]);
            }
            callbackList = [];
            return //callback(errs,results);
        };
    });
}

//for save
var saveData = function(dataSet,callback){  // saveData在什么情况下callback？在操作序列压入list后就callback了！（第一个操作除外）
    //console.log('saveData');
    //console.log('dataSet', dataSet);
    callbackList.push(callback);
    var newSet = new Copy(dataSet);
    if(m_flowList.length == 0){
        m_flowList.push([1,newSet]);
        flowControl([],[],function(errs,results){
        });
    }else{
        m_flowList.push([1,newSet]);
    }
}

var saveFunc = function(dataSet,callback){
    var collectionName = dataSet.collection;
    delete dataSet.collection;

    var user = dataSet.user;
    delete dataSet.user;

    var filter = new Copy(dataSet);
    dbOperation.get(collectionName,filter,function(err,docs){
        if(docs.length === 0){
            //如果记录不存在则添加
            dataSet.user = [user];
            dbOperation.create(collectionName,filter,dataSet,function(err,doc){
                return callback(err,doc);
            });
        }else{
            //如果记录存在则更新用户
            dataSet = {};
            dataSet.user = user;
            dbOperation.update(collectionName,filter,{"$addToSet": dataSet},function(err,doc){
                return callback(err,doc);
            });
        }
    })
}

//for delete
var deleteData = function(dataSet,callback){
    //console.log('deleteData');
    //console.log('dataSet', dataSet);
    callbackList.push(callback);
    var newSet = new Copy(dataSet);
    //m_flowList.push([0,newSet]);
    if(m_flowList.length === 0){
        m_flowList.push([0,newSet]);
        flowControl([],[],function(errs,results){
        });
    }else{
        m_flowList.push([0,newSet]);
    }
}

var deleteFunc = function(dataSet,callback){
    var collectionName = dataSet.collection;
    delete dataSet.collection;

    var user = dataSet.user;
    delete dataSet.user;

    var filter = new Copy(dataSet);
    dbOperation.get(collectionName,filter,function(err,docs){
        if(docs.length === 0){
            //如果记录不存在则不做处理
            //console.log("not get");
            return callback(err,docs);
        }else{
            //如果记录存在则删除用户
            //console.log("delete");
            dataSet = {};
            dataSet["user"] = user;
            dbOperation.update(collectionName,filter,{"$pull": dataSet},function(err,doc){
                return callback(err,doc);
            });
        }
    })
}

//for update
var updateData = function (dataSet, callback) {
    //console.log('updateData');
    //console.log('dataSet', dataSet);
    callbackList.push(callback);
    var newSet = new Copy(dataSet);
    if(m_flowList.length == 0){
        m_flowList.push([2,newSet]);
        flowControl([],[],function(errs,results){
        });
    }else{
        m_flowList.push([2,newSet]);
    }
}

var updateFunc = function (dataSet, callback) {  // dataSet需要3个属性：collection, filter, updateData

    // 若存在则更新，若不存在则创建
    dbOperation.forceToUpdate(dataSet.collection, dataSet.filter, {'$set': dataSet.updateData}, function(err, doc) {
        //console.log('doc', doc);
        return callback(err,doc);
    });
}

/**
 * 获取 ICM 或 CCM 的统计信息
 * @type {{getIcmStat: Function, getCcmStat: Function}}
 */
var modelInfo = {
    getIcmStat: function (ccmId, user, callback) {
        var icmStat = {
            update_date: new Date()
        };
        var mutex = 2;

        var filter4C = {
            projectID: ccmId,
            user: user,
            source: 'Class'
        }

        dbOperation.count('conceptDiag_index', filter4C, function (err, class_num) {
            if (err) return callback(err, null);

            icmStat.class_num = class_num;
            if (--mutex === 0) return callback(null, icmStat);
        });

        var filter4R = {
            projectID: ccmId,
            user: user,
            source: {$in: ['Association', 'Generalization']}
        }

        dbOperation.count('conceptDiag_index', filter4R, function (err, relation_num) {
            if (err) return callback(err, null);

            icmStat.relation_num = relation_num;
            if (--mutex === 0) return callback(null, icmStat);
        });
    },

    getCcmStat: function (ccmId, callback) {
        var ccmStat = {
            update_date: new Date()
        };
        var mutex = 2;

        var filter4C = {
            projectID: ccmId,
            source: 'Class',
            user: {$not: {$size: 0}}
        }

        dbOperation.count('conceptDiag_index', filter4C, function (err, class_num) {
            if (err) return callback(err, null);

            ccmStat.class_num = class_num;
            if (--mutex === 0) return callback(null, ccmStat);
        });

        var filter4R = {
            projectID: ccmId,
            source: {$in: ['Association', 'Generalization']},
            user: {$not: {$size: 0}}
        }

        dbOperation.count('conceptDiag_index', filter4R, function (err, relation_num) {
            if (err) return callback(err, null);

            ccmStat.relation_num = relation_num;
            if (--mutex === 0) return callback(null, ccmStat);
        });
    }
};


/**
 * exports
 */
exports.getIndividualModel = getIndividualModel;
exports.class = class_;
exports.attribute = attribute;
exports.attributeProperty = attributeProperty;
exports.relationGroup = relationGroup;
exports.relation = relation;
exports.relationProperty = relationProperty;
exports.order = order;
exports.modelInfo = modelInfo;

//just for test
exports.getData = function(){
    dbOperation.get("conceptDiag_edge",{},function(err,docs){
        fs.writeFile('./graphInfo.csv',"",'utf-8',function(){})
        var docString;
        for(var i=0;i<docs.length;i++){
            if(docs[i].target == "&default") continue;

            docString = docs[i].source+",";
            docString += docs[i].target+",,,,";
            var opaque = (docs[i].user.length-1)*10;
            docString += opaque+"\r\n";
            fs.appendFile('./graphInfo.csv',docString,'utf-8',function(){})
        }
    })
}

exports.saveData = function(dataSet,callback){
    saveData(dataSet,function(){})
}