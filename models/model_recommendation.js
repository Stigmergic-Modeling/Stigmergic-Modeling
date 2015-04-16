/**
 *  model_recommendation
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

exports.getRecommendation = function(projectID, user, recommendSet, callback){
    // 使用递归嵌套保证 ops 的执行顺序
    (function next(index) {
        var theCallbackFunc = function (err, doc) {
            if (err) {
                return callback(err);
            }
            next(index + 1);
        };        var theCallbackFunc = function (err, doc) {
            if (err) {
                return callback(err);
            }
            next(index + 1);
        };

        if(index < recommendSet.length){
            console.log("getRecommendation")
            var recommend = recommendSet[index];

            switch(recommend[0]){
                case "CLS":
                    recommendCLS(projectID, user, recommend, theCallbackFunc);
                    break;
                case "ATT":
                    recommendATT(projectID, user, recommend, theCallbackFunc);
                    break;
                case "POA":
                    recommendPOA(projectID, user, recommend, theCallbackFunc);
                    break;
                case "RLT":
                    recommendRLT(projectID, user, recommend, theCallbackFunc);
                    break;
                case "POR":
                    recommendPOR(projectID, user, recommend, theCallbackFunc);
                    break;
                default:
                    next(index+1);
                    break;
            }
        }
    })(0);
}


var recommendCLS = function(projectID, user, recommend, callback){
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

            //排序输出
            var recommendArray = [];
            docs.forEach(function(element){
                recommendArray.push([element.target,element.user.length])
            });
            recommendArray = uniqueAndSort(recommendArray);
            return callback(recommendArray);
        });
    });
};


var recommendATT = function(projectID, user, recommend, callback){
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
                return callback(recommendArray);
            });
        });
    });
};

var recommendPOA = function(projectID, user, recommend, callback){
    dbOperationControl.attribute.getId(projectID, user, recommend[1], recommend[2], function(attributeId){
        var filter = {
            collection: 'conceptDiag_edge',
            projectID: projectID,
            user: user,
            source: attributeId
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
                recommendSet[key] = uniqueAndSort(recommendSet[key])
            }
            return callback(recommendSet);
        });

    });
};

var recommendRLT = function(projectID, user, recommend, callback){
    var classSet = recommend[1].split("-");

    var filter = {
        projectID: projectID,
        user: {"$nin":[user]}
    }

    //获得该节点所关联的attribute节点（不包含当前user已经使用的）
    var relationFilter = new Merge(filter, {
        relation : {
            attribute: 'class'
        },
        target: classSet[0]
    });
    dbOperation.get("conceptDiag_edge", relationFilter ,function (err, docs) {
        //找到第一组
        var relationSet = {};
        docs.forEach(function(element){
            relationSet[element.source] = 1;
        });

        var relationFilter = new Merge(filter, {
            relation : {
                attribute: 'class'
            },
            target: classSet[1]
        });
        dbOperation.get("conceptDiag_edge", relationFilter ,function (err, docs) {
            //找到第二组
            var relationArray = [];
            docs.forEach(function(element){
                if(relationSet[element.source])
                    relationArray.push([element.source,element.user.length])
            });
            relationArray = uniqueAndSort(relationArray);
            return callback(relationArray);
        });
    });
};


var recommendPOR = function(projectID, user, recommend, callback){
    var filter = {
        collection: 'conceptDiag_edge',
        projectID: projectID,
        user: user,
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
            recommendSet[key] = uniqueAndSort(recommendSet[key])
        }
        return callback(recommendSet);
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