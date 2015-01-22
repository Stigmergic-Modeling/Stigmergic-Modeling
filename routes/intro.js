var icdIndex = require('../models/icd_index.js');
var ccdIndex = require('../models/ccd_index.js');
var ObjectID = require("mongodb").ObjectID;

exports.on = function(req, res) {
    console.log('user-intro');
    checkExistence(req,res,function(state,doc){
        var icd =doc;
        ccdIndex.get({ccd_id : ObjectID(req.params.id)},function(err,doc){
            var ccd = doc[0];
            res.render('user-intro', {
                title: 'Project Owned',
                user : req.session.user,
                state : state,
                icd : icd,
                ccd : ccd,
                success : "",
                error : ""
            });
        });
    })
};


checkExistence = function(req,res,callback){
    var filter = {};
    filter["user"] = req.params.user;

    icdIndex.get(filter,function(err,doc){
        if(doc[0] === undefined){
            icdIndex.create(filter,function(err,doc){
                return res.redirect(req.url);
            });
        }else{
            if(doc[0][ObjectID(req.params.id)] != undefined){
                callback(true,doc[0][ObjectID(req.params.id)]);
            }else{
                callback(false,null);
            }
        }
    });
};

