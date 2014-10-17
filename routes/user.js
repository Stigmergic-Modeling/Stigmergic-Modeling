var User = require('../models/user.js');
//var Icd = require('../models/icd.js');
//var Test = require('../models/dbtest.js')
//var DbEventProxy = require('../models/dbEventProxy.js')
var icdIndex = require('../models/icdIndex.js');
var ccdIndex = require('../models/ccdIndex.js');
var ccd = require('../models/ccd.js');
var ObjectID = require("mongodb").ObjectID;
//var logger = require("../app.js").logger("normal");

exports.user = function(req, res) {
    console.log("user-home");
    User.get(req.params.user, function(err, user) {
        if (!user) {
            req.flash('error', 'User not existed/user');
            return res.redirect('/');
        }
        //对于不同的设计需求
        var active = req.query.active;
        if(active === undefined) active = "nav-list-1";
        console.log(active)
        console.log(req.session.user);
        res.render('user-home', {
            title: user.mail,
            user : req.session.user,      //用户仍然认为是登录用户，页面是选择的页面
            active : active,
            success : "",
            error : ""
        });
    });
};