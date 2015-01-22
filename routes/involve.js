var icd = require('../models/icd.js');
var ccd = require('../models/ccd.js');
var icdIndex = require('../models/icd_index.js');
var ccdIndex = require('../models/ccd_index.js');
var ObjectID = require("mongodb").ObjectID;

exports.on = function(req,res) {
    var filter = {};
    filter["_id"] = ObjectID(req.params.id);
    console.log(filter);
    //console.log(req.session.user)
    ccd.get(filter,function(err,doc){
        console.log("+++++++");
        console.log(doc);
        res.render('user-involve', {
            title: 'Project Involved',
            user :  { mail: req.params.user, state: 1 },//req.session.user,
            ccd  : doc,
            success : "",
            error : ""
        });
    });
};

exports.intro = function(req,res){
    console.log('user-uninvolve');
    checkExistence(req,res,function(state,doc){
        var icd = doc;
        ccdIndex.get({_id : req.params.id},function(err,doc){
            var ccd = doc[0];
            res.render('user-uninvolve', {
                title: 'Project uninvolve',
                user : req.session.user,
                state : state,
                icd : icd,
                ccd : ccd,
                success : "",
                error : ""
            });
        });
    })
}

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
}

exports.create = function(req,res){
    var filter = {};
    filter["user"] = req.params.user;

    icdIndex.get(filter,function(err,doc){
        if(doc[0] === undefined){
            icdIndex.create(filter,function(err,doc){
                return res.redirect(req.url);
            });
        }else{
            if(doc[0][ObjectID(req.params.id)] != undefined){
                //如果已存在就直接跳转
                return res.redirect('/'+req.params.user+'/involved/'+doc[0][ObjectID(req.params.id)]["ccd_id"]);
            }else{
                //否则进行创建
                var filter2 = {};
                filter2["ccd_id"] =ObjectID(req.params.id);

                 ccdIndex.get(filter2,function(err,doc){
                     var filter = {};
                     var ccd_index = doc[0];
                     filter["user"] = req.params.user;
                     filter["ccd_id"] = ObjectID(req.params.id);
                     filter["cd"] = ccd_index["cd"];
                     filter["class"] = {};
                     filter["relation"] = {};
                     filter["_preOperationValue"] = 0;

                     icd.create(filter,function(err){
                         console.log(err);
                         console.log(doc);
                         res.redirect('/'+req.params.user+'/involved/'+req.params.id);
                     });
                 });
            }
        }
    });
}