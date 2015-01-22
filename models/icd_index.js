var db = require('./db');
var mongodb = new db();
var ObjectID = require("mongodb").ObjectID;
var ccdIndex = require('./ccd_index.js');
var logger = require('./logger.js');

exports.create= function createCD(filter,callback){
    console.log("icdIndex create");
    mongodb.getCollection('icd_index',function(collection){
        collection.insert(filter, {safe: true}, function(err, doc) {
            logger.generateLogData('INFO','icdIndex','insert',filter);
            return callback(err, doc);
        });
    });
};

exports.get = function getCD(filter,callback){
    mongodb.getCollection('icd_index',function(collection){
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

exports.remove = function removeIcd(filter,callback){
    mongodb.getCollection('icd_index',function(collection){
        collection.remove(filter,function(err){
            logger.generateLogData('INFO','icdIndex','remove',filter);
            if (err) console.warn(err.message);
            else console.log('icd_index successfully removed');
            return callback();
        });
    });
};

exports.delete = function deleteIcdIndex(filter,unset,callback){
    mongodb.getCollection('icd_index',function(collection){
        collection.update(filter,unset,function(err){
            logger.generateLogData('INFO','icdIndex','update',[filter,unset]);
            if (err) console.warn(err.message);
            else {
                for(var key in unset["$unset"]){
                    ccdIndex.removeOne({ccd_id:ObjectID(key)});
                    break;
                }
            };
            return callback();
        });
    });
};

exports.update = function update(icd,callback){
    mongodb.getCollection('icd_index',function(collection){
        var filter = {user: icd.user};
        console.log(icd);
        var content = {};
        content[icd.ccd_id] = {};
        content[icd.ccd_id]["icd_id"] = icd._id;
        content[icd.ccd_id]["ccd_id"] = icd.ccd_id;
        content[icd.ccd_id]["cd"] = icd.cd;
        content[icd.ccd_id]["create_time"] = new Date();
        content[icd.ccd_id]["last_time"] = new Date();

        collection.update(filter, {"$set":content},{safe:true},function(err) {
            logger.generateLogData('INFO','icdIndex','update',[filter,{"$set":content}]);
            if (err) console.warn(err.message);
            else {
                console.log('icd_index successfully updated');
                ccdIndex.addOne({ccd_id:icd.ccd_id});
            }
            return callback(err);
        });
    });
};

exports.changeCD = function changeCD(icd,callback){
    mongodb.getCollection('icd_index',function(collection){
        var filter = {};
        filter["user"] = icd.user;
        console.log(icd);
        var content = {};
        content[icd.ccd_id] = {};
        content[icd.ccd_id]["icd_id"] = icd._id;
        content[icd.ccd_id]["ccd_id"] = icd.ccd_id;
        content[icd.ccd_id]["cd"] = icd.cd;
        content[icd.ccd_id]["create_time"] = new Date();
        content[icd.ccd_id]["last_time"] = new Date();

        collection.update(filter, {"$set":content},{safe:true},function(err) {
            logger.generateLogData('INFO','icdIndex','update',[filter,{"$set":content}]);
            if (err) console.warn(err.message);
            else {
                console.log('icd_index successfully updated');
                ccdIndex.addOne({ccd_id:icd.ccd_id});
            }
            return callback(err);
        });
    });
};