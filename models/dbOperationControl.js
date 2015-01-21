/**
 *  dbOperation flow control
 */
var dbOperation  = require('./dbOperation');
var async = require("async");
var fs = require('fs');

//copy data
var Dupli = function(dataSet){
    for(var key in dataSet){
        this[key] = dataSet[key];
    }
};

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
        var classFilter = new Dupli(filter);
        classFilter["relation.attribute"] = 'class';
        classFilter.target = className;             //找到相应的Relation
        dbOperation.get("conceptDiag_edge",classFilter,function(err,docs){
            var relationArray = [];
            docs.forEach(function(element){
                //attribute or relation
                relationArray.push(element.source);
            });
            //find attribute ones
            var relationFilter = new Dupli(filter);
            relationFilter.source = {"$in":relationArray};
            relationFilter["relation.attribute"] = 'isAttribute';
            relationFilter.target = '1';
            dbOperation.get("conceptDiag_edge",relationFilter,function(err,docs){
                //find attributes
                var attributeArray = [];
                docs.forEach(function(element){
                    attributeArray.push(element.source);    //direction 默认为1
                });
                var attributeFilter = new Dupli(filter);
                attributeFilter.source = {"$in":attributeArray};
                attributeFilter["relation.direction"] = '1';
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
            var relationFilter = new Dupli(filter);
            relationFilter.source = {"$in":relationArray};
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
        var dataSet = new Dupli(dateSetBase);
        dataSet.collection = "conceptDiag_index";
        dataSet.source = 'Class';
        dataSet.target = className;
        dataSet.relation = {direction:'',attribute:'instance'};
        saveData(dataSet,function(err,doc){});
        /*
        //save class vertex
        var dataSet = new Dupli(dateSetBase);
        dataSet.collection = "conceptDiag_vertex";
        dataSet.id = className;
        dataSet.name = className;
        saveData(dataSet,function(err,doc){})
        */
        //save class edge (type of class)
        if(type != null || type != 'normal'){
            var dataSet = new Dupli(dateSetBase);
            dataSet.collection = "conceptDiag_edge";
            dataSet.source = className;
            dataSet.target = type;
            dataSet.relation = {};
            dataSet.relation.direction = '';
            dataSet.relation.attribute = 'type';
            saveData(dataSet,function(err,doc){})
        }
    },
    delete: function(projectID,user,className,callback){
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        //delete index
        var dataSet = new Dupli(dateSetBase);
        dataSet.collection = "conceptDiag_index";
        dataSet.source = 'Class';
        dataSet.target = className;
        dataSet.relation = {direction:'',attribute:'instance'};
        deleteData(dataSet,function(err,doc){});
        /*
        //delete class vertex
        var dataSet = new Dupli(dateSetBase);
        dataSet.collection = "conceptDiag_vertex";
        dataSet.id = className;
        dataSet.name = className;
        deleteData(dataSet,function(err,doc){});
        */
        //delete edges start from class
        var dataSet = new Dupli(dateSetBase);
        dataSet.collection = "conceptDiag_edge";
        dataSet.source = className;
        deleteData(dataSet,function(err,doc){});
    },
    revise:function(projectID,user,oldClassName,newClassName,callback){
        //class的revise是什么意思
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        //revise index
        var oldDataSet = new Dupli(dateSetBase);
        oldDataSet.collection = "conceptDiag_index";
        oldDataSet.source = 'Class';
        oldDataSet.target = oldClassName;
        oldDataSet.relation = {direction:'',attribute:'instance'};
        deleteData(dataSet,function(err,doc){});
        var newDataSet = new Dupli(oldDataSet);
        newDataSet.target = newClassName;
        saveData(newDataSet,function(err,doc){});
        /*
        //revise class vertex
        var oldDataSet = new Dupli(dateSetBase);
        oldDataSet.collection = "conceptDiag_vertex";
        oldDataSet.id = oldClassName;
        oldDataSet.name = oldClassName;
        deleteData(dataSet,function(err,doc){})
        var newDataSet = new Dupli(oldDataSet);
        newDataSet.target = newClassName;
        saveData(newDataSet,function(err,doc){});
        */
        //revise edges start from class
        var oldDataSet = new Dupli(dateSetBase);
        oldDataSet.collection = "conceptDiag_edge";
        oldDataSet.source = oldClassName;
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
    add : function(projectID,user,className,attributeName,callback){
        var dateSetBase = {
            projectID: projectID,
            user: user
        };
        //save attribute vertex
        var dataSet = new Dupli(dateSetBase);
        dataSet.collection = "conceptDiag_vertex";
        dataSet.name = "";
        saveData(dataSet,function(err,doc){
            //save attribute edges
            var dataSet = new Dupli(dateSetBase);
            dataSet.collection = "conceptDiag_edge";
            dataSet.source = doc._id;
            dataSet.relation = {};
            //save edge for class
            var newDataSet = new Dupli(dataSet);
            dataSet.relation.direction = '0';
            dataSet.relation.attribute = 'class';
            dataSet.target = className;
            saveData(newDataSet,function(err,doc){});
            //save edge for isAttribute
            var newDataSet = new Dupli(dataSet);
            dataSet.relation.direction = '1';
            dataSet.relation.attribute = 'isAttribute';
            dataSet.target = 'True';
            saveData(newDataSet,function(err,doc){});
            //save edge for role
            var newDataSet = new Dupli(dataSet);
            dataSet.relation.direction = '1';
            dataSet.relation.attribute = 'role';
            dataSet.target = attributeName;
            saveData(newDataSet,function(err,doc){});
        })
    },
    delete: function(projectID,user,className,attributeName,callback){
        //find Attirubte
        this.getId(projectID,user,className,attributeName,function(attributeId){
            var dateSetBase = {
                projectID: projectID,
                user: user
            };
            //delete class vertex
            var dataSet = new Dupli(dateSetBase);
            dataSet.collection = "conceptDiag_vertex";
            dataSet._id = attributeId;
            deleteData(dataSet,function(err,doc){});

            var dataSet = new Dupli(dateSetBase);
            dataSet.collection = "conceptDiag_edge";
            dataSet.source = attributeId;
            dataSet.relation = {};
            //delete edge for class
            var newDataSet = new Dupli(dataSet);
            dataSet.relation.direction = '0';
            dataSet.relation.attribute = 'class';
            dataSet.target = className;
            deleteData(newDataSet,function(err,doc){});
            //delete edge for isAttribute
            var newDataSet = new Dupli(dataSet);
            dataSet.relation.direction = '1';
            dataSet.relation.attribute = 'isAttribute';
            dataSet.target = 'True';
            deleteData(newDataSet,function(err,doc){});
            //delete edge for role
            var newDataSet = new Dupli(dataSet);
            dataSet.relation.direction = '1';
            dataSet.relation.attribute = 'role';
            dataSet.target = attributeName;
            deleteData(newDataSet,function(err,doc){});
        });
    },
    revise:function(projectID,user,className,oldAttributeName,newAttributeName,callback){
        this.getId(projectID,user,className,oldAttributeName,function(attributeId){
            var dateSetBase = {
                projectID: projectID,
                user: user
            };
            var dataSet = new Dupli(dateSetBase);
            dataSet.collection = "conceptDiag_edge";
            dataSet.source = attributeId;
            dataSet.relation.direction = '1';
            dataSet.relation.attribute = 'role';
            dataSet.target = oldAttributeName;
            deleteData(dataSet,function(err,doc){});

            var newDataSet = new Dupli(dataSet);
            newDataSet.target = newAttributeName;
            saveData(newDataSet,function(err,doc){});
        });
    },
    getId:function(projectID,user,className,attributeName,callback){

    }
}

exports.attributeProperty = {
    add : function(projectID,user,className,attributeName,propertyName,propertyValue,callback){
        this.attribute.getId(projectID,user,className,attributeName,function(attributeId){
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
        });
    },
    delete: function(projectID,user,className,attributeName,propertyName,propertyValue,callback){
        this.attribute.getId(projectID,user,className,attributeName,function(attributeId){
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
        });
    },
    revise:function(projectID,user,className,attributeName,propertyName,oldPropertyValue,newPropertyValue,callback){
        this.attribute.getId(projectID,user,className,attributeName,function(attributeId){
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

            var newDataSet = new Dupli(dataSet);
            newDataSet.target = newPropertyValue;
            saveData(dataSet,function(err,doc){});
        });
    }
}

exports.relation = {
    add : function(){

    },
    delete: function(){

    },
    revise:function(){

    }
}

exports.relationProperty = {
    add : function(){

    },
    delete: function(){

    },
    revise:function(){

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
            var dateSet = new Dupli(m_flowList[0][1]);
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
    var newSet = new Dupli(dataSet);
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

    var filter = new Dupli(dataSet);
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
    var newSet = new Dupli(dataSet);
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

    var filter = new Dupli(dataSet);
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