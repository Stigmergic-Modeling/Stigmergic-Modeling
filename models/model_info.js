var db = require('./db');
var mongodb = new db();

function Model(model) {

    // 附加信息属性
    this.name = model.name;
    this.description = user.description;
};

module.exports = Model;

Model.prototype.save = function save(callback) {

	// 外部已先做了一次存在性判断
    var user = {
		password: this.password,
        state: 0,
        mail: this.mail,
        link: this.link,
        name: this.name,
        location: this.location,
        url: this.url,
        signUpDate: this.signUpDate,
        avatar: this.avatar
    };

    mongodb.getCollection('users',function(collection){

        collection.insert(user, {safe: true}, function(err, user) {
            callback(err, user);
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

Model.get = function get(mail, callback) {
    mongodb.getCollection('users',function(collection){

	    //find
        collection.findOne({mail: mail}, function(err, doc) {
            if (doc) {
                var user = new User(doc);
                callback(err, user);
            } else {
                callback(err, null);
            }
        });
    });
};

