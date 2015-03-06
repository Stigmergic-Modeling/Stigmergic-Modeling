/**
 * analyse model request from browser
 */
var dbOperationControl  = require('./db_operation_control');
var ObjectID = require("mongodb").ObjectID;
var async = require("async");

exports.modelGet = function(projectID,user,callback){
    dbOperationControl.getIndividualModel(projectID,user,function(err,result){
        return callback(err,result);
    })
}

/*  -------------------------------------------------------- *
 *  日志条目的格式：
 *
 *  增加
 *  ADD CLS class
 *  ADD RLG relationGroup
 *  ADD ATT class attribute
 *  ADD RLT relationGroup relation
 *  ADD POA class attribute property value
 *  ADD POR relationGroup relation property value
 *
 *  修改key
 *  MOD CLS classOld classNew
 *  MOD RLG relationGroupOld relationGroupNew
 *  MOD ATT class attributeOld attributeNew
 *  // MOD RLT relationGroup relationOld relationNew
 *
 *  修改value
 *  MOD POA class attribute property value
 *  MOD POR relationGroup relation property value
 *
 *  删除
 *  RMV CLS class
 *  RMV RLG relationGroup
 *  RMV ATT class attribute
 *  RMV RLT relationGroup relation
 *  RMV POA class attribute property
 *  RMV POR relationGroup relation property
 *
 *  插入order元素
 *  ODI ATT class attribute position direction
 *  ODI RLT relationGroup relation position direction
 *
 *  修改order元素名称
 *  ODE ATT class attributeOld attributeNew
 *  // ODE RLT relationGroup relationOld relationNew
 *
 *  删除order元素
 *  ODR ATT class attribute
 *  ODR RLT relationGroup relation
 *
 *  移动order元素
 *  ODM ATT class attribute position direction
 *  ODM RLT relationGroup relation position direction
 *
 *  -------------------------------------------------------- */

exports.modelOperation = function(projectID,user,dataSet,callback){
    var mutex = dataSet.length;
    var errState = null;
    for(var i=0;i<dataSet.length;i++){
        var dataItem = dataSet[i];
        console.log(dataItem);
        switch (dataItem[2]){
            case 'CLS': //class
                classOperation(projectID,user,i,dataItem,function(err,doc){
                    mutex --;
                    if(err) errState = "err";
                    if(mutex == 0) return callback(errState);
                });
                break;
            case 'RLG': //relationGroup
                break;
            case 'ATT': //class attribute
                attributeOperation(projectID,user,i,dataItem,function(err,doc){
                    mutex --;
                    if(err) errState = "err";
                    if(mutex == 0) return callback(errState);
                });
                break;
            case 'RLT': //relationGroup relation
                relationOperation(projectID,user,i,dataItem,function(err,doc){
                    mutex --;
                    if(err) errState = "err";
                    if(mutex == 0) return callback(errState);
                });
                break;
            case 'POA': //class attribute property value
                attributePropertyOperation(projectID,user,i,dataItem,function(err,doc){
                    mutex --;
                    if(err) errState = "err";
                    if(mutex == 0) return callback(errState);
                });
                break;
            case 'POR': //relationGroup relation property value
                relationPropertyOperation(projectID,user,i,dataItem,function(err,doc){
                    mutex --;
                    if(err) errState = "err";
                    if(mutex == 0) return callback(errState);
                });
                break;
            default:break;
        }
    }
}


var classOperation = function(projectID,user,order,dataItem,callback){
    switch(dataItem[1]){
        case 'ADD':
            dbOperationControl.class.add(projectID,user,dataItem[3],"normal",function(err,doc){
                return callback(err,doc);
            });
            break;
        case 'MOD':
            dbOperationControl.class.revise(projectID,user,dataItem[3],dataItem[4],function(err,doc){
                return callback(err,doc);
            });
            break;
        case 'RMV':
            dbOperationControl.class.delete(projectID,user,dataItem[3],function(err,doc){
                return callback(err,doc);
            });
            break;
    }
}

var attributeOperation = function(projectID,user,order,dataItem,callback){
    switch(dataItem[1]){
        case 'ADD':
            dbOperationControl.attribute.add(projectID,user,dataItem[3],dataItem[4],function(err,doc){
                return callback(err,doc);
            });
            break;
        case 'MOD':
            dbOperationControl.attribute.delete(projectID,user,dataItem[3],dataItem[4],function(err,doc){
                if(err) return callback(err,doc);
                else{
                    dbOperationControl.attribute.add(projectID,user,dataItem[3],dataItem[4],function(err,doc){
                        return callback(err,doc);
                    });
                }
            });
            break;
        case 'RMV':
            dbOperationControl.attribute.delete(projectID,user,dataItem[3],dataItem[4],function(err,doc){
                return callback(err,doc);
            });
            break;
    }
}

var attributePropertyOperation = function(projectID,user,order,dataItem,callback){
    dbOperationControl.attribute.getId(projectID,user,dataItem[3],dataItem[4],function(attributeId){
        switch(dataItem[1]){
            case 'ADD':
                dbOperationControl.attributeProperty.add(projectID,user,attributeId,dataItem[5],dataItem[6],function(err,doc){
                    return callback(err,doc);
                });
                break;
            case 'MOD':
                dbOperationControl.attributeProperty.revise(projectID,user,attributeId,dataItem[5],dataItem[6],function(err,doc){
                    return callback(err,doc);
                });
                break;
            case 'RMV':
                dbOperationControl.attributeProperty.delete(projectID,user,attributeId,dataItem[5],function(err,doc){
                    return callback(err,doc);
                });
                break;
        }
    });
}

var relationOperation = function(projectID,user,order,dataItem,callback){
    switch(dataItem[1]){
        case 'ADD':
            dbOperationControl.relation.add(projectID,user,null,function(err,doc){
                return callback(err,doc);
            });
            break;
        case 'RMV':
            dbOperationControl.relation.delete(projectID,user,dataItem[4],function(err,doc){
                return callback(err,doc);
            });
            break;
    }
}

var relationPropertyOperation = function(projectID,user,order,dataItem,callback){
    switch(dataItem[1]){
        case 'ADD':
            dbOperationControl.relationProperty.add(projectID,user,dataItem[4],'1',dataItem[5],dataItem[6],function(err,doc){
                return callback(err,doc);
            });
            break;
        case 'MOD':
            dbOperationControl.relationProperty.delete(projectID,user,dataItem[4],'1',dataItem[5],function(err,doc){
                if(err) return callback(err,doc);
                else{
                    dbOperationControl.attribute.add(projectID,user,dataItem[4],'1',dataItem[5],dataItem[6],function(err,doc){
                        return callback(err,doc);
                    });
                }
            });
            break;
        case 'RMV':
            dbOperationControl.attribute.delete(projectID,user,dataItem[4],'1',dataItem[5],function(err,doc){
                return callback(err,doc);
            });
            break;
    }
}

