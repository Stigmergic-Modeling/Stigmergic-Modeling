var db = require('./db');
var mongodb = new db();

function ModelInfo(modelInfo) {

    // 属性
    this._id = modelInfo._id;
    this.ccm_id = modelInfo.ccm_id;
    this.user = modelInfo.user;
    this.name = modelInfo.name;
    this.description = modelInfo.description;
    this.creation_date = modelInfo.creation_date;
    this.update_date = modelInfo.update_date;
    this.class_num = modelInfo.class_num;
    this.relation_num = modelInfo.relation_num;
};

module.exports = ModelInfo;

ModelInfo.prototype.save = function save(callback) {

    var modelInfo = {
        _id: this._id,
        ccm_id: this.ccm_id,
        user: this.user,
        name: this.name,
        description: this.description,
        creation_date: this.creation_date,
        update_date: this.update_date,
        class_num: this.class_num,
        relation_num: this.relation_num
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


/**
 * 提取某用户的某 icm
 * @param user
 * @param name
 * @param callback
 */
ModelInfo.getOneByName = function getOneByUserAndName(user, name, callback) {
    mongodb.getCollection('modelinfo',function(collection){

	    //find
        collection.findOne({user: user, name: name}, function(err, doc) {
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

/**
 * 提取某用户的全部 icm 信息
 * @param user
 * @param callback
 */
ModelInfo.getByUser = function getByUser(user, callback) {
    mongodb.getCollection('modelinfo',function(collection){

        //find
        collection.find({user: user}).toArray(function (err, docs) {
            if (docs) {
                //console.log(docs);
                var modelInfo = [];

                docs.forEach(function(doc) {
                    var item = new ModelInfo(doc);
                    modelInfo.push(item);
                });
                //console.log(modelInfo);
                callback(err, modelInfo);

            } else {
                callback(err, null);
            }
        });

    });
};
