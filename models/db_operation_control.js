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
    for(var key in newInfo){
        var tmpKey = key.split(".");
        var tmpDIr=this;
        for(var i=0;i<tmp.length;i++){
            tmpDIr = tmpDIr[tmpKey[i]];
        }
        tmpDIr = newInfo[key];
    };
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
        mutex--;
        for(var key in classSet){
            mutex++;
            individualModel.getAttribute(projectID,user,key,function(className,attributeSet){
                mutex--;
                attributeSet=individualModel.transAttribute(attributeSet);
                classSet[className][0] = attributeSet;
                if(mutex>0) {;}
                else {
                    model[0] = classSet;
                    {
                        return callback(model);
                    }
                }
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
            return callback(model);
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
        console.log(relationSet)
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
exports.class = {
    add : function(projectID,user,className,type,callback){
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        //save index
        var dataSet = new Merge(dateSetBase,{
            'collection':"conceptDiag_index",
            'source':'Class',
            'target':className,
            'relation':{direction:'',attribute:'instance'}
        });
        saveData(dataSet,function(err,doc){});

        //save class edge (type of class)
        if(type != null || type != 'normal'){
            var dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': className,
                'target': type,
                'relation':{
                    'direction': '',
                    'attribute':'type'
                }
            });
            saveData(dataSet,function(err,doc){})
        }
    },
    delete: function(projectID,user,className,callback){
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        //delete index
        var dataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_index",
            'source': 'Class',
            'target': className,
            'relation': {direction:'',attribute:'instance'}
        });
        deleteData(dataSet,function(err,doc){});

        //delete edges start from class
        var dataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_edge",
            'source': className
        });
        deleteData(dataSet,function(err,doc){});
    },
    revise:function(projectID,user,oldClassName,newClassName,callback){
        //class的revise是什么意思
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        //revise index
        var oldDataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_index",
            'source': 'Class',
            'target': oldClassName,
            'relation': {direction:'',attribute:'instance'}
        });
        deleteData(oldDataSet,function(err,doc){});
        var newDataSet = new Merge(oldDataSet,{
            'target':newClassName
        });
        saveData(newDataSet,function(err,doc){});

        //revise edges start from class
        var oldDataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_edge",
            'source': oldClassName
        });
        dbOperation.get("conceptDiag_edge",oldDataSet,function(err,docs){
            //删除
            deleteData(oldDataSet,function(err,doc){});
            //新增
            docs.forEach(function(element){
                element.source = newClassName;
                saveData(element,function(err,doc){});
            });
        });
    }
}

exports.attribute = {
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
        this.getId(projectID,user,className,attributeName,function(attributeId){
            if(attributeId != undefined)  return callback("Aleady Exists");
            var dateSetBase = {
                projectID: projectID,
                user: user
            };
            //save attribute vertex
            var dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_vertex",
                'name': ""
            });
            saveData(dataSet,function(err,doc){
                //save edge for class
                var newDataSet = new Merge(dataSet,{
                    'relation.direction': '0',
                    'relation.attribute': 'class',
                    'target':className
                });
                saveData(newDataSet,function(err,doc){});
                //save attribute edges
                this.attributeProperty.add(projectID,user,attributeId,'isAttribute','1',function(){
                });
                this.attributeProperty.add(projectID,user,attributeId,'role',attributeName,function(){
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
            var dataSet = new Merge(dateSetBase,{
                'collection': 'conceptDiag_vertex',
                '_id': attributeId
            });
            deleteData(dataSet,function(err,doc){});
            //delete attribute edges
            var dataSet = new Merge(dateSetBase,{
                'collection': "conceptDiag_edge",
                'source': attributeId,
            });
            deleteData(dataSet,function(err,doc){});
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

exports.attributeProperty = {
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
        saveData(dataSet,function(err,doc){});
    },
    delete: function(projectID,user,attributeId,propertyName,propertyValue,callback){
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
        deleteData(dataSet,function(err,doc){});
    },
    revise:function(projectID,user,attributeId,propertyName,oldPropertyValue,newPropertyValue,callback){
        var dataSet = {
            projectID: projectID,
            user: user,
            collection: "conceptDiag_edge",
            source: attributeId,
            relation:{
                direction:'1',
                attribute:propertyName
            },
            target:oldPropertyValue
        };
        deleteData(dataSet,function(err,doc){});

        var newDataSet = new Merge(dataSet,{"target":newPropertyValue});
        saveData(dataSet,function(err,doc){});
    }
}

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
            'collection': "conceptDiag_vertex",
            'name': relationName
        });
        saveData(dataSet,function(err,doc){
            var relationId = doc._id;
            //save Index
            var dataSet = new Merge(dateSetBase,{
                'collection':"conceptDiag_index",
                'source':type,
                'target': relationId,
                'relation':{direction:'',attribute:'instance'}
            });
            saveData(dataSet,function(err,doc){});
        });
    },
    delete: function(projectID,user,relationId,callback){
        //删除relation节点
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        //save vertex
        var dataSet = new Merge(dateSetBase,{
            'collection':"conceptDiag_index",
            'target': relationId,
            'relation':{direction:'',attribute:'instance'}
        });
        deleteData(dataSet,function(err,doc){});

        var dataSet = new Merge(dateSetBase,{
            'collection': "conceptDiag_vertex",
            'source': relationId
        });
        deleteData(dataSet,function(err,doc){});
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
        saveData(dataSet,function(err,doc){});
    },
    delete: function(projectID,user,relationId,direction,propertyName,propertyValue,callback){
        //删除relation的Property
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
        deleteData(dataSet,function(err,doc){});
    },
    revise:function(projectID,user,relationId,direction,propertyName,oldPropertyValue,newPropertyValue,callback){
        //修改relation的Property
        var dataSet = {
            projectID: projectID,
            user: user,
            collection: "conceptDiag_edge",
            source: relationId,
            relation:{
                direction:direction,
                attribute:propertyName
            },
            target:oldPropertyValue
        };
        deleteData(dataSet,function(err,doc){});

        var newDateSet = new Merge(dataSet,{
            target: newPropertyValue
        })
        saveData(dataSet,function(err,doc){});
    }
}

//DELETE = 0; SAVE = 1;  UPDATE = 2
//pool for operations
var m_flowList = [];
var flowControl = function(){
    //直接添加边
    async.series([
        function(callback){
            if(m_flowList.length == 0)  return callback(null,null);
            var dateSet = new Copy(m_flowList[0][1]);
            switch(m_flowList[0][0]){
                case 0 ://DELETE
                    deleteFunc(dateSet,function(err,results){
                        return callback(err,results);
                    });
                    break;
                case 1 ://SAVE
                    saveFunc(dateSet,function(err,results){
                        return callback(err,results);
                    });
                    break;
                default :
                    return callback(null,null);
                    break;
            };
        }
    ],function(err, results){
        var x = m_flowList.shift();
        if(m_flowList.length > 0) flowControl();
    });
}

//for save
var saveData = function(dataSet,callback){
    //console.log(dataSet)
    var newSet = new Copy(dataSet);
    if(flowControl.length == 0){
        m_flowList.push([1,newSet]);
        flowControl();
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
    var newSet = new Copy(dataSet);
    if(flowControl.length === 0){
        m_flowList.push([0,newSet]);
        flowControl();
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
            return callback(err,doc);
        }else{
            //如果记录存在则删除用户
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