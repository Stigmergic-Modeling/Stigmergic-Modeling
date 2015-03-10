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

exports.modelOperation = function(projectID, user, ops, orderChanges, callback){

    // 使用递归嵌套保证 ops 的执行顺序
    (function next(index) {

        //console.log('index', index);
        //console.log('ops.length', ops.length);

        // 若已执行完所有 ops，则执行 orderChanges
        if (index === ops.length) {

            // 更新 attribute 或 relationship 的顺序
            console.log('orderChanges', orderChanges);
            if (orderChanges) {
                orderOperation(projectID, user, orderChanges, function(err, doc){
                    //console.log('Order Updated');

                    return callback(err);
                });
            }

            return callback(null);
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

var attributeOperation = function (projectID, user, dataItem, callback) {
    switch(dataItem[1]){
        case 'ADD':
            dbOperationControl.attribute.add(projectID,user,dataItem[3],dataItem[4],function(err,doc){
                return callback(err,doc);
            });
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
            dbOperationControl.relation.add(projectID, user, ObjectID(dataItem[4]), function (err, doc) {
                return callback(err, doc);
            });
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

var orderOperation = function (projectID, user, orderChanges, callback) {
    dbOperationControl.order.update(projectID, user, orderChanges, function(err, doc) {

        return callback(err, doc);
    });
}

