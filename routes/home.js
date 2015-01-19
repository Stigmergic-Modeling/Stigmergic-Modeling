var crypto = require('crypto');
var User = require('../models/user.js');
var Smtp = require('../models/smtp.js');
/*
 * homepage.
 */
exports.index = function(req, res){
    console.log("index");

    console.log(req.headers.host);

    if(req.session.user){
        if(req.session.user.state ===0)
            return res.redirect('/checkmail');
        else
            return res.redirect('/u/'+req.session.user.mail);
    }

    res.render('index', {
        title: 'HomePage',
        user : req.session.user,                    //aboute cookie
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
    });
};

/*
 * reg
 */
exports.reg = function(req, res) {
    res.render('reg', {
        title: 'Register',
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
    });
    //console.log(req.flash('success').toString());
};

/*
 * doReg
 */
exports.doReg = function(req, res) {
    //检查密码
    if (req.body['password-repeat'] != req.body['password']) {
        req.flash('error', 'The two passwords you entered do not match');
        return res.redirect('/reg');
    }

    //var regexPW = /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,40}$/;
    var regexPW = /^.{6,40}$/;
    if(!regexPW.exec(req.body['password']))
    {
        req.flash('error', 'Password length no less than 6 and no more than 40 characters');
        return res.redirect('/reg');
    }

    var regexMail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    var result =  regexMail.exec(req.body.mail);
    if(!result)
    {
        req.flash('error', 'Please use correct mailbox: [number/letter or underscore]@[hostname]. as:. "uml@163.com"');
        return res.redirect('/reg');
    }

    //生成md5的密码
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    var sha1 = crypto.createHash('sha1');
    var time = new Date().toString();
    var link = sha1.update(time).digest('hex');

    var newUser = new User({
        //name: req.body.username,
        password: password,
        state: 0,
        mail : req.body.mail,
        link: link
    });

    //检查用户名是否已经存在
    User.get(newUser.mail, function(err, user) {
        if (user)
            err = 'Aleady Existed';
        if (err) {
            req.flash('error', err);
            return res.redirect('/reg');
        }

        //如果不存在則新增用戶
        newUser.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            //Smtp服务
            Smtp.send(newUser, 'checklink',req.headers.host,function(err){
            });

            //返回数据
            req.session.user = {
                state:newUser.state,
                mail:newUser.mail
            };
            req.flash('success', 'successfully registered /reg');
            //res.redirect('/');
            res.redirect('/checkmail');
        });
    });
};

/*
 * login
 */
exports.login = function(req, res) {
    res.render('login', {
        title: 'Sign In',
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
    });
};

/*
 * doLogin
 */
exports.doLogin = function(req, res) {
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.body.mail, function(err, user) {
        if (!user) {
            req.flash('error', 'User not Existed/login');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', 'Password wrong/login');
            return res.redirect('/login');
        }
        req.session.user = {
            mail:   user.mail,
            state:  user.state,
            mail:   user.mail
        };
        if (user.state === 0)
        {
            req.flash('error', 'User is not activated/login');
            return res.redirect('/checkmail');
        }
        req.flash('success', 'Successfully Sign In/login');
        res.redirect('/u/'+req.body.mail);
    });
};

/*
 * doLogout
 */
exports.logout = function(req, res) {
    req.session.user = null;
    req.flash('success', 'Successfully Sign Out/logout');
    res.redirect('/');
};

/*
 * checkMail
 */
exports.checkMail = function(req,res){
    res.render('checkmail', {
        title: 'User activated',
        user : req.session.user,                    //aboute cookie
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
    });
};

/*
 * doCheckMail
 */
exports.doCheckMail = function(req,res){
    var sha1 = crypto.createHash('sha1');
    var time = new Date().toString();
    var link = sha1.update(time).digest('hex');

    //检查用户名是否已经存在
    User.get(req.session.user.mail, function(err, user) {
        if (!user){
            err = 'User not Existed.';
            req.flash('error', err);
            return res.redirect('/reg');
        };
        //数据更新与发送邮件
        user.link = link;
        user.updateLink(function(err) {
            if(err){
                req.flash('error', err);
                return res.redirect('/reg');
            }
        });
        //Smtp服务
        Smtp.send(user,'checklink',req.headers.host, function(err){
        });

        //返回数据
        req.session.user = {
            state:user.state,
            mail:user.mail
        };
        req.flash('success', 'Link sended/doCheckMail');
        return res.redirect('/checkmail');
    });
};

/*
 * checkLink
 */
exports.checkLink = function(req,res){
    console.log("checkLink");
    User.get(req.params.user, function(err, user) {
        //console.log(user);
        console.log("checkInfo");
        if (!user) {
            console.log('User not Existed/checkLink');
            req.flash('error', 'User not Existed/checkLink');
            return res.redirect('/');
        }
        if(req.params.link != user.link){
            console.log('Invalid link/checkLink');
            req.flash('error', 'Invalid link/checkLink');
            return res.redirect('/');
        }
        if(user.state != 0){
            console.log('User already activated/checkLink');
            req.flash('error', 'User already activated/checkLink');
            console.log(user);
            req.session.user = {
                mail:   user.mail,
                state:  user.state
            };

            return res.redirect('/');
        }
        //进行存储
        user.activate(function(err,user){
            console.log("activate");
            console.log(user);
            if(err){
                req.flash('error', err);
                return res.redirect('/');
            }

            req.session.user = {
                mail:   user.mail,
                state:  user.state
            };
            req.flash('success', 'Successfully activated/checkLink');
            console.log(req.session.user);
            return res.redirect('/u/'+user.mail);
        });
    });
};

/*
 * forget
 */
exports.forget = function(req, res) {
    res.render('forget', {
        title: 'Resend password',
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
    });
};


/*
 * doforget
 */
exports.doForget = function(req, res) {
    var sha1 = crypto.createHash('sha1');
    var time = new Date().toString();
    var link = sha1.update(time).digest('hex');

    //检查用户名是否已经存在
    User.get(req.body.mail, function(err, user) {
        if (!user){
            err = 'User not Existed/.';
            req.flash('error', err);
            return res.redirect('/forget');
        };
        //数据更新与发送邮件
        user.link = link;
        user.updateLink(function(err) {
            if(err){
                req.flash('error', err);
                return res.redirect('/forget');
            }
        });
        //Smtp服务
        Smtp.send(user,'revisePW',req.headers.host, function(err){
        });

        //返回数据
        req.session.user = {
            state:user.state,
            mail:user.mail
        };
        req.flash('success', 'Link sended/doforget');
        return res.redirect('/forget');
    });

};

/*
 * revisePW
 */
exports.revisePW = function(req,res){
    User.get(req.params.user, function(err, user) {
        if (!user) {
            req.flash('error', 'User not Existed/checkLink');
            return res.redirect('/');
        }
        if(req.params.link != user.link){
            req.flash('error', 'Invalid Link/checkLink');
            return res.redirect('/');
        }
        if(user.state != 1)
        {
            req.flash('error', 'User is not activated/checkLink');
            return res.redirect('/');
        }

        req.session.user = {
            mail:   user.mail,
            state:  user.state
        };
        res.render('revisePW', {
            title: "Password Revise",
            user : req.session.user,      //用户仍然认为是登录用户，页面是选择的页面
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
    });
};

/*
 * dorevisePW
 */
exports.doRevisePW = function(req,res){
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.session.mail, function(err, user) {
        if (!user) {
            req.flash('error', 'User not Existed/login');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', 'Wrong password/login');
            //return res.redirect('/login');
            return res.refresh();
        }

        if (user.state === 0)
        {
            req.flash('error', 'User is not activated/login');
            return res.redirect('/checkmail');
        }
        //密码修改操作
        user.updatePW(function(err) {
            if(err){
                req.flash('error', err);
                return res.redirect('/reg');
            }
        });
        req.flash('success', 'Password successfully revised/login');
        res.redirect('/u/'+req.body.mail);
    });
};


/*
 * about页面get方法
 */
exports.getAbout = function(req, res){
    res.render('about', {
        title: 'About StigMod',
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
    });
};