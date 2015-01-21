var db = require('./db');
var mongodb = new db();

function User(user) {
	this.password = user.password;
    this.state = user.state;
    this.mail = user.mail;
    this.link = user.link;
};
module.exports = User;

User.prototype.save = function save(callback) {
	//外部已先做了一次存在性判断
    var user = {
		password : this.password,
        state : 0,
        mail : this.mail,
        link : this.link
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

User.prototype.updatePW = function updatePW(callback) {
    var user = this;
    mongodb.getCollection('users',function(collection){
        //update操作
        collection.update( {mail:user.mail} , {$set:{password:user.password}});
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
