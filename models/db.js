/**
 *
 */
var settings = require('../settings');
var Db = require('mongodb').Db;
var Connection =  require('mongodb').Connection;
var Server = require('mongodb').Server;

var m_connection = 0;
var m_collection = {};
var m_db;

module.exports = function(){
    this.trueBase = function(callback){
        m_db = new Db(settings.db.name, new Server(settings.host, settings.db.port, {auto_reconnect : true}));
        console.log("connection_open:"+m_connection);
        m_connection++;
        if(m_connection === 1){
            m_db.open(function(err, db) {
                if (err) {
                    console.log('db_open error', err);
                    m_connection--;
                    return callback(err,db);
                }
                else{
                    var adminDb = db.admin();
                    console.log("db opened");
                    adminDb.authenticate(settings.db.user,settings.db.password , function(err, result) {
                        if (err) {
                            console.log('dbauth error', err);
                            m_connection--;
                            return callback(err,db);
                        } else {
                            console.log("db authorized");
                            collection_init();
                            return callback(err, db);
                        }
                    });
                }
            });
        }
        //return callback(null,m_db);
    };

    this.getCollection = function(collectionName,callback){
        return callback(m_collection[collectionName]);
    }

    collection_init = function(callback){
        console.log("collections initiating...");

        m_db.collection('users', function(err, collection) {
            collection.ensureIndex({mail: 1}, {unique: true});
            m_collection["users"] = collection;
        });

        m_db.collection('modelinfo', function(err, collection) {
            collection.ensureIndex({user: 1, name: 1}, {unique: true});
            m_collection["modelinfo"] = collection;
        });

        var collectionList = ['conceptDiag_edge','conceptDiag_vertex','conceptDiag_index','conceptDiag_order'];
        for(var i=0;i<collectionList.length;i++){
            generateCollection(collectionList[i]);
        }
    };
};

var generateCollection = function(collectionName){
    m_db.collection(collectionName, function(err, collection) {
        m_collection[collectionName] = collection;
        return;
    });
}
