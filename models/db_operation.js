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
            //TODO 回调信息docs内容应该为查询到的一组document，可能docs数据有误
            //console.log('collectionName', collectionName);
            //console.log('filter', filter);
            //console.log('docs', docs);

            if(err != null){
                console.log('Error when getting docs:', err);
                return callback(err, docs);
            }
            if(docs === null){
                console.log('docs not exist');
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
            //TODO 回调信息docs内容应该为查询到的一组document，可能docs数据有误
            if(err != null){
                return callback(err, docs);
            }
            if(docs.length != 0){
                err = "already Exist";
                return callback(err, docs);
            }
            collection.insert(data, {safe: true}, function(err, doc) {
                //logger.generateLogData('INFO','icd','insert',icdData);
                doc = doc.ops;
                updateTimeTag(collectionName,filter,function(){
                });
                return callback(err, doc);
            });
        });
    });
};

//强制创建
exports.forceToCreate = function(collectionName,data,callback){
    mongodb.getCollection(collectionName,function(collection){
        collection.insert(data, {safe: true}, function(err, doc) {
            doc = doc.ops;
            //console.log('data', data);
            //logger.generateLogData('INFO','icd','insert',icdData);
            updateTimeTag(collectionName,data,function(){
            });
            return callback(err, doc);
        });
    });
};

// 删除
exports.delete = function(collectionName, filter, callback){
    mongodb.getCollection(collectionName, function (collection) {

        collection.remove(filter, function(err, doc) {

            return callback(err, doc);
        });
    });
};

//更新
exports.update = function(collectionName,filter,data,callback){
    mongodb.getCollection(collectionName,function(collection){
        collection.find(filter).toArray(function(err, docs) {
            //TODO 回调信息docs内容应该为查询到的一组document，可能docs数据有误

            if(err != null){
                return callback(err, docs);
            }
            if(docs.length === 0){
                err = "not Exist";
                return callback(err, docs);
            }
            collection.update(filter, data, {safe: true, multi: true}, function(err, doc) {

                doc = doc.result.n;
                updateTimeTag(collectionName, filter, function() {
                });
                return callback(err, doc);
            });
        });
    });
};

// 强制更新
exports.forceToUpdate = function(collectionName,filter,data,callback){
    mongodb.getCollection(collectionName,function(collection){
        //console.log('Before collection.update:')
        //console.log('filter', filter);
        //console.log('data', data);
        collection.update(filter, data, {upsert: true}, function(err, doc) {

            doc = doc.result.n;
            updateTimeTag(collectionName, filter, function() {
            });
            return callback(err, doc);
        });
    });
};

//提供时间戳，用于版本管理
var updateTimeTag = function(collectionName, filter, callback) {

    mongodb.getCollection(collectionName, function (collection) {
        var time = parseInt(new Date().valueOf()).toString(16);
        var updateLastRevise = {};
        updateLastRevise["lastRevise"] = time;

        collection.update(filter, {"$set" : updateLastRevise}, {safe: true}, function (err, doc) {

            doc = doc.result.n;
            return callback(err, doc);
        });
    });
};

/**
 * 统计某集合中符合条件的文档数
 * @param collectionName
 * @param filter
 * @param callback
 */
exports.count = function (collectionName, filter, callback) {
    mongodb.getCollection(collectionName, function (collection) {
        collection.count(filter, function (err, count) {
            if (err) return callback(err, null);

            return callback(null, count);
        });
    });
};


////统计信息
//exports.updateEdgeCount = function(collectionName,filter,data,callback){
//    mongodb.getCollection(collectionName,function(collection){
//        collection.find(filter).toArray(function(err, docs) {
//            if(err != null){
//                return callback(err, doc);
//            }
//            if(docs != null){
//                err = "already Exist";
//                return callback(err, docs);
//            }
//            collection.update(filter,data, {safe: true}, function(err, doc) {
//                //logger.generateLogData('INFO','icd','insert',icdData);
//                updateTimeTag(collectionName,filter,function(){
//                });
//                return callback(err, doc);
//            });
//        });
//    });
//};
