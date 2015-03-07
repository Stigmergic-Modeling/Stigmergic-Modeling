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
 *  get
 */
//get individual model
exports.getIndividualModel = function(projectID,user,callback){
    var model = [{},{}];
    var mutex = 0;
    mutex++;
    individualModel.getClass(projectID,user,function(classSet){//get class
        //console.log('typeof projectID', typeof projectID);
        mutex--;
        //console.log('classSet', classSet);
        for(var key in classSet){
            //console.log(key);
            mutex++;
            individualModel.getAttribute(projectID,user,key,function(className,attributeSet){
                mutex--;
                attributeSet=individualModel.transAttribute(attributeSet);
                classSet[className][0] = attributeSet;
                //console.log('className', className);

                mutex++;
                individualModel.getAttributeOrder(projectID,user,className,function(className,order){
                    mutex--;

                    //console.log('className', className);
                    //console.log('classSet', classSet);
                    //console.log('order', order);
                    classSet[className][1] = order;

                    if(mutex>0) {;}
                    else {
                        model[0] = classSet;
                        {
                            return callback(null,model);
                        }
                    }
                });
            })
        }
    });
    mutex++;
    individualModel.getRelation(projectID,user,function(relationSet){//get relation
        mutex--;
        relationSet=individualModel.transRelation(relationSet);
        model[1] = relationSet;
        if(mutex>0) {;}
        else{
            return callback(null,model);
        }
    });
}

var individualModel = {
    getClass : function(projectID,user,callback){
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
    getAttribute : function(projectID,user,className,callback){
        var filter = {
            projectID : projectID,
            user : user
        }
        var classFilter = new Merge(filter,{
            "relation.attribute":'class',
            'target':className
        });
        dbOperation.get("conceptDiag_edge",classFilter,function(err,docs){
            var relationArray = [];
            docs.forEach(function(element){
                //attribute or relation
                relationArray.push(element.source);
            });
            //find attribute ones
            var relationFilter = new Merge(filter,{
                "source":{"$in":relationArray},
                "relation.attribute":'isAttribute',
                "target":'1'
            });
            dbOperation.get("conceptDiag_edge",relationFilter,function(err,docs){
                //find attributes
                var attributeArray = [];
                docs.forEach(function(element){
                    attributeArray.push(element.source);    //direction 默认为1
                });
                var attributeFilter = new Merge(filter,{
                    "source":{"$in":attributeArray},
                    "relation.direction":'1'
                });
                dbOperation.get("conceptDiag_edge",attributeFilter,function(err,docs){
                    //这里Attribute是以Relation为连接的一组节点
                    //按照relation的不同进行处理
                    var attributeSet = {};
                    docs.forEach(function(element){
                        if(attributeSet[element.source]==null)    attributeSet[element.source] = [{}];
                        attributeSet[element.source][0][element.relation.attribute] = element.target;
                    });
                    //此时还是以Attribute Relation的ID进行命名的
                    return callback(className,attributeSet);
                });
            })
        });
    },

    getAttributeOrder : function(projectID, user, className, callback) {
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
    getRelation : function(projectID,user,callback){
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
    transAttribute : function(attributeSet){
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
    transRelation : function(relationSet){
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
 *  add,delete,revise
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
        dataSet = new Merge(dateSetBase,{
            'collection':"conceptDiag_order",
            'type':'class',
            'identifier':className,
            'order': {
                'order': []
            }
        });

        //console.log('dataSet', dataSet);
        mutex ++;
        saveData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
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

        // delete attribute orders of this class
        dataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_order",
            'type': 'class',
            'identifier': className
        });
        mutex ++;
        deleteData(dataSet,function(err,doc){
            mutex--;
            errs = ErrUpdate(errs,err);
            if(mutex ==0) return callback(errs);
        });
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

        //revise edges start from class
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
            //console.log('get conceptDiag_edge');
            console.log('oldDataSet1', oldDataSet4Edge);
            console.log('docs', docs);
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

        // revise order of attribute
        var oldDataSet4Order = new Merge(dateSetBase,{
            'collection': "conceptDiag_order",
            'type': 'class',
            'identifier': oldClassName,
        });
        var filter4Order = new Merge(dateSetBase, {
            'identifier':oldClassName
        });

        mutex ++;
        dbOperation.get("conceptDiag_order",filter4Order,function(err,docs){

            //删除
            mutex --;
            mutex ++;
            //console.log('get conceptDiag_order');
            //console.log('oldDataSet1', oldDataSet4Order);
            //console.log('docs', docs);
            deleteData(oldDataSet4Order,function(err,doc){
                mutex--;
                errs = ErrUpdate(errs,err);
                if(mutex ==0) return callback(errs);
            });

            //新增
            docs.forEach(function(element){
                //console.log('elementOld', element);

                // 修改 element 以使其符合 saveDate 函数的参数格式
                element.identifier = newClassName;
                element.collection = 'conceptDiag_order';
                element.user = user;
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
    }
}
exports.class = class_;

var attribute = {
    getId:function(projectID,user,className,attributeName,callback){
        var filter = {
            projectID : projectID,
            user : user
        }
        //找到className存在的关系Relation
        var classFilter = new Merge(filter,{
            "relation":{
                "direction":'0',
                "attribute": 'class'
            },
            "target": className
        });
        dbOperation.get("conceptDiag_edge",classFilter,function(err,docs){
            var relationArray = [];
            docs.forEach(function(element){
                //attribute or relation
                relationArray.push(element.source);
            });
            //找到className，attributeName同时存在的关系Relation
            var relationFilter = new Merge(filter,{
                'source':  {"$in":relationArray},
                "relation":{
                    "direction":'1',
                    "attribute": 'role'
                },
                "target": attributeName
            })
            dbOperation.get("conceptDiag_edge",relationFilter,function(err,docs){
                //找到此关系中属于属性的关系
                var attributeArray = [];
                docs.forEach(function(element){
                    attributeArray.push(element.source);    //direction 默认为1
                });
                var attributeFilter = new Merge(filter,{
                    'source':  {"$in":attributeArray},
                    "relation":{
                        "direction":'1',
                        "attribute": 'isAttribute'
                    },
                    "target": '1'
                });
                dbOperation.get("conceptDiag_edge",attributeFilter,function(err,docs){
                    var attributeId;    //attribute应该只有一个否则存在问题
                    if(docs.length === 1) attributeId = docs[0].source;
                    return callback(attributeId);
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
            if(attributeId == undefined)  return callback("Not Exists");
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
        //暂不提供
        /*//对属性名的修改
        this.getId(projectID,user,className,oldAttributeName,function(attributeId){
            var dateSetBase = {
                projectID: projectID,
                user: user
            };
            //only revise role Name?
            var dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': attributeId,
                'target': oldAttributeName,
                'relation': {direction:'1',attribute:'role'}
            });
            deleteData(dataSet,function(err,doc){});

            var newDataSet = new Merge(dataSet,{'target':newAttributeName});
            saveData(newDataSet,function(err,doc){});
        });
        */
    }
}
exports.attribute = attribute;

var attributeProperty = {
    add : function(projectID,user,attributeId,propertyName,propertyValue,callback){
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
    delete: function(projectID,user,attributeId,propertyName,callback){
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
    revise:function(projectID,user,attributeId,propertyName,newPropertyValue,callback){
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
exports.attributeProperty = attributeProperty;

exports.relation = {
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
    add : function(projectID,user,relationName,type,callback){
        //仅仅添加relation节点
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        //save vertex
        var dataSet = new Merge(dateSetBase,{
            'name': relationName,
            'user': [user]
        });
        var errs = null;
        var mutex = 0;
        dbOperation.forceToCreate("conceptDiag_vertex",dataSet,function(err,docs){
            var relationId = docs[0]._id;
            //save Index
            var dataSet = new Merge(dateSetBase,{
                'collection':"conceptDiag_index",
                'source':type,
                'target': relationId,
                'relation':{direction:'',attribute:'instance'}
            });
            mutex ++;
            saveData(dataSet,function(err,doc){
                mutex--;
                errs = ErrUpdate(errs,err);
                if(mutex ==0) return callback(errs);
            });
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
    revise:function(){
        //暂不提供
    }
}

exports.relationProperty = {
    add : function(projectID,user,relationId,direction,propertyName,propertyValue,callback){
        //添加relation的Property
        var dataSet = {
            projectID: projectID,
            user: user,
            collection: "conceptDiag_edge",
            source: relationId,
            relation:{
                direction:direction,
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

//DELETE = 0; SAVE = 1;  UPDATE = 2
//pool for operations
var m_flowList = [];
var flowOffset = 0; //
var flowControl = function(errs,results,callback){
    async.series([
        function(callback){
            //if(m_flowList.length == 0)  return callback(null,null);
            var dateSet = new Copy(m_flowList[0][1]);

            switch(m_flowList[0][0]){
                case 0 ://DELETE
                    deleteFunc(dateSet,function(err,result){
                        errs.push(err);
                        results.push(result);
                        return callback(errs,results);
                    });
                    break;
                case 1 ://SAVE
                    saveFunc(dateSet,function(err,result){
                        errs.push(err);
                        results.push(result);
                        return callback(errs,results);
                    });
                    break;
                default :
                    errs.push(null);
                    results.push(null);
                    return callback(errs,results);
                    break;
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
    console.log('saveData');
    callbackList.push(callback);
    console.log('dataSet', dataSet);
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
    console.log('deleteData');
    callbackList.push(callback);
    console.log('dataSet', dataSet);
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