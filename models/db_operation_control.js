/**
 *  dbOperation flow control
 */
var dbOperation  = require('./db_operation');
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
    var model = [{}, {}];
    var mutex = 2;  // 对应 getClass 和 getRelation 这两个任务

    // 获取所有 class
    individualModel.getClass(projectID, user, function (classSet) {

        //console.log('classSet', classSet, Object.keys(classSet).length);
        var classSetLen = Object.keys(classSet).length;

        // 若 class 个数为 0，则直接退出 getClass 任务
        if (!classSetLen) {
            if (--mutex === 0) {
                return callback(null, model);
            }
            return;
        }

        // 若 class 个数不为 0，则退出 getClass 任务，同时加入所有 class 之下的任务（原子性得到保证）
        mutex += classSetLen - 1;

        // 对每个 class
        for (var key in classSet) {
            model[0][key] = [];

            // 对某个 class，获取所有 attribute
            individualModel.getAttribute(projectID, user, key, function (className, attributeSet) {

                //console.log('attributeSet', attributeSet, Object.keys(attributeSet).length);
                var attributeSetLen = Object.keys(attributeSet).length;

                if (!attributeSetLen) {
                    model[0][className][0] = {};
                    model[0][className][1] = {'order': []};  // TODO: 这一行使 add class 时对 order 数组的初始化变得有点多余了

                    if (--mutex === 0) {
                        return callback(null, model);
                    }
                    return;
                }

                // +attributeSetLen 对应 getAttributeProperty 任务，+1 对应 getAttributeOrder 任务
                mutex += attributeSetLen;  // attributeSetLen + 1 - 1

                attributeSet = individualModel.transAttribute(attributeSet);
                model[0][className][0] = attributeSet;

                // 对某个 class，获取 attribute order 数组
                individualModel.getAttributeOrder(projectID, user, className, function (className, order) {
                    model[0][className][1] = {'order': order};

                    if (--mutex === 0) {
                        return callback(null, model);
                    }
                });

                // 对某个 class 的所有 attribute
                for (key in attributeSet) {
                    model[0][className][0][key] = [];

                    individualModel.getAttributeProperty(projectID, user, className, key, function(className, attributeName, propertySet) {
                        model[0][className][0][attributeName][0] = propertySet;

                        if (--mutex === 0) {
                            return callback(null, model);
                        }
                    });
                }
            });
        }
    });

    // get relation
    individualModel.getRelation(projectID,user,function(relationSet){

        relationSet = individualModel.transRelation(relationSet);
        model[1] = relationSet;

        if (--mutex == 0) {
            return callback(null,model);
        }
    });
}

var individualModel = {
    getClass: function(projectID,user,callback){
        var filter = {
            projectID : projectID,
            user : user,
            source : 'Class'
        };
        dbOperation.get("conceptDiag_index",filter,function(err,docs){
            var classSet = {};
            //console.log(docs);
            docs.forEach(function(element){
                classSet[element.target] = [];
            });
            return callback(classSet);
        });
    },

    getAttribute: function (projectID, user, className, callback) {
        var filter = {
            projectID: projectID,
            user: user
        }
        var classFilter = new Merge(filter, {
            target: className
        });
        classFilter['relation.direction'] = '0';  // 带“点”的查询条件不能用Merge来合并，不然会丢失“点结构”，无法进行内嵌文档查询
        classFilter['relation.attribute'] = 'class';

        dbOperation.get("conceptDiag_edge", classFilter ,function (err, docs) {
            var relationArray = [];

            //console.log('classFilter', classFilter);
            //console.log('docs',docs);

            docs.forEach(function(element){
                // attribute or relation
                relationArray.push(element.source);
            });

            // find attribute ones
            var relationFilter = new Merge(filter,{
                "source":{"$in":relationArray},
                "target":'1'
            });
            relationFilter['relation.attribute'] = 'isAttribute';

            dbOperation.get("conceptDiag_edge", relationFilter, function (err, docs) {

                // find attributes
                var attributeArray = [];
                //console.log('docs',docs);

                docs.forEach(function(element){
                    attributeArray.push(element.source);  // direction 默认为1
                });
                var attributeFilter = new Merge(filter,{
                    "source":{"$in":attributeArray}
                });
                classFilter['relation.direction'] = '1';

                dbOperation.get("conceptDiag_edge",attributeFilter,function(err,docs){

                    // 这里Attribute是以Relation为连接的一组节点
                    // 按照relation的不同进行处理
                    var attributeSet = {};
                    //console.log('docs',docs);

                    docs.forEach(function(element){
                        if(attributeSet[element.source]==null)    attributeSet[element.source] = [{}];
                        attributeSet[element.source][0][element.relation.attribute] = element.target;
                    });

                    // 此时还是以Attribute Relation的ID进行命名的
                    return callback(className,attributeSet);
                });
            })
        });
    },

    getAttributeOrder: function(projectID, user, className, callback) {
        var filter = {
            projectID: projectID,
            user: user,
            type: 'class',
            identifier: className  // name or ID
        };
        //console.log('filter', filter);
        dbOperation.get("conceptDiag_order", filter, function(err, docs) {
            //console.log('docs', docs);
            return callback(className, docs[0].order);
        });
    },

    getAttributeProperty: function (projectID, user, className, attributeName, callback) {

        attribute.getId(projectID, user, className, attributeName, function(attributeId) {
            var filter = {
                projectID: projectID,
                user: user,
                source: attributeId,
                'relation.direction': '1'
            }

            dbOperation.get("conceptDiag_edge", filter, function (err, docs) {
                var propertySet = {};

                docs.forEach(function (element) {
                    var proertyName = element.relation.attribute;

                    if ('role' === proertyName) {
                        propertySet.name = element.target;

                    } else if ('class' === proertyName) {
                        propertySet.type = element.target;

                    } else if ('isAttribute' === proertyName) {
                        // do nothing

                    } else {
                        propertySet[proertyName] = element.target;
                    }
                });

                return callback(className, attributeName, propertySet);
            });
        });
    },

    getRelation: function(projectID,user,callback){
        var filter = {
            projectID : projectID,
            user : user,
            source : {"$in":['Association','Generalization']}
        }
        dbOperation.get("conceptDiag_index",filter,function(err,docs){
            var relationArray = [];
            var relationTypeArray = {};
            docs.forEach(function(element){
                relationArray.push(element.target)
                relationTypeArray[element.target] = element.source.toLowerCase();
            });
            //查找数据
            var relationFilter = new Merge(filter,{
                'source':{"$in":relationArray}
            });
            dbOperation.get("conceptDiag_edge",relationFilter,function(err,docs){
                //找到relation数据集合
                var relationSet = {};
                docs.forEach(function(element){
                    if(relationSet[element.source] == undefined)    {
                        relationSet[element.source] = [{}];
                        relationSet[element.source][0]['type'] = relationTypeArray[element.source];
                    }
                    if(relationSet[element.source][0][element.relation.attribute] == undefined) relationSet[element.source][0][element.relation.attribute] = [];
                    relationSet[element.source][0][element.relation.attribute][element.relation.direction]= element.target;
                });
                //此时还是以Attribute Relation的ID进行命名的
                return callback(relationSet);
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
    },

    transRelation: function(relationSet){
        var newRelationSet = {};
        for(var key in relationSet){
            var relationName = relationSet[key][0]['class'];
            if(relationName[0]<relationName[1]){
                relationName = relationName[0]+'-'+relationName[1];
            }else{
                relationName = relationName[1]+'-'+relationName[0];
            }
            //这里可能有问题
            if(newRelationSet[relationName] == undefined) newRelationSet[relationName] = [{}];
            var subSet = {};
            subSet[key] = relationSet[key];
            newRelationSet[relationName] = [subSet];
        }
        return newRelationSet;
    }
}

/**
 *  add, delete, revise
 */

var class_ = {
    add : function(projectID,user,className,type,callback){
        //console.log('projectID', projectID);

        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        //console.log('typeof projectID', typeof projectID);
        //console.log('dateSetBase', dateSetBase);
        var errs = null;
        var mutex = 0;

        //save index
        var dataSet = new Merge(dateSetBase,{
            'collection':"conceptDiag_index",
            'source':'Class',
            'target':className,
            'relation':{
                direction:'',  // 不是连在relationship两端的edge，因此direction是空串(所有index的direction都是空串)
                attribute:'instance'
            }
        });

        //console.log('dataSet', dataSet);
        mutex ++;
        saveData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });

        //save class edge (type of class)
        if (type) {
            dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': className,
                'target': type,
                'relation':{
                    'direction': '',  // 不是连在relationship两端的edge，因此direction是空串
                    'attribute':'type'
                }
            });
            mutex ++;
            saveData(dataSet,function(err,doc){
                mutex--;
                errs = ErrUpdate(errs,err);
                if(mutex == 0) return callback(errs);


                })
        }

        // 为 class 中 attribute 的顺序数组开辟 document
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

        console.log('dataSet4Order', dataSet4Order);
        mutex ++;
        updateData(dataSet4Order,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            //console.log('attribute order [] updated');
            if(mutex ==0) return callback(errs);
        });
    },
    delete: function(projectID,user,className,callback){
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        var errs = null;
        var mutex = 0;
        //delete index
        var dataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_index",
            'source': 'Class',
            'target': className,
            'relation': {direction:'',attribute:'instance'}
        });
        mutex ++;
        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });

        //delete edges start from class
        dataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_edge",
            'source': className
        });
        mutex ++;
        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });

        //// delete attribute orders of this class
        //dataSet = new Merge(dateSetBase,{
        //    'collection': "conceptDiag_order",
        //    'type': 'class',
        //    'identifier': className
        //});
        //mutex ++;
        //deleteData(dataSet,function(err,doc){
        //    mutex--;
        //    errs = ErrUpdate(errs,err);
        //    if(mutex ==0) return callback(errs);
        //});
        // TODO: 优化此处

    },
    revise:function(projectID,user,oldClassName,newClassName,callback){

        //class的revise的含义：修改 class name
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        var errs = null;
        var mutex = 0;

        //revise index
        var oldDataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_index",
            'source': 'Class',
            'target': oldClassName,
            'relation': {direction:'',attribute:'instance'}
        });
        mutex ++;
        deleteData(oldDataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });
        var newDataSet = new Merge(oldDataSet,{
            'target':newClassName
        });
        mutex ++;
        saveData(newDataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });

        // TODO: 这里（更新以该 class 为源或目标的边）代码冗余太多，需要整合
        // revise edges start from class
        var oldDataSet4Edge = new Merge(dateSetBase,{
            'collection': "conceptDiag_edge",
            'source': oldClassName
        });
        var filter = new Merge(dateSetBase, {
            'source': oldClassName
        });

        mutex ++;
        dbOperation.get("conceptDiag_edge",filter,function(err,docs){

            //删除
            mutex --;
            mutex ++;
            deleteData(oldDataSet4Edge,function(err,doc){
                mutex--;
                errs = ErrUpdate(errs,err);
                if(mutex ==0) return callback(errs);
            });

            //新增
            docs.forEach(function(element){
                //console.log('elementOld', element);

                // 修改 element 以使其符合 saveDate 函数的参数格式
                element.source = newClassName;
                element.collection = 'conceptDiag_edge';
                element.user = user;  // 注意这里不能使用原数组，而应该使用user名的字符串
                delete element._id;
                delete element.lastRevise;
                //console.log('elementNew', element);

                mutex ++;
                saveData(element,function(err,doc){
                    mutex--;
                    errs = ErrUpdate(errs,err);
                    if(mutex ==0) return callback(errs);
                });
            });
        });

        // revise edges end with class
        var oldDataSet4EdgeEnd = new Merge(dateSetBase,{
            'collection': "conceptDiag_edge",
            'target': oldClassName
        });
        var filterEnd = new Merge(dateSetBase, {
            'target': oldClassName
        });

        mutex ++;
        dbOperation.get("conceptDiag_edge",filterEnd,function(err,docs){

            //删除
            mutex --;
            mutex ++;
            deleteData(oldDataSet4EdgeEnd,function(err,doc){
                mutex--;
                errs = ErrUpdate(errs,err);
                if(mutex ==0) return callback(errs);
            });

            //新增
            docs.forEach(function(element){
                //console.log('elementOld', element);

                // 修改 element 以使其符合 saveDate 函数的参数格式
                element.target = newClassName;
                element.collection = 'conceptDiag_edge';
                element.user = user;  // 注意这里不能使用原数组，而应该使用user名的字符串
                delete element._id;
                delete element.lastRevise;
                //console.log('elementNew', element);

                mutex ++;
                saveData(element,function(err,doc){
                    mutex--;
                    errs = ErrUpdate(errs,err);
                    if(mutex ==0) return callback(errs);
                });
            });
        });

        // revise order of attribute
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

        //console.log('dataSet4Order', dataSet4Order);
        mutex ++;
        updateData(dataSet4Order,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            //console.log('attribute order [] updated');
            if(mutex ==0) return callback(errs);
        });
    }
}

var attribute = {
    getId: function(projectID, user, className, attributeName, callback){
        var filter = {
            projectID: projectID,
            user: user
        }
        // 找到className存在的关系Relation (有可能是非属性关系、可能是role不是attributeName的属性关系、
        // 也有可能是该class作为类型的属性关系（可能吗？这样的class可能在E0端吗？）。这都不是我们想要的)
        var classFilter = new Merge(filter,{
            "relation":{
                "direction": '0',
                "attribute": 'class'
            },
            "target": className  // 关键
        });
        //console.log('attribute getId', 'classFilter', classFilter);
        dbOperation.get("conceptDiag_edge",classFilter,function(err,docs){
            //console.log('docs', docs);
            var relationArray = [];
            docs.forEach(function(element){
                //attribute or relation
                relationArray.push(element.source);
            });
            // 找到className，attributeName同时存在的关系Relation (有可能是非属性关系)
            var relationFilter = new Merge(filter,{
                'source':  {"$in":relationArray},
                "relation":{
                    "direction":'1',
                    "attribute": 'role'
                },
                "target": attributeName  // 关键
            })
            //console.log('attribute getId', 'relationFilter', relationFilter);
            dbOperation.get("conceptDiag_edge",relationFilter,function(err,docs){
                // 找到此关系中属于属性的关系 (唯一)
                //console.log('docs', docs);
                var attributeArray = [];
                docs.forEach(function(element){
                    attributeArray.push(element.source);  // direction 默认为1
                });
                var attributeFilter = new Merge(filter,{
                    'source':  {"$in":attributeArray},
                    "relation":{
                        "direction":'1',
                        "attribute": 'isAttribute'  // 关键
                    },
                    "target": '1'
                });
                dbOperation.get("conceptDiag_edge",attributeFilter,function(err,docs){
                    var attributeId;  // attribute应该只有一个否则存在问题
                    if(docs.length === 1) attributeId = docs[0].source;
                    return callback(attributeId);  // TODO: 需要在第一个参数处加入err
                });
            })
        });
    },
    add : function(projectID,user,className,attributeName,callback){
        var errs = null;
        var mutex = 0;
        this.getId(projectID,user,className,attributeName,function(attributeId){
            if(attributeId != undefined)  return callback("Aleady Exists",null);
            //not exist
            var dateSetBase = {
                projectID: projectID,
                user: user
            };
            //save attribute vertex
            var dataSet = new Merge(dateSetBase,{
                'name': "",
                'user': [user]
            });
            dbOperation.forceToCreate("conceptDiag_vertex",dataSet,function(err,docs){
                attributeId = docs[0]._id;
                //save edge for class
                var newDataSet = new Merge(dateSetBase,{
                    'collection': "conceptDiag_edge",
                    'source': attributeId,
                    'relation.direction': '0',
                    'relation.attribute': 'class',
                    'target':className
                });
                mutex ++;
                saveData(newDataSet,function(err,doc){
                    mutex--;
                    errs = ErrUpdate(errs,err);
                    if(mutex ==0) return callback(errs);
                });
                //save attribute edges
                mutex ++;
                attributeProperty.add(projectID,user,attributeId,'isAttribute','1',function(){
                    mutex--;
                    if(mutex ==0) return callback(errs);
                });
                mutex ++;
                attributeProperty.add(projectID,user,attributeId,'role',attributeName,function(){
                    mutex--;
                    if(mutex ==0) return callback(errs);
                });
            })
        });
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
            dataSet = new Merge(dateSetBase,{
                'collection': 'conceptDiag_vertex',
                '_id': attributeId
            });
            var errs = null;
            var mutex = 0;
            mutex++;
            deleteData(dataSet,function(err,doc){
                mutex--;
                errs = ErrUpdate(errs,err);
                if(mutex ==0) return callback(errs);
            });
            //delete attribute edges

            dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': attributeId
            });
            mutex++;
            deleteData(dataSet,function(err,doc){
                mutex--;
                errs = ErrUpdate(errs,err);
                if(mutex ==0) return callback(errs);
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
        }

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
        var errs = null;
        var mutex = 0;
        mutex++;
        saveData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });
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
            //,target:propertyValue
        };
        var errs = null;
        var mutex = 0;
        mutex++;
        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });
    },

    revise: function (projectID, user, attributeId, propertyName, newPropertyValue, callback) {

        // name 的 type 在底层数据库中是以 role 的形式存在的
        if ('name' === propertyName) {
            propertyName = 'role';
        }

        // attribute 的类型在底层数据库中是以 class 的形式存在的
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
            //,target:oldPropertyValue
        };
        var errs = null;
        var mutex = 0;
        mutex++;
        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });

        var newDataSet = new Merge(dataSet,{"target":newPropertyValue});
        mutex++;
        saveData(newDataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });
    }
}

var relationGroup = {
    add: function () {

    },

    delete: function () {

    }
}

var relation = {
    getId:function(projectID,user,className1,className2,relationType,callback){
        //不确定
        return callback(null);
        /*
        var filter = {
            projectID : projectID,
            user : user,
            source : relationType
        }
        dbOperation.get("conceptDiag_index",filter,function(err,docs){
            var relationArray = [];
            docs.forEach(function(element){
                relationArray.push(element.target)
            });
            //查找数据
            var relationFilter = new Merge(filter,{
                relation:{
                    'attribute': 'class'
                },
                'target': className1
            });
            dbOperation.get("conceptDiag_edge",relationFilter,function(err,docs){
                //找到relation数据集合
                var relationArray = [];
                docs.forEach(function(element){
                    relationArray.push(element.target)
                });
                //查找数据
                var relationFilter = new Merge(filter,{
                    relation:{
                        'attribute': 'class'
                    },
                    'target': className2
                });
                dbOperation.get("conceptDiag_edge",relationFilter,function(err,docs){
                    return callback();
                })
            });
        });
        */
    },

    add: function (projectID, user, relationId, callback) {

        //save vertex
        var dataSet = {
            _id: relationId,
            projectID: projectID,
            name: '',
            user: [user]
        };

        // TODO：这里没有序列化，Vertex和Index可能很久都没建出来：影响？
        dbOperation.forceToCreate("conceptDiag_vertex", dataSet, function (err, docs) {

            // 直接回调，Index在ADDPOR的时候再建立，此时尚缺少type数据
            return callback(err, docs);
        });
    },

    delete: function(projectID,user,relationId,callback){

        //删除relation节点
        var dateSetBase = {
            projectID: projectID,
            user: user
        };

        //delete index
        var dataSet = new Merge(dateSetBase,{
            'collection':"conceptDiag_index",
            'target': relationId,
            'relation':{direction:'',attribute:'instance'}
        });
        var errs = null;
        var mutex = 0;
        mutex++;
        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });

        //delete vertex
        dataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_vertex",
            '_id': relationId
        });
        mutex++;
        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });

        //delete edge
        dataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_edge",
            'source': relationId
        });
        mutex++;
        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });
    },

    revise: function(){
        //暂不提供
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

            // 增加 relation 的 index (Association or Generalization)
            var dataSet4Index = {
                projectID: projectID,
                user: user,
                collection: 'conceptDiag_index',
                source: 'Generalization' === type ? type : 'Association',
                target: relationId,
                relation: {
                    direction: '',  // 不是连在relationship两端的edge，因此direction是空串(所有index的direction都是空串)
                    attribute: 'instance'
                }
            };
            mutex ++;

            saveData(dataSet4Index, function (err, doc) {
                errs = ErrUpdate(errs, err);
                if(--mutex == 0) return callback(errs);
            });

            // 若是Association，需要增加一条edge标识其具体类型（Association、Composition or Aggregation）
            if ('Generalization' !== type) {
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
                mutex ++;

                saveData(dataSet4AssoTypeEdge, function (err, doc) {
                    errs = ErrUpdate(errs, err);
                    if(--mutex == 0) return callback(errs);
                });
            }

            // 更新该 relation 的 vertex 中的 name
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

            mutex ++;
            updateData(dataSet4Vertex, function (err, doc) {
                errs = ErrUpdate(errs, err);
                if(--mutex == 0) return callback(errs);
            });

        } else {  // 当 propertyName 不是 type 时

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
                if (--mutex == 0) return callback(errs);
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
                if (--mutex == 0) return callback(errs);
            });
        }
    },

    delete: function(projectID,user,relationId,direction,propertyName,callback){

        //删除relation的Property
        var dataSet = {
            projectID: projectID,
            user: user,
            collection: "conceptDiag_edge",
            source: relationId,
            relation:{
                direction:direction,
                attribute:propertyName
            }
            //,target:propertyValue
        };
        var errs = null;
        var mutex = 0;
        mutex++;
        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });
    },

    revise:function(projectID,user,relationId,direction,propertyName,newPropertyValue,callback){

        //修改relation的Property
        var dataSet = {
            projectID: projectID,
            user: user,
            collection: "conceptDiag_edge",
            source: relationId,
            relation:{
                direction:direction,
                attribute:propertyName
            }
            //,target:oldPropertyValue
        };
        var errs = null;
        var mutex = 0;
        mutex++;

        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });

        var newDateSet = new Merge(dataSet,{
            target: newPropertyValue
        })
        mutex++;

        saveData(newDateSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });
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
            updateData(dataSet4C,function(err,doc){
                mutex--;
                errs = ErrUpdate(errs,err);
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
            updateData(dataSet4R,function(err,doc){
                mutex--;
                errs = ErrUpdate(errs,err);
                if (!mutex) return callback(errs);
            });
        }

    }
}

//DELETE = 0; SAVE = 1;  UPDATE = 2
//pool for operations
var m_flowList = [];
var flowOffset = 0;
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
            console.log('errs', errs, 'results', results)
            for(var i=0;i<callbackList.length;i++){
                callbackList[i](errs[i],results[i]);
            }
            callbackList = [];
            return //callback(errs,results);
        };
    });
}

var callbackList = [];

//for save
var saveData = function(dataSet,callback){
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
        console.log('doc', doc);
        return callback(err,doc);
    });
}


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