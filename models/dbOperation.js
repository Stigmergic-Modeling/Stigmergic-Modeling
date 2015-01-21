/**
 *  dbOperations
 */
var db = require('./db');
var mongodb = new db();
var ObjectID = require("mongodb").ObjectID;
var logger = require('../models/logger.js');

// 数组查询
// "ne"判断数组中不存在，"$push"进行数组的插入，
// "$addToSet"+"$each"可以同次插入多值，addToSet检验是否重复
// "$pop",1从尾部删除，-1从头部删除
// "$pull"，删除指定元素

//查询
exports.get = function(collectionName,filter,callback){
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, docs);
            }
            if(docs === null){
                err = "not Exist";
                return callback(err, docs);
            }
            return callback(err, docs);
        });
    });
};

//创建
exports.create = function(collectionName,filter,data,callback){
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, docs);
            }
            if(docs.length != 0){
                err = "already Exist";
                return callback(err, docs);
            }
            collection.insert(data, {safe: true}, function(err, doc) {
                //logger.generateLogData('INFO','icd','insert',icdData);
                updateTimeTag(collectionName,filter,function(){
                });
                return callback(err, doc);
            });
        });
    });
};

//更新
exports.update = function(collectionName,filter,data,callback){
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, doc);
            }
            if(docs.length === 0){
                err = "not Exist";
                return callback(err, docs);
            }
            collection.update(filter,data, {safe: true}, function(err, doc) {
                //logger.generateLogData('INFO','icd','insert',icdData);
                updateTimeTag(collectionName,filter,function(){
                });
                return callback(err, doc);
            });
        });
    });
};

//提供时间戳，用于版本管理
var updateTimeTag = function(collectionName,filter,callback){
    mongodb.getCollection(collectionName,function(collection){
        var time =parseInt(new Date().valueOf()).toString(16);
        var updateLastRevise = {};
        updateLastRevise["lastRevise"] = time;
        collection.update(filter,{"$set" : updateLastRevise}, {safe: true}, function(err, doc) {
            //logger.generateLogData('INFO','icd','update',[filter[0],{"$set" : filter[1]}]);
            return callback();
        });
    });
};

//统计信息
exports.updateEdgeCount = function(collectionName,filter,data,callback){
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, doc);
            }
            if(docs != null){
                err = "already Exist";
                return callback(err, docs);
            }
            collection.update(filter,data, {safe: true}, function(err, doc) {
                //logger.generateLogData('INFO','icd','insert',icdData);
                updateTimeTag(collectionName,filter,function(){
                });
                return callback(err, doc);
            });
        });
    });
};

// 这一层就是一条一条的数据处理，点和边的区分应该在更上一层
/* 好像都一样没什么用
//查询点
exports.getVertex = function(collectionName,filter,callback){//只有用ID表示的点需要创建查询
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, docs);
            }
            if(docs === null){
                err = "not Exist";
                return callback(err, docs);
            }
            return callback(err, docs);
        });
    });
};

//创建点
exports.createVertex = function(collectionName,filter,data,callback){//只有用ID表示的点需要创建
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, docs);
            }
            if(docs.length != 0){
                err = "already Exist";
                return callback(err, docs);
            }
            collection.insert(data, {safe: true}, function(err, doc) {
                //logger.generateLogData('INFO','icd','insert',icdData);
                updateTimeTag(collectionName,filter,function(){
                });
                return callback(err, doc);
            });
        });
    });
};

//更新点
exports.updateVertex = function(collectionName,filter,data,callback){//只有用ID表示的点需要创建查询
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, doc);
            }
            if(docs.length === 0){
                err = "not Exist";
                return callback(err, docs);
            }
            collection.update(filter,data, {safe: true}, function(err, doc) {
                //logger.generateLogData('INFO','icd','insert',icdData);
                updateTimeTag(collectionName,filter,function(){
                });
                return callback(err, doc);
            });
        });
    });
};
*/

/*
//查询边
exports.getEdge = function(collectionName,filter,callback){//只有用ID表示的点需要创建查询
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, docs);
            }
            if(docs === null){
                err = "not Exist";
                return callback(err, docs);
            }
            return callback(err, docs);
        });
    });
};

//创建边
exports.createEdge = function(collectionName,filter,data,callback){//只有用ID表示的点需要创建查询
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, doc);
            }
            if(docs.length != 0){
                err = "already Exist";
                return callback(err, docs);
            }
            collection.insert(data, {safe: true}, function(err, doc) {
                //logger.generateLogData('INFO','icd','insert',icdData);
                updateTimeTag(collectionName,filter,function(){
                });
                return callback(err, doc);
            });
        });
    });
};

//更新边
exports.updateEdge = function(collectionName,filter,data,callback){//只有用ID表示的点需要创建查询
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            if(err != null){
                return callback(err, doc);
            }
            if(docs.length === 0){
                err = "not Exist";
                return callback(err, docs);
            }
            collection.update(filter,data, {safe: true}, function(err, doc) {
                //logger.generateLogData('INFO','icd','insert',icdData);
                updateTimeTag(collectionName,filter,function(){
                });
                return callback(err, doc);
            });
        });
    });
};
*/
