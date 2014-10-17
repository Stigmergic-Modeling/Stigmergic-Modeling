/*
 * testUI
 */
var Test = require('../models/dbtest.js')

exports.testUI = function(req, res) {
    console.log(req.path);
    switch(req.params.id){
        case '1':    res.render('user-home', {
            title: 'UserPage',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString(),
            ccd_data : '["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Dakota","North Carolina","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"]'
            //ccd_data : '["真"]'
        });
            break;
        case '2':    res.render('user-involve', {
            title: 'Project Owned',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString(),
            ccd_data : '[]'
        });
            break;
        case '3':    res.render('user-own', {
            title: 'Project Involved',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
            break;
        case '4':    res.render('user-lable', {
            title: 'Tag',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
            break;
        case '0':    res.render('design', {
            title: 'Tag',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
            break;
        case '5':    res.render('user-lable', {
            title: 'Tag',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
    };
};


exports.testPost = function(req, res) {
    console.log(req.query.id)
    console.log(req.body.element_name)
    res.render('user-involve', {
        title: 'UserPage',
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString(),
        ccd_data : '["真","真人","真事"]'
    });
};

exports.testSearch = function(req, res) {
    console.log("search");
    res.send('["真","真人","真事","真哈哈哈","a","ab","add","akg"]');
};

exports.testSearchCD = function(req, res) {
    console.log("search");
    res.send('["Web CD Design based on Stig"]');
};

exports.testSearchClass = function(req, res) {
    console.log("search");
    res.send('["c1","c2","c3","c4","c5","c6","c7","c8"]');
};

exports.testSearchRelation = function(req, res) {
    console.log("search");
    res.send('["r-c1","r-c2","r-c3","r-c4","r-c5","r-c6","r-c7","r-c8"]');
};

exports.reset = function(req,res){
    console.log("reset");
    Test.setUser(req.session.user.mail);
    Test.test(res,function(){
        res.redirect('/');
    });
}
exports.getComment = function(req,res){
    console.log("getComment");
    res.render('icd-comment', {
        title: 'Tag',
        user : req.session.user,
        success : "",
        error : ""
    });
}



