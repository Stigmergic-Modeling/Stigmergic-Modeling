var db = require('./db');
var mongodb = new db();
var ObjectID = require("mongodb").ObjectID;
var icdIndex = require('icd_index.js');
var logger = require('../models/logger.js');
//基本实现
exports.create= function createCD(icdData,callback){
    mongodb.getCollection('icd',function(collection){
        collection.findOne({user:icdData.user, ccd_id:icdData.ccd_id}, function(err, doc) {
            if(err != null){
                return callback(err, doc);
            }
            if(doc != null){
                err = "already Exist";
                return callback(err, doc);
            }
            collection.insert(icdData, {safe: true}, function(err, doc) {
                logger.generateLogData('INFO','icd','insert',icdData);
                icdIndex.update(doc[0],function(err2,doc2){
                    return callback(err, doc);
                });
            });
        });
    });
};

exports.addastest = function addastest(filter,callback){
    mongodb.getCollection('icd',function(collection){
        collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {
            logger.generateLogData('INFO','icd','update',[filter[0],{"$set" : filter[1]}]);
            return callback();
        });
    });
}

//get正常
exports.get = function getCD(filter,callback){
    mongodb.getCollection('icd',function(collection){
        collection.findOne(filter, function(err, doc) {
             if(err != null){
                return callback(err, doc);
             }
             if(doc === null){
                 err = "not Exist";
                 return callback(err, doc);
             }
            //console.log(doc);
             return callback(err, doc);
        });
    });
};

//测试通过
exports.remove = function removeIcd(filter,callback){
    mongodb.getCollection('icd',function(collection){
        collection.remove(filter[0],function(err){
            logger.generateLogData('INFO','icd','remove',filter[0]);
            if (err) console.warn(err.message);
            else {
                console.log('icd successfully removed');
                if(filter[0] != null) icdIndex.delete(filter[2],filter[3],function(){});
            }
            return callback();
        });
    });
};

//
exports.copy= function copyElem(id,element,callback){
    console.log(element);
    mongodb.getCollection('icd',function(collection){
        collection.update(id,{"$set":element},{safe:true},function(err,count) {
            logger.generateLogData('INFO','icd','update',[id,{"$set":element}]);
            if (err) console.warn(err.message);
            else console.log('icd successfully copyed');
            return callback(err,count);
        });
    });
};


exports.add= function addElem(filter,callback){
    mongodb.getCollection('icd',function(collection){
        collection.update(filter[0],{"$inc":filter[1]},{safe:true},function(err,number) {
            logger.generateLogData('INFO','icd','update',[filter[0],{"$inc":filter[1]}]);
            if (err) console.warn(err.message);
            else console.log('icd successfully updated');
            callback(err,number);
        });
    });
};
//
exports.delete= function deleteElem(filter,callback){
    mongodb.getCollection('icd',function(collection){
        collection.update(filter[0],{"$unset":filter[1]},{safe:true},function(err,count) {
            logger.generateLogData('INFO','icd','update',[filter[0],{"$unset":filter[1]}]);
            if (err) console.warn(err.message);
            else console.log('successfully deleted');
            return callback(err,count);
        });
    });
};

exports.revise = function revise(filter,callback){
    filter[1] = '{"'+filter[1]+'._nor":1';

    mongodb.getCollection('icd',function(collection){
        collection.update(filter[0],{"$set":filter},{safe:true},function(err) {
            logger.generateLogData('INFO','icd','update',[filter[0],{"$set":filter[1]}]);
            if (err) console.warn(err.message);
            else console.log('icd successfully revised');
        });
    });
};

//不完整的信息
exports.getInfo = function getInfo(type,stateArray){
    var info= {
        id : ObjectID(stateArray._id)
    }
    switch(type){
        case 'cd' :
            info.dir = 'cd';
            break;
        case '_description':
            info.dir = 'cd.'+stateArray['cd'].value+'._description';
            break;
        case 'class':
            info.dir = 'class';
            //Name Reform
            //info.subType = 'className';
            info.subType = 'name';
            break;
        case 'className':
            //Name Reform
            //info.dir = 'class.'+stateArray['class'].id+'.className';
            info.dir = 'class.'+stateArray['class'].id+'.name';
            break;
        case 'attribute' :
            info.dir = 'class.'+stateArray['class'].id+'.attribute';
            //Name Reform
            //info.subType = 'attributeName';
            info.subType = 'name';
            break;
        case 'attributeName' :
            //Name Reform
            //info.dir = 'class.'+stateArray['class'].id+'.attribute.'+stateArray['attribute'].id+'.attributeName';
            info.dir = 'class.'+stateArray['class'].id+'.attribute.'+stateArray['attribute'].id+'.name';
            break;
        case 'attributeElem' :
            info.dir = 'class.'+stateArray['class'].id+'.attribute.'+stateArray['attribute'].id+'.'+stateArray['attributeElem'].type;
            break;
        case 'relation' :
            info.dir = 'relation';
            //Name Reform
            //info.subType = 'relationName';
            info.subType = 'name';
            break;
        case 'relationName':
            info.dir = 'relation.'+stateArray['relation'].id+'.name';
            break;
        case 'relationType' :
            info.dir = 'relation.'+stateArray['relation'].id+'.'+stateArray['relationType'].type;
            break;
        case 'attributeSort':
            info.dir = 'order.' + stateArray['class'].id;
        default : break;
    }
    return info;
};

/*
exports.ccdToIcd= function ccdToIcd(ccdElem){
    var preData = {};
    generateIcdData(preData,ccdElem);
    return preData;
}

generateIcdData = function(preData,ccdElem){
    console.log(ccdElem);
    for(var key in ccdElem){
        console.log("key=="+key);
        if(ccdElem[key]._nor != undefined){
            console.log("element");
            preData[key] = {};
            generateIcdData(preData[key],ccdElem[key]);
        }
    }
};
*/