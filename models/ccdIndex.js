var db = require('./db');
var mongodb = new db();
var ObjectID = require("mongodb").ObjectID;

exports.create= function createCD(filter,callback){
    mongodb.getCollection('ccd_index',function(collection){
        var existence = {};
        existence['ccd_id'] = filter._id;
        collection.findOne(existence, function(err, doc) {
            if(err != null){
                return callback(err, doc);
            }
            if(doc != null){
                err = "already Exist";
                return callback(err, doc);
            }
            var ccd_index = {};
            ccd_index["ccd_id"] = filter._id;
            ccd_index["ccd_creator"] = filter.user;
            ccd_index["create_time"] = new Date();
            ccd_index["last_time"] = new Date();
            ccd_index["cd"] = filter.cd;
            ccd_index["reference"] = 0;
            collection.insert(ccd_index, {safe: true}, function(err, doc) {
                return callback(err, doc);
            });
        });
    });
};

//get正常
exports.get = function getCD(filter,callback){
    mongodb.getCollection('ccd_index',function(collection){
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

//测试通过
exports.remove = function removeIcd(filter,callback){
    mongodb.getCollection('ccd_index',function(collection){
        collection.remove(filter,function(err){
            if (err) console.warn(err.message);
            else console.log('ccdIndex successfully removed');
            return callback();
        });
    });
};

exports.addOne = function addOne(filter){
    mongodb.getCollection('ccd_index',function(collection){
        collection.update( filter,{"$inc":{reference:1}},{safe:true},function(err,number) {
            if (err) console.warn(err.message);
            else console.log('ccd_index successfully addOne');
        });
    });
}

exports.removeOne = function removeOne(filter){
    mongodb.getCollection('ccd_index',function(collection){
        collection.update( filter,{"$inc":{reference:-1}},{safe:true},function(err,number) {
            if (err) console.warn(err.message);
            else console.log('ccd_index successfully removeOne');
        });
    });
}
