var ccd = require('../models/ccd.js');

exports.on = function(req, res) {
    console.log('user-own');
    res.render('user-own', {
        title: 'Project Owned',
        user : req.session.user,
        success : "",
        error : ""
    });
};

exports.create = function(req, res) {
    console.log('ccd_create');
    console.log(req.body)
    var newOne = {};
    newOne["user"] = req.body.user;
    newOne["cd"] = req.body.cd_name;
    newOne["description"] = req.body.cd_description;
    console.log(newOne);
    ccd.create(newOne,function(err,doc){
        res.send({docs:doc});
    });
};