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
            collectiveModel.getAttributeSet(projectID, item, ObjectID(key), function (item, attributeSet) {
                var attributeSetLen = Object.keys(attributeSet).length;

                if (!attributeSetLen) {
                    if (--mutex === 0) {
                        return callback(null, model);
                    }
                    return;
                }

                mutex += attributeSetLen - 1;
                for (var attribute in attributeSet) {

                    //获得对应attribute的Property
                    item[attribute] = {};

                    collectiveModel.getAttributePropertySet(projectID, item[attribute], ObjectID(attribute), function (item, propertySet) {
                        //转换并存储
                        for(var property in propertySet) {
                            if (property == "role") {
                                item["name"] = propertySet[property];
                            } else if (property == "class") {
                                item["type"] = propertySet[property];
                            } else if (property == "isAttribute") {
                                continue;
                            } else {
                                item[property] = propertySet[property];
                            }
                        }

                        if (--mutex === 0) {
                            collectiveModel.getRelationGroup(projectID, model["class"], function (relationGroupSet) {
                                model["relationGroup"] = relationGroupSet;

                                return callback(null, model);
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
                _id : {$in:attributeIdArray}
            };
            dbOperation.get("conceptDiag_vertex",filter,function(err,docs){
                var attributeSet = {};
                docs.forEach(function(element){
                    attributeSet[element._id]={ref:attributeSet.user.length,name:{}};//如果一个关系节点，引用次数为M = p(属性引用) + q（关系引用）。 此处我们统计M
                });

                return callback(item,attributeSet);
            });
        });
    },

    getAttributePropertySet: function (projectID, item, classId, attributeId, callback) {
        var filter = {
            projectID: projectID,
            "source":attributeId,
            "relation.attribute": 'class',
            "target": classId,
            user: { $not: { $size: 0}}  // 不提取引用用户数为0的部分
        }
        //find relationProperty
        dbOperation.get("conceptDiag_edge",filter,function(err,docs){
            var userList = [[],[]];

            docs.forEach(function(element){
                userList[element.relation.direction] = userList[element.relation.direction].concat(element.user) ;
            });

            var mutex = 2;
            var propertySet = {};

            //class在1侧，取0侧的属性
            var filter0 = {
                projectID: projectID,
                "source":attributeId,
                "relation.direction": '0',
                "target": classId,
                user: { $in: userList[0]}  // 不提取引用用户数为0的部分
            }
            dbOperation.get("conceptDiag_edge",filter0,function(err,docs){
                //find attributeProperty
                docs.forEach(function(element){
                    if(propertySet[element.relation.attribute] == undefined)    propertySet[element.relation.attribute] = {};
                    if(propertySet[element.relation.attribute][element.target] == undefined)    propertySet[element.relation.attribute][element.target] = {};
                    if(propertySet[element.relation.attribute][element.target]["ref"] == undefined) propertySet[element.relation.attribute][element.target]["ref"]=0;
                    propertySet[element.relation.attribute][element.target]["ref"] += element.user.length;
                });
                mutex --;
                if(mutex == 0)  return callback(item,propertySet);

            });

            //class在0侧，取1侧的属性
            var filter1 = {
                projectID: projectID,
                "source":attributeId,
                "relation.direction": '1',
                "target": classId,
                user: { $in: userList[1]}  // 不提取引用用户数为0的部分
            }
            dbOperation.get("conceptDiag_edge",filter1,function(err,docs){
                docs.forEach(function(element){
                    if(propertySet[element.relation.attribute] == undefined)    propertySet[element.relation.attribute] = {};
                    if(propertySet[element.relation.attribute][element.target] == undefined)    propertySet[element.relation.attribute][element.target] = {};
                    if(propertySet[element.relation.attribute][element.target]["ref"] == undefined) propertySet[element.relation.attribute][element.target]["ref"]=0;
                    propertySet[element.relation.attribute][element.target]["ref"] += element.user.length;
                });
                mutex --;
                if(mutex == 0)  return callback(item,propertySet);
            });
        });
    },


    getRelationGroup: function(projectID,classSet, callback) {
        var relationGroupSet = {};

        classSet.forEach(function(classId){
            var attributeSet = classSet[classId]["attribute"];
            attributeSet.forEach(function(attributeId){
                var target = attributeSet[attributeId]["type"];

                if(target != undefined){
                    var relationGroupId = collectiveModel.getRelationGroupName(classId,target);

                    if(relationGroupSet[relationGroupId] == undefined) relationGroup[relationGroupId] = {};
                    relationGroupSet[relationGroupId][classId] = classSet[classId]["attribute"][attributeId];
                }
            });
        });

        return callback(relationGroupSet);
    },
    /*
    getAttributeSet: function (projectID, item, classId, callback) {
        var filter = {
            projectID: projectID,
            user: { $not: { $size: 0}}  // 不提取引用用户数为0的部分
        }

        //找到所有与class相关的可能作为relation的relation节点
        var relationFilter = new Merge(filter, {
            relation : {
                direction: '0',
                relation: 'class'
            },
            target: classId
        });

        dbOperation.get("conceptDiag_edge", relationFilter ,function (err, docs) {

            var relationArray = [];
            docs.forEach(function(element){
                // relation or relation
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
                ///*
                var attributeSet = {};
                docs.forEach(function(element){
                    attributeSet[element.source]={ref:element.user.length};  // direction 默认为1
                    //如果一个关系节点，引用次数为M = p(属性引用) + q（关系引用）。 此处我们只统计了p
                });

                return callback(item,attributeSet);
                //*//*
                var attributeIdArray = [];
                docs.forEach(function(element){
                    attributeIdArray.push(element.source);
                });
                var filter = {
                    projectID : projectID,
                    _id : {$in:attributeIdArray}
                };
                dbOperation.get("conceptDiag_vertex",filter,function(err,docs){
                    var attributeSet = {};
                    docs.forEach(function(element){
                        attributeSet[element._id]={ref:attributeSet.user.length,name:{}};//如果一个关系节点，引用次数为M = p(属性引用) + q（关系引用）。 此处我们统计M
                    });

                    return callback(item,attributeSet);
                });
            })
        });
    },

    getAttributePropertySet: function (projectID, item, attributeId, callback) {
        var filter = {
            projectID: projectID,
            "source":attributeId,
            "relation.direction": '1',
            user: { $not: { $size: 0}}  // 不提取引用用户数为0的部分
        }

        //find attributeProperty
        dbOperation.get("conceptDiag_edge",filter,function(err,docs){
            var propertySet = {};

            docs.forEach(function(element){
                propertySet[element.relation.attribute] = {};
                propertySet[element.relation.attribute][element.target] = {};
                propertySet[element.relation.attribute][element.target]["ref"] = element.user.length;
            });

            return callback(item,propertySet);
        });
    },


    /*
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

                return callback(err, relationGroupName, relationId, propertySet);
            });
        });
    },
    */

    getRelationGroupName: function(id1,id2){
        var name;
        if(id1<id2) name = id1+'-'+id2;
        else name = id1+'-'+id2;
        return name;
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
                console.log(relationSet);

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