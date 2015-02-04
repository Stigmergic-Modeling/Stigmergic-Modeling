var db = require('./db');
var mongodb = new db();

function User(user) {

    // 核心属性
	this.password = user.password;
    this.state = user.state;
    this.mail = user.mail;
    this.link = user.link;

    // 附加信息属性
    this.name = user.name;
    this.location = user.location;
    this.url = user.url;
    this.sign_up_date = user.sign_up_date;
    this.avatar = user.avatar;

};
module.exports = User;

User.prototype.save = function save(callback) {

	//外部已先做了一次存在性判断
    var user = {
		password: this.password,
        state: 0,
        mail: this.mail,
        link: this.link,
        name: this.name,
        location: this.location,
        url: this.url,
        sign_up_date: this.sign_up_date,
        avatar: this.avatar
    };

    mongodb.getCollection('users',function(collection){
        //save
        collection.insert(user, {safe: true}, function(err, user) {
            callback(err, user);
        });
    });
};

User.prototype.activate = function activate(callback) {
    var user = {
        password : this.password,
        state : 1,
        mail : this.mail,
        link : null
    };

    mongodb.getCollection('users',function(collection){

        //update操作
        collection.update( {mail:user.mail} , {$set:{state:1}});
        return callback(null,user);
    });
};

User.prototype.updateLink = function updateLink(callback) {
    var user = this;

    mongodb.getCollection('users',function(collection){

        //update操作
        collection.update( {mail:user.mail} , {$set:{link:user.link}});
        return callback(null);
    });
};

User.prototype.updatePW = function updatePW(pw, callback) {
    var user = this;

    mongodb.getCollection('users',function(collection){

        //update操作
        collection.update({
            mail: user.mail
        }, {
            $set: {
                password: pw
            }
        });

        return callback(null);
    });
};

// 更新用户 profile
User.prototype.updateProfile = function updateProfile(profile, callback) {
    var user = this;

    mongodb.getCollection('users',function(collection){

        //update操作
        collection.update({
            mail: user.mail
        } , {
            $set: {
                name: profile.name,
                location: profile.location,
                url: profile.url
            }
        });

        return callback(null);
    });
};

User.get = function get(mail, callback) {
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

