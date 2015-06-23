/**
 * analyse model request from browser
 */
var dbOperationControl  = require('./db_operation_control');
var modelInfo = require('./model_info');
var ObjectID = require("mongodb").ObjectID;
var async = require("async");
var CCM = require('./collective_model.js');

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

exports.modelOperation = function(projectID, icmName, user, ops, orderChanges, callback){

    // 使用递归嵌套保证 ops 的执行顺序
    (function next(index) {

        //console.log('index', index);
        //console.log('ops.length', ops.length);

        // 若已执行完所有 ops，则更新模型信息
        if (index === ops.length) {

            // TODO: 这个延时是临时解决方案，因为 models/db_operation.js 中的 “线程”池 机制有问题，会导致没有执行完底层操作就回调
            setTimeout(function () {

                // 更新 icm 和 ccm 的信息
                updateModelInfo(projectID, icmName, user, function (err) {
                    if (err) {

                        return callback(err);
                    }

                    // 更新 attribute 或 relationship 的顺序
                    //console.log('orderChanges', orderChanges);
                    if (Object.keys(orderChanges.classes).length !== 0 || Object.keys(orderChanges.relationGroups).length !== 0 ) {

                        // 如果有需要更新的 order
                        orderOperation(projectID, user, orderChanges, function(err, doc){

                            return callback(err);
                        });

                    } else {
                        return callback(null);
                    }
                });


                dbOperationControl.getIndividualModel(projectID,user,function(err,result){
                    return callback(err,result);
                })

            }, 100);  // 延时100ms，尽量保证ops中所有的底层操作都已经完成（真的只是尽力而已）

            return;
        }

        var op = ops[index];
        //console.log('op', op);
        var theCallbackFunc = function (err, doc) {
            if (err) {
                return callback(err);
            }
            next(index + 1);
        };

        switch (op[2]) {
            case 'CLS':  // class
                classOperation(projectID, user, op, theCallbackFunc);
                break;

            case 'RLG':  // relationGroup
                relationGroupOperation(projectID, user, op, theCallbackFunc);
                break;

            case 'ATT':  // class attribute
                attributeOperation(projectID, user, op, theCallbackFunc);
                break;

            case 'RLT':  // relationGroup relation
                relationOperation(projectID, user, op, theCallbackFunc);
                break;

            case 'POA':  // class attribute property value
                attributePropertyOperation(projectID, user, op, theCallbackFunc);
                break;

            case 'POR':  // relationGroup relation property value
                relationPropertyOperation(projectID, user, op, theCallbackFunc);
                break;

            default:
                next(index + 1);
        }
    })(0);
}


var classOperation = function (projectID, user, dataItem, callback) {
    switch(dataItem[1]){
        case 'ADD':
            var haveId = dataItem[5];
            if(haveId == "binding"){
                var classId = ObjectID(dataItem[4]);
                dbOperationControl.class.add(projectID,user,dataItem[3],"normal",classId,function(err,doc){
                    return callback(err,doc);
                });
            }else{
                dbOperationControl.class.createId(projectID, user, dataItem[3], function(classId){
                    dbOperationControl.class.add(projectID,user,dataItem[3],"normal",classId,function(err,doc){
                        return callback(err,doc);
                    });
                });
            }
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

var attributeOperation = function (projectID, user, dataItem, callback) {
    switch(dataItem[1]){
        case 'ADD':
            var haveId = dataItem[6];
            if(haveId == "binding"){
                var attributeId = ObjectID(dataItem[5]);
                dbOperationControl.attribute.add(projectID,user,dataItem[3],dataItem[4],attributeId,function(err,doc){
                    return callback(err,doc);
                });
            }else{
                dbOperationControl.attribute.createId(projectID, user, dataItem[3],dataItem[4],function(attributeId){
                    dbOperationControl.attribute.add(projectID,user,dataItem[3],dataItem[4],attributeId,function(err,doc){
                        return callback(err,doc);
                    });
                });
            }
            break;

        case 'MOD':

            // Attribute 的修改就是更改其 property 的 name（数据库中是 role）
            return callback(null, null);
            break;

        case 'RMV':
            dbOperationControl.attribute.delete(projectID,user,dataItem[3],dataItem[4],function(err,doc){
                return callback(err,doc);
            });
            break;

        default:
            return callback(null, null);  // dataSet中所有涉及order的操作都被忽略（最后由orderOperation处理）
    }
}

var attributePropertyOperation = function (projectID, user, dataItem, callback) {

    dbOperationControl.attribute.getId(projectID, user, dataItem[3], dataItem[4], function (attributeId) {
        switch(dataItem[1]){
            case 'ADD':
                dbOperationControl.attributeProperty.add(projectID, user, attributeId, dataItem[5], dataItem[6], function (err, doc) {
                    return callback(err, doc);
                });
                break;

            case 'MOD':
                dbOperationControl.attributeProperty.revise(projectID, user, attributeId, dataItem[5], dataItem[6], function (err, doc) {
                    return callback(err, doc);
                });
                break;

            case 'RMV':
                dbOperationControl.attributeProperty.delete(projectID, user, attributeId, dataItem[5], function (err, doc) {
                    return callback(err, doc);
                });
                break;
        }
    });
}

var relationGroupOperation = function (projectID, user, dataItem, callback) {
    switch(dataItem[1]){
        case 'ADD':
            dbOperationControl.relationGroup.add(projectID, user, dataItem[3], function (err, doc) {
                return callback(err, doc);
            });
            break;

        case 'MOD':
            dbOperationControl.relationGroup.revise(projectID, user, dataItem[3], dataItem[4], function (err, doc) {
                return callback(err, doc);
            });
            break;

        case 'RMV':
            dbOperationControl.relationGroup.delete(projectID, user, dataItem[3], function (err, doc) {
                return callback(err, doc);
            });
            break;
    }
}

var relationOperation = function (projectID, user, dataItem, callback) {
    switch(dataItem[1]){
        case 'ADD':
            var haveId = dataItem[6];
            if(haveId == "binding"){
                var relationId = ObjectID(dataItem[5]);
                dbOperationControl.relation.add(projectID,user,relationId,function(err,doc){
                    return callback(err,doc);
                });
            }else{
                dbOperationControl.relation.createId(projectID, user, ObjectID(dataItem[4]), function (err, doc) {
                    return callback(err, doc);
                });
            }
            break;

        case 'RMV':
            dbOperationControl.relation.delete(projectID, user, ObjectID(dataItem[4]), function (err, doc) {
                return callback(err, doc);
            });
            break;

        default:
            return callback(null, null);  // dataSet中所有涉及order的操作都被忽略（最后由orderOperation处理）
    }
}

var relationPropertyOperation = function (projectID, user, dataItem, callback) {
    switch(dataItem[1]){
        case 'ADD':
            dbOperationControl.relationProperty.add(projectID, user, ObjectID(dataItem[4]), dataItem[5], dataItem[6], function (err, doc) {
                return callback(err, doc);
            });
            break;

        case 'MOD':
            dbOperationControl.relationProperty.delete(projectID, user, ObjectID(dataItem[4]), dataItem[5], function (err, doc) {
                if (err) {
                    return callback(err, doc);
                }

                dbOperationControl.relationProperty.add(projectID, user, ObjectID(dataItem[4]), dataItem[5], dataItem[6], function (err, doc) {
                    return callback(err, doc);
                });
            });
            break;

        case 'RMV':
            dbOperationControl.relationProperty.delete(projectID, user, ObjectID(dataItem[4]), dataItem[5], function (err, doc) {
                return callback(err, doc);
            });
            break;
    }
}

/**
 * 与 attribute 和 relation 的顺序有关的操作
 * @param projectID
 * @param user
 * @param orderChanges
 * @param callback
 */
var orderOperation = function (projectID, user, orderChanges, callback) {
    dbOperationControl.order.update(projectID, user, orderChanges, function(err, doc) {

        return callback(err, doc);
    });
}


/**
 * 更新 ICM 和 CCM 的模型信息(在用户的一次模型操作序列更新到数据库后，后此函数被调用)
 * @param ccmId
 * @param icmName
 * @param user
 * @param callback
 */
function updateModelInfo(ccmId, icmName, user, callback) {
    var mutex = 2;

    // 更新 ICM 信息
    modelInfo.getOneByUserAndName(user, icmName, function (err, icmInfo) {
        if (err) {
            return callback(err, null);
        }

        dbOperationControl.modelInfo.getIcmStat(ccmId, user, function (err, icmStat) {
            if (err) {
                return callback(err, null);
            }

            icmInfo.updateModelInfo(icmStat, function (err) {
                if (err) {
                    return callback(err, null);
                }

                if (--mutex === 0) {
                    return callback(null, null);
                }
            });
        });
    });

    // 更新 CCM 信息
    modelInfo.getOneByID(ccmId, function (err, ccmInfo) {
        if (err) {
            return callback(err, null);
        }

        dbOperationControl.modelInfo.getCcmStat(ccmId, function (err, ccmStat) {
            if (err) {
                return callback(err, null);
            }

            ccmInfo.updateModelInfo(ccmStat, function (err) {
                if (err) {
                    return callback(err, null);
                }

                if (--mutex === 0) {
                    return callback(null, null);
                }
            });
        });
    });
}