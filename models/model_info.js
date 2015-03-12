var db = require('./db');
var mongodb = new db();

module.exports = ModelInfo;


/**
 * 模型信息构造函数
 * @param modelInfo
 * @constructor
 */
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


/**
 * 新建doc并插入
 * @param callback
 */
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


/**
 * 更新模型信息
 * @param modelInfo
 * @param callback
 */
ModelInfo.prototype.updateModelInfo = function updateModelInfo(modelInfo, callback) {
    var model = this;

    mongodb.getCollection('modelinfo',function(collection){

        // update操作
        collection.update({
            user: model.user,
            name: model.name
        } , {
            $set: {
                name: (modelInfo.name !== void 0) ? modelInfo.name : model.name,
                description: (modelInfo.description !== void 0) ? modelInfo.description : model.description,
                class_num: (modelInfo.class_num !== void 0) ? modelInfo.class_num : model.class_num,
                relation_num: (modelInfo.relation_num !== void 0) ? modelInfo.relation_num : model.relation_num,
                update_date: modelInfo.update_date
            }
        });

        return callback(null);
    });
};


/**
 * 删除模型
 * @param user
 * @param name
 * @param callback
 */
ModelInfo.deleteOneByUserAndName = function deleteOneByUserAndName(user, name, callback) {
    mongodb.getCollection('modelinfo',function(collection){

        // delete
        collection.findAndRemove({user: user, name: name}, function(err) {
            callback(err);
        });
    });
};


/**
 * 提取某用户的某 icm
 * @param user
 * @param name
 * @param callback
 */
ModelInfo.getOneByUserAndName = function getOneByUserAndName(user, name, callback) {

    mongodb.getCollection('modelinfo',function(collection){

	    // find
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
 * 根据 _id 提取某个 model info
 * @param id
 * @param callback
 */
ModelInfo.getOneByID = function getOneByID(id, callback) {
    mongodb.getCollection('modelinfo',function(collection){

        // find
        collection.findOne({_id: id}, function(err, doc) {
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

        // find
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
