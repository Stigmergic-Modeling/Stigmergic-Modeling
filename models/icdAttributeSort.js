/**
 *  sorted output of attributes in browser
**/
var db = require('./db');
var mongodb = new db();
var ObjectID = require("mongodb").ObjectID;
var icdIndex = require('../models/icdIndex.js');
var logger = require('../models/logger.js');


exports.add = function addAttributeSort(filter,callback){
    mongodb.getCollection('icd_attribute_sort',function(collection){
        collection.findOne(filter[0], function(err, doc) {
            if(err != null){
                return callback(err, doc);
            }
            else if(doc === null){
                err = "not Exist";
                //插入数据
                collection.insert({icd_id:filter[0].icd_id}, {safe: true}, function(err, doc) {
                    collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {
                        return callback(err,doc);
                    });
                });
            }else{
                collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {
                    return callback(err,doc);
                });
            }
        });
    });
};


exports.get = function getAttributeSort(filter,callback){
    mongodb.getCollection('icd_attribute_sort',function(collection){
        collection.findOne(filter[0], function(err, doc) {
            if(err != null){
                return callback(err, doc);
            }
            else if(doc === null){
                err = "not Exist";
                //插入数据
                collection.insert({icd_id:filter[0].icd_id}, {safe: true}, function(err, doc) {
                    collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {
                        return callback(err,null);
                    });
                });
            }else{
                for(var key in filter[1]){
                    var dir = key.split(".");
                    break;
                }
                console.log(doc);
                console.log(dir);
                console.log(filter[1])

                for(var i=0;i<dir.length;i++){
                    doc=doc[dir[i]];
                    if(doc===undefined){
                        console.log("undefined")
                        console.log(filter[1]);
                        collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {
                            return callback(err,null);
                        });
                        break;
                    }
                }
                if(doc != undefined)  return callback(err, doc);
            }
        });
    });
};


exports.revise = function reviseAttributeSort(filter,callback){
    mongodb.getCollection('icd_attribute_sort',function(collection){
        collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {
            return callback(err,null);
        });
    });
};
