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
        m_db = new Db(settings.db.name, new Server(settings.host, settings.port, {auto_reconnect : true}));
        console.log("connection_open:"+m_connection);
        m_connection++;
        if(m_connection === 1){
            console.log("db_open");
            m_db.open(function(err, db) {
                if (err) {
                    m_connection--;
                    return callback(err,db);
                }
                else{
                    collection_init();
                    return callback(err,db);
                }
            });
        }
        return callback(null,m_db);
    };

    this.getCollection = function(collectionName,callback){
        return callback(m_collection[collectionName]);
    }

    collection_init = function(callback){
        console.log("collection.init");

        m_db.collection('users', function(err, collection) {
            collection.ensureIndex('mail', {unique: true});
            m_collection["users"] = collection;
            //console.log("collection.icd-cd");
        });

        var collectionList = ['icd','icd_index','ccd','ccd_index','operationScore','operationScore2','icd_attribute_sort'
            ,'conceptDiag_edge','conceptDiag_vertex','conceptDiag_index'];
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
