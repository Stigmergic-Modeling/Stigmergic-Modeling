var db = require('./db');
var mongodb = new db();

function ModelInfo(modelInfo) {

    // 属性
    this._id = modelInfo._id;
    this.ccmId = modelInfo.ccmId;
    this.user = modelInfo.user;
    this.name = modelInfo.name;
    this.description = modelInfo.description;
    this.creationDate = modelInfo.creationDate;
    this.updateDate = modelInfo.updateDate;
    this.classNum = modelInfo.classNum;
    this.relationNum = modelInfo.relationNum;
};

module.exports = ModelInfo;

ModelInfo.prototype.save = function save(callback) {

	// 外部已先做了一次存在性判断
    var modelInfo = {
        _id: this._id,
        ccmId: this.ccmId,
        user: this.user,
        name: this.name,
        description: this.description,
        creationDate: this.creationDate,
        updateDate: this.updateDate,
        classNum: this.classNum,
        relationNum: this.relationNum
    };

    mongodb.getCollection('modelinfo',function(collection){

        collection.insert(modelInfo, {safe: true}, function(err, modelInfo) {
            callback(err, modelInfo);
        });
    });
};

//Model.prototype.activate = function activate(callback) {
//    var user = {
//        password : this.password,
//        state : 1,
//        mail : this.mail,
//        link : null
//    };
//
//    mongodb.getCollection('users',function(collection){
//
//        //update操作
//        collection.update( {mail:user.mail} , {$set:{state:1}});
//        return callback(null,user);
//    });
//};
//
//Model.prototype.updateLink = function updateLink(callback) {
//    var user = this;
//
//    mongodb.getCollection('users',function(collection){
//
//        //update操作
//        collection.update( {mail:user.mail} , {$set:{link:user.link}});
//        return callback(null);
//    });
//};
//
//Model.prototype.updatePW = function updatePW(pw, callback) {
//    var user = this;
//
//    mongodb.getCollection('users',function(collection){
//
//        //update操作
//        collection.update({
//            mail: user.mail
//        }, {
//            $set: {
//                password: pw
//            }
//        });
//
//        return callback(null);
//    });
//};
//
//// 更新用户 profile
//Model.prototype.updateProfile = function updateProfile(profile, callback) {
//    var user = this;
//
//    mongodb.getCollection('users',function(collection){
//
//        //update操作
//        collection.update({
//            mail: user.mail
//        } , {
//            $set: {
//                name: profile.name,
//                location: profile.location,
//                url: profile.url
//            }
//        });
//
//        return callback(null);
//    });
//};

ModelInfo.get = function get(name, callback) {
    mongodb.getCollection('modelinfo',function(collection){

	    //find
        collection.findOne({name: name}, function(err, doc) {
            if (doc) {
                var modelInfo = new ModelInfo(doc);
                //console.log(modelInfo);
                callback(err, modelInfo);
            } else {
                callback(err, null);
            }
        });
    });
};

