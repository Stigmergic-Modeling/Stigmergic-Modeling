/**
 *  collective_model
 */
var dbOperation  = require('./db_operation');
var dbOperationControl  = require('./db_operation_control');
var ObjectID = require("mongodb").ObjectID;
var async = require("async");
var fs = require('fs');

/*  -------------------------------------------------------- *
 *  recommendSet格式：
 *
 *  CLS //project
 *  ATT class
 *  POA class attribute
 *
 *  RLT relationGroup
 *  POR relationGroup relation
 *
 *  -------------------------------------------------------- */

exports.getCollectiveModel = function(projectID, callback){
    //TODO 图中关系节点，我们无法分辨attribute和relation。所以统计时是混合统计的
    var model = {class:{},relationGroup:{}};
    var mutex = 1;  // 对应 getClass 和 getRelation 这两个任务

    // 获取所有 class
    collectiveModel.getClassSet(projectID, function (classSet) {

        model.class = classSet;
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

            var item = model["class"][key]["attribute"] = {};

            // 当前已知该class的name，和所包含的attribute的name(在order中)
            // 对某个 class，获取所有 attribute

            collectiveModel.getAttributeSet(projectID, item, ObjectID(key), function (item, attributeSet, attributeUserSet, classId) {

                var attributeSetLen = Object.keys(attributeSet).length;

                if (!attributeSetLen) {
                    if (--mutex === 0) {
                        return callback(null, model);
                    }
                    return;
                }

                mutex += attributeSetLen - 1;
                for (var attributeId in attributeSet) {
                    var userArray = attributeUserSet[attributeId];
                    //获得对应attribute的Property
                    var subItem = item[attributeId] = attributeSet[attributeId];

                    collectiveModel.getAttributePropertySet(projectID, subItem, classId, ObjectID(attributeId),userArray, function(subItem, propertySet) {

                        //转换并存储
                        for(var property in propertySet) {
                            if (property == "role") {
                                subItem["name"] = propertySet[property];
                            } else if (property == "class") {
                                subItem["type"] = propertySet[property];
                            } else if (property == "isAttribute") {
                                continue;
                            } else {
                                subItem[property] = propertySet[property];
                            }
                        }

                        if (--mutex === 0) {
                            return callback(null, model);
                        }
                    });
                }
            });

            //relation部分
            var relationItem ={};
            collectiveModel.getRelationSet(projectID, item, ObjectID(key), function (item, relationSet, relationInfoSet, classId) {

                var relationSetLen = Object.keys(relationSet).length;

                if (!relationSetLen) {
                    if (--mutex === 0) {
                        return callback(null, model);
                    }
                    return;
                }

                //mutex += relationSetLen - 1;
                mutex += 1;
                var relationMutex = relationSetLen;

                relationItem[classId] = {};
                relationItem[classId]["relation"]= relationSet;

                for (var relationId in relationSet) {
                    //获得对应relation的Property
                    var subItem = relationSet[relationId];

                    collectiveModel.getRelationPropertySet(projectID, subItem, classId, ObjectID(relationId),relationInfoSet[relationId], function(subItem, propertySet) {
                        /*
                        //转换并存储
                        for(var property in propertySet) {
                            if (property == "role") {
                                subItem["name"] = propertySet[property];
                            } else if (property == "class") {
                                subItem["type"] = propertySet[property];
                            } else if (property == "isAttribute") {
                                continue;
                            } else {
                                subItem[property] = propertySet[property];
                            }
                        }
                        */
                        for(var property in propertySet) {
                            subItem[property] = propertySet[property];
                        }

                        if (--relationMutex === 0) {
                            collectiveModel.getRelationGroup(projectID, relationItem, function (relationGroupSet) {
                                model["relationGroup"] = relationGroupSet;

                                if (--mutex === 0) {
                                    return callback(null, model);
                                }
                            })
                        }
                    });
                }
            });
        }
    });
};

var collectiveModel = {
    getClassSet: function(projectID, callback) {

        //获取className和attributeOrder
        var filter = {
            projectID : projectID,
            type : 'class',
            user: { $not: { $size: 0}}  // 不提取引用用户数为0的部分
        };
        dbOperation.get("conceptDiag_vertex",filter,function(err,docs){
            var classSet = {};
            var classIdArray = [];
            docs.forEach(function(element){
                classSet[element._id]={ref:element.user.length,name:{}};
                classIdArray.push(element._id);
            });

            var filter2 = {
                projectID : projectID,
                "relation":{
                    "direction": '',
                    "attribute": 'className'
                },
                "source": {"$in":classIdArray},
                user: { $not: { $size: 0}}  // 不提取引用用户数为0的部分
            }

            dbOperation.get("conceptDiag_edge",filter2,function(err,docs){
                docs.forEach(function(element){
                    /*  上面已经开辟过了
                    if (typeof classSet[element.source] === 'undefined') {  // 开辟空间
                        classSet[element.source] = {};
                        classSet[element.source].name = {};
                    }
                    */
                    classSet[element.source].name[element.target] = {};
                    classSet[element.source].name[element.target]["ref"] = element.user.length;
                });

                return callback(classSet);
            });
        });
    },

    getAttributeSet: function (projectID, item, classId, callback) {
        var filter = {
            projectID: projectID,
            user: { $not: { $size: 0}}  // 不提取引用用户数为0的部分
        }

        //找到所有与class相关的可能作为attribute的relation节点
        var attributeFilter = new Merge(filter, {
            relation : {
                direction: '0',
                attribute: 'class'
            },
            target: classId
        });

        dbOperation.get("conceptDiag_edge", attributeFilter ,function (err, docs) {

            var attributeIdArray = [];
            docs.forEach(function(element){
                // attribute or relation
                attributeIdArray.push(element.source);
            });

            var filter = {
                projectID : projectID,
                source : {$in:attributeIdArray},
                relation : {
                    direction: '1',
                    attribute: 'isAttribute'
                },
                target : '1',
                user: { $not: { $size: 0}}
            };

            dbOperation.get("conceptDiag_edge",filter,function(err,docs){

                var attributeSet = {};
                var attributeUserSet = {};
                docs.forEach(function(element){
                    attributeSet[element.source]={ref:element.user.length,name:{}};//如果一个关系节点，引用次数为M = p(属性引用) + q（关系引用）。 此处我们统计M
                    attributeUserSet[element.source]=element.user;
                });

                return callback(item,attributeSet,attributeUserSet,classId);
            });
        });
    },

    getAttributePropertySet: function (projectID, subItem, classId, attributeId, userArray, callback) {
        var filter = {
            projectID: projectID,
            "source":attributeId,
            "relation.direction": '1',
            user: { $in: userArray}  // 不提取引用用户数为0的部分
        }

        var propertySet = {};
        dbOperation.get("conceptDiag_edge",filter,function(err,docs){
            //find attributeProperty
            docs.forEach(function(element){
                if(propertySet[element.relation.attribute] == undefined)    propertySet[element.relation.attribute] = {};
                if(propertySet[element.relation.attribute][element.target] == undefined)    propertySet[element.relation.attribute][element.target] = {};
                if(propertySet[element.relation.attribute][element.target]["ref"] == undefined) propertySet[element.relation.attribute][element.target]["ref"]=0;
                propertySet[element.relation.attribute][element.target]["ref"] += element.user.length;
            });

            return callback(subItem,propertySet);
        });
    },

    getRelationSet: function (projectID, item, classId, callback) {
        var filter = {
            projectID: projectID,
            user: { $not: { $size: 0}},  // 不提取引用用户数为0的部分
            "relation.attribute": 'class',
            target: classId
        }

        dbOperation.get("conceptDiag_edge", filter ,function (err, docs) {

            var relationIdArray = [];
            var relationInfoSet = {};
            docs.forEach(function(element){
                // relation or relation
                relationIdArray.push(element.source);
                relationInfoSet[element.source]={
                    direction : element.relation.direction,
                    user : element.user
                }
            });
            //console.log(relationInfoSet);
            var filter = {
                projectID : projectID,
                source : {$in:relationIdArray},
                relation : {
                    direction: '1',
                    attribute: 'isAttribute'
                },
                target : "1"
            };

            dbOperation.get("conceptDiag_edge",filter,function(err,docs){

                var relationSet = {};
                var relationNonUserSet = {};
                docs.forEach(function(element){
                    relationNonUserSet[element.source] = element.user;
                });

                relationIdArray.forEach(function(id){
                    if(relationNonUserSet[id] == undefined){
                        relationSet[id]={ref:relationInfoSet[id]["user"].length,name:{}};
                    }else{
                        relationInfoSet[id]["user"] = collectiveModel.complement(relationInfoSet[id]["user"],relationNonUserSet[id]);
                        var length = relationInfoSet[id]["user"].length;
                        if(length>0) relationSet[id]={ref:length};
                    }
                });

                return callback(item,relationSet,relationInfoSet,classId);
            });
        });
    },

    getRelationPropertySet: function (projectID, subItem, classId, relationId, relationInfo, callback) {

        //var direction = "0";
        //if(relationInfo.direction == "0")   direction = "1";
        var direction = relationInfo.direction
        var filter = {
            projectID: projectID,
            "source":relationId,
            "relation.direction": direction,
            user: { $in: relationInfo.user}  // 不提取引用用户数为0的部分
        }

        var propertySet = {};
        dbOperation.get("conceptDiag_edge",filter,function(err,docs){
            //find relationProperty
            docs.forEach(function(element){
                if(propertySet[element.relation.attribute] == undefined)    propertySet[element.relation.attribute] = {};
                if(propertySet[element.relation.attribute][element.target] == undefined)    propertySet[element.relation.attribute][element.target] = {};
                if(propertySet[element.relation.attribute][element.target]["ref"] == undefined) propertySet[element.relation.attribute][element.target]["ref"]=0;
                propertySet[element.relation.attribute][element.target]["ref"] += element.user.length;
            });

            if(propertySet["direction"] == undefined) propertySet["direction"]={};
            if(propertySet["direction"][direction]  == undefined) propertySet["direction"][direction]={ref:relationInfo.user.length};

            return callback(subItem,propertySet);
        });
    },

    getRelationGroup: function(projectID,classSet, callback) {
        var relationGroupSet = {};
        var mutex = 0;

        for(var classId in classSet){
        //classSet.forEach(function(classId){
            var relationSet = classSet[classId]["relation"];
            for(var relationId in relationSet){
                mutex++;

                var target = relationSet[relationId]["class"];  //另一侧class

                if(target != undefined){
                    for(var classId2 in target){
                        --mutex
                        continue;
                    }

                    var info = collectiveModel.getRelationGroupName(classId,classId2);
                    var relationGroupId = info[0];
                    var order = info[1];

                    if(relationGroupSet[relationGroupId] == undefined) relationGroupSet[relationGroupId] = {};
                    if(relationGroupSet[relationGroupId][relationId] == undefined)
                        relationGroupSet[relationGroupId][relationId]={};
                    relationGroupSet[relationGroupId][relationId][classId] = classSet[classId]["relation"][relationId];
                    relationGroupSet[relationGroupId][relationId]["ref"] = relationGroupSet[relationGroupId][relationId][classId]["ref"];
                    //获得relation的name和type
                    collectiveModel.getRelationNameAndType(projectID, ObjectID(relationId), relationGroupSet[relationGroupId][relationId] ,function(relation){
                        if(--mutex==0) return callback(relationGroupSet);
                    });
                }
            }
        };
    },

    getRelationNameAndType: function(projectID,relationId,item,callback){
        item["name"] = {};
        item["type"] = {};
        var mutex = 5;

        var filterName = {
            projectID: projectID,
            "source":relationId,
            "relation.attribute": "name"
        };
        dbOperation.get("conceptDiag_edge",filterName,function(err,docs){
            //find relationProperty
            docs.forEach(function(element){
                item["name"][element.target] = {ref: element.user.length};
            });

            if(--mutex == 0) return callback(item);
        });

        var filterType1 = {
            projectID: projectID,
            "source":relationId,
            "relation.attribute": "isAssociation"
        };
        dbOperation.get("conceptDiag_edge",filterType1,function(err,docs){
            //find relationProperty
            docs.forEach(function(element){
                item["type"]["isAssociation"] = {ref: element.user.length};
            });
            if(--mutex == 0) return callback(item);
        });

        var filterType2 = {
            projectID: projectID,
            "source":relationId,
            "relation.attribute": "isComposition"
        };
        dbOperation.get("conceptDiag_edge",filterType2,function(err,docs){
            //find relationProperty
            docs.forEach(function(element){
                item["type"]["isComposition"] = {ref: element.user.length};
            });
            if(--mutex == 0) return callback(item);
        });

        var filterType3 = {
            projectID: projectID,
            "source":relationId,
            "relation.attribute": "isAggregation"
        };
        dbOperation.get("conceptDiag_edge",filterType3,function(err,docs){
            //find relationProperty
            docs.forEach(function(element){
                item["type"]["isAggregation"] = {ref: element.user.length};
            });
            if(--mutex == 0) return callback(item);
        });

        var filterType4 = {
            projectID: projectID,
            "source":relationId,
            "relation.attribute": "isGeneralization"
        };
        dbOperation.get("conceptDiag_edge",filterType3,function(err,docs){
            //find relationProperty
            docs.forEach(function(element){
                item["type"]["isGeneralization"] = {ref: element.user.length};
            });
            if(--mutex == 0) return callback(item);
        });
    },

    complement: function(a,b){

        var Set = {};

        a.forEach(function(element){
            Set[element] = 1;
            b.forEach(function(element) { Set[element] = 0; });
        });

        var array = [];
        for(var key in Set){
            if(Set[key] ==1 ){
                array.push(key);
            }
        }

        return array;
    },

    getRelationGroupName: function(id0,id1){
        var name;
        var order;
        if(id0<id1) {
            name = id0+'-'+id1;
            order = 0;
        }
        else{
            name = id1+'-'+id0;
            order = 1
        }
        return [name,order];
    }
}


exports.getRecommendation = function(projectID, user, recommendSet, callback){
    // 使用递归嵌套保证 ops 的执行顺序

    (function next(index) {

        if(index < recommendSet.length){
            console.log("getRecommendation")
            var recommend = recommendSet[index];

            switch(recommend[0]){
                case "CLS":
                    recommendCLS(projectID, user, recommend, item, theCallbackFunc);
                    break;
                case "ATT":
                    recommendATT(projectID, user, recommend, item, theCallbackFunc);
                    break;
                case "POA":
                    recommendPOA(projectID, user, recommend, item, theCallbackFunc);
                    break;
                case "RLT":
                    recommendRLT(projectID, user, recommend, item, theCallbackFunc);
                    break;
                case "POR":
                    recommendPOR(projectID, user, recommend, item, theCallbackFunc);
                    break;
                default:
                    next(index+1);
                    break;
            }
        }

        var theCallbackFunc = function (err, doc) {
            console.log(err);
            console.log(doc);

            if (err) {
                return callback(err,doc);
            }
            next(index + 1);
        };

    })(0);
}


var recommendCLS = function(projectID, user, recommend, item, callback){
    //推荐Project下的Class信息

    //TODO 待修改？当前是按照名字最多来处理的。如claasName分别在两个class中引用1次和10次，则计高引用的为10
    //TODO recommend中可能包含用户已经使用过的className（因为他在其他的classId中）
    //找到当前用户未参与的class
    var filter = {
        projectID : projectID,
        user:{"$nin":[user]},
        type: 'class'
    };

    dbOperation.get("conceptDiag_vertex",filter,function(err,docs){
        var classIdSet = [];
        docs.forEach(function(element){
            classIdSet.push(element._id);
        });

        //获取他们所包含的name
        var filter2 = {
            projectID : projectID,
            source:{"$in":classIdSet},
            "relation":{
                "direction": '',
                "attribute": 'className'
            }
        }
        dbOperation.get("conceptDiag_edge",filter2,function(err,docs){

            var recommendArray = [];

            if(!err){
                //排序输出
                docs.forEach(function(element){
                    recommendArray.push([element.target,element.user.length])
                });
                recommendArray = uniqueAndSort(recommendArray);
            }

            //转换成Json格式输出
            recommendArray.forEach(function(element){
                if(item[element[0]] == undefined)   item[element[0]] = {};
                item[element[0]]["ref"] = element[1];
            });

            //console.log(recommendArray);
            //return callback(err,recommendArray);     //TODO TypeError: undefined is not a function???
        });
    });
};


var recommendATT = function(projectID, user, recommend, item, callback){
    //TODO 此处有缺陷，难以将属性与关系分离
    dbOperationControl.class.getId(projectID, user, recommend[1], function(classId){
        var filter = {
            projectID: projectID,
            user: {"$nin":[user]}
        }

        //获得该节点所关联的attribute节点（不包含当前user已经使用的）
        var relationFilter = new Merge(filter, {
            relation : {
                direction: '0',
                attribute: 'class'
            },
            target: classId
        });
        dbOperation.get("conceptDiag_edge", relationFilter ,function (err, docs) {

            var attributeArray = [];
            docs.forEach(function(element){
                attributeArray.push(element.source);  // direction 默认为1
            });

            var attributeFilter = {
                projectID : projectID,
                source:{"$in":attributeArray},
                "relation":{
                    "direction": '1',
                    "attribute": 'role'
                }
            }
            dbOperation.get("conceptDiag_edge",attributeFilter,function(err,docs){

                //排序输出
                var recommendArray = [];
                docs.forEach(function(element){
                    recommendArray.push([element.target,element.user.length])
                });
                recommendArray = uniqueAndSort(recommendArray);

                //转换成Json格式输出
                recommendArray.forEach(function(element){
                    if(item[element[0]] == undefined)   item[element[0]] = {};
                    item[element[0]]["ref"] = element[1];
                });
                //console.log(recommendArray)
                //return callback(err,recommendArray);  //TODO TypeError: undefined is not a function???
            });
        });
    });
};

var recommendPOA = function(projectID, user, recommend, item, callback){
    dbOperationControl.attribute.getId(projectID, user, recommend[1], recommend[2], function(attributeId){

        var filter = {
            projectID: projectID,
            user: user,
            source: attributeId
        };
        //TODO 为什么这里没有值？
        dbOperation.get("conceptDiag_edge",filter,function(err,docs){

            //排序输出
            var recommendSet = {};
            docs.forEach(function(element){
                var array = recommendSet[element.relation.attribute]
                if(array === undefined) array = [];
                array.push([element.target,element.user.length]);

                recommendSet[element.relation.attribute] = array;
            });
            for(var key in recommendSet){
                var propertyArray = uniqueAndSort(recommendSet[key]);
                item[key] = {};

                propertyArray.forEach(function(element){
                    if(item[key][element[0]] == undefined)   item[key][element[0]] = {};
                    item[key][element[0]]["ref"] = element[1];
                });
            }
            //console.log(recommendSet)
            //return callback(err,[recommendSet]);        //TODO TypeError: undefined is not a function???
        });

    });
};

var recommendRLT = function(projectID, user, recommend, item, callback){

    //获得ClassName对应的id
    var classSet = recommend[1].split("-");
    var classIdSet = [];
    dbOperationControl.class.getId(projectID, user, classSet[0], function(classId0){
        classIdSet[0] =  classId0;
        dbOperationControl.class.getId(projectID, user, classSet[1], function(classId1){
            classIdSet[1] =  classId1;

            //找到可能推荐的关系
            var filter = {
                projectID: projectID,
                user: {"$nin":[user]}
            }

            //获得该节点所关联的attribute节点（不包含当前user已经使用的）
            var relationFilter = new Merge(filter, {
                relation : {
                    attribute: 'class'
                },
                target: classIdSet[0]
            });
            dbOperation.get("conceptDiag_edge", relationFilter ,function (err, docs) {
                //找到第一组
                var relationSet = {};
                docs.forEach(function(element){
                    relationSet[element.source] = 1;
                });

                //从另一侧找
                var relationFilter = new Merge(filter, {
                    relation : {
                        attribute: 'class'
                    },
                    target: classIdSet[1]
                });
                dbOperation.get("conceptDiag_edge", relationFilter ,function (err, docs) {
                    //找到匹配
                    var recommendArray = [];
                    docs.forEach(function(element){
                        if(relationSet[element.source])
                            recommendArray.push([element.source,element.user.length])
                    });
                    recommendArray = uniqueAndSort(recommendArray);

                    recommendArray.forEach(function(element){
                        if(item[element[0]] == undefined)   item[element[0]] = {};
                        item[element[0]]["ref"] = element[1];
                    });
                    //return callback(err,recommendArray);                  //TODO TypeError: undefined is not a function???
                });
            });
        });
    });


};


var recommendPOR = function(projectID, user, recommend, item, callback){
    var filter = {
        collection: 'conceptDiag_edge',
        projectID: projectID,
        user: {"$nin":[user]},
        source: recommend[2]
    };

    dbOperation.get("conceptDiag_edge",filter,function(err,docs){
        //排序输出
        var recommendSet = {};
        docs.forEach(function(element){
            var array = recommendSet[element.relation.attribute]
            if(array === undefined) array = [];
            array.push([element.target,element.user.length])
        });
        for(var key in recommendSet){
            var propertyArray = uniqueAndSort(recommendSet[key]);
            item[key] = {};

            propertyArray.forEach(function(element){
                if(item[key][element[0]] == undefined)   item[key][element[0]] = {};
                item[key][element[0]]["ref"] = element[1];
            });
        }

        return callback(err,recommendSet);
    });
};


var uniqueAndSort = function(array){
    //array = [[a1,b1],[a2,b2]...]

    //TODO 比较好的，应该先删除无效的，再排序
    array.sort(function(a,b){return a[1]<b[1]?1:-1})    //由大到小排序

    var uiqueArray = [];
    var uiqueMap = {};

    for(var i=0;i<array.length;i++){
        var element= array[i]
        if(uiqueMap[element[0]] == undefined) {
            uiqueMap[element[0]]=1;
            uiqueArray.push(element)
        }
    }
    return uiqueArray;
}


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