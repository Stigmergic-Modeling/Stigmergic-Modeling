var host = require('../settings').host;
var crypto = require('crypto');
var User = require('../models/user.js');
var Smtp = require('../models/smtp.js');

/**
 * homepage.
 */
exports.index = function (req, res) {

    console.log("GET PAGE: Index");
    console.log(req.headers.host);

    if (req.session.user) {
        if (req.session.user.state ===0) {
            return res.redirect('/checkmail');
        } else {
            return res.redirect('/u/'+req.session.user.mail);
        }
    }

    res.render('index', {
        host: host,
        title: 'HomePage',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
};

/**
 * reg
 */
exports.reg = function (req, res) {

    console.log("GET PAGE: Sign up");
    console.log(req.session.user);

    res.render('reg', {
        host: host,
        title: 'Sign up',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
    //console.log(req.flash('success').toString());
};

/**
 * doReg
 */
exports.doReg = function (req, res) {

    console.log("POST DATA: Sign up");
    console.log(req.session.user);

    // 检查密码
    if (req.body['password-repeat'] != req.body['password']) {
        req.flash('error', 'The two passwords you entered do not match');
        return res.redirect('/reg');
    }

    //var regexPW = /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,40}$/;
    var regexPW = /^.{6,40}$/;

    if (!regexPW.exec(req.body['password'])) {
        req.flash('error', 'Password length no less than 6 and no more than 40 characters');
        return res.redirect('/reg');
    }

    var regexMail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    var result =  regexMail.exec(req.body.mail);

    if (!result) {
        req.flash('error', 'Please use correct mailbox: [number/letter or underscore]@[hostname]. as:. "uml@163.com"');
        return res.redirect('/reg');
    }

    // 生成md5的密码
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    var sha1 = crypto.createHash('sha1');
    var time = new Date().toString();
    var link = sha1.update(time).digest('hex');
    var dateArray = time.split(' ');  // 作为生成用户注册日期的原料

    var newUser = new User({
        //name: req.body.username,
        password: password,
        state: 0,
        mail: req.body.mail,
        link: link,
        name: '',
        location: '',
        url: '',
        signUpDate: dateArray[1] + ' ' + dateArray[2] + ', ' + dateArray[3]
    });

    // 检查用户名是否已经存在
    User.get(newUser.mail, function (err, user) {

        // 如果存在
        if (user) {
            req.flash('error', 'Account already exists');
            return res.redirect('/reg');
        }

        // 如果不存在则新增账户
        newUser.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }

            // Smtp服务
            Smtp.send(newUser, 'checklink', req.headers.host, function(err) {
            });

            // 返回数据
            req.session.user = {
                state:newUser.state,
                mail:newUser.mail
            };

            req.flash('success', 'Sign up successfully /reg');
            res.redirect('/checkmail');
        });
    });
};

/**
 * login
 */
exports.login = function (req, res) {

    console.log("GET PAGE: Sign in");
    console.log(req.session.user);

    res.render('login', {
        host: host,
        title: 'Sign In',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
};

/**
 * doLogin
 */
exports.doLogin = function (req, res) {

    console.log("POST DATA: Sign in");
    console.log(req.session.user);

    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.body.mail, function (err, user) {

        if (!user) {
            req.flash('error', 'Account does not exist');
            return res.redirect('/login');
        }

        if (user.password != password) {
            req.flash('error', 'Wrong password');
            return res.redirect('/login');
        }

        req.session.user = {
            mail:   user.mail,
            state:  user.state
        };

        if (user.state === 0) {
            req.flash('error', 'Account not activated');
            return res.redirect('/checkmail');
        }

        req.flash('success', 'Sign in successfully');
        res.redirect('/u/'+req.body.mail);
    });
};

/**
 * doLogout
 */
exports.logout = function (req, res) {

    console.log("POST DATA: Sign out");
    console.log(req.session.user);

    req.session.user = null;
    req.flash('success', 'Sign out successfully');
    res.redirect('/');
};

/**
 * checkMail
 */
exports.checkMail = function (req, res){

    console.log("GET PAGE: Check mail");
    console.log(req.session.user);

    res.render('checkmail', {
        host: host,
        title: 'Account activation',
        user: req.session.user,                    //aboute cookie
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
};

/**
 * doCheckMail
 */
exports.doCheckMail = function (req, res) {

    console.log("POST DATA: Check mail");
    console.log(req.session.user);

    var sha1 = crypto.createHash('sha1');
    var time = new Date().toString();
    var link = sha1.update(time).digest('hex');

    // 检查用户名是否已经存在
    User.get(req.session.user.mail, function (err, user) {
        if (!user) {
            err = 'Account does not exist';
            req.flash('error', err);
            return res.redirect('/reg');
        }

        // 数据更新与发送邮件
        user.link = link;
        user.updateLink(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
        });

        // Smtp服务
        Smtp.send(user,'checklink',req.headers.host, function (err) {
        });

        // 返回数据
        req.session.user = {
            state:user.state,
            mail:user.mail
        };

        req.flash('success', 'Activation mail sent');
        return res.redirect('/checkmail');
    });
};

/**
 * checkLink
 */
exports.checkLink = function (req, res) {

    console.log("GET DATA: Check link");
    console.log(req.session.user);

    User.get(req.params.user, function (err, user) {

        if (!user) {
            req.flash('error', 'Account does not exist');
            return res.redirect('/');
        }

        if (req.params.link != user.link) {
            req.flash('error', 'Invalid link');
            return res.redirect('/');
        }

        if (user.state != 0) {
            req.flash('error', 'Account already activated');
            req.session.user = {
                mail:   user.mail,
                state:  user.state
            };

            return res.redirect('/');
        }

        //进行存储
        user.activate(function (err, user) {

            console.log("Account activate");
            console.log(user);

            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }

            req.session.user = {
                mail:   user.mail,
                state:  user.state
            };

            req.flash('success', 'Account activated Successfully');
            return res.redirect('/u/'+user.mail);
        });
    });
};

/**
 * forget
 */
exports.forget = function (req, res) {

    console.log("GET PAGE: Forget password");
    console.log(req.session.user);

    res.render('forget', {
        host: host,
        title: 'Resend password',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
};


/**
 * doforget
 */
exports.doForget = function (req, res) {

    console.log("POST DATA: Forget password");
    console.log(req.session.user);

    var sha1 = crypto.createHash('sha1');
    var time = new Date().toString();
    var link = sha1.update(time).digest('hex');

    //检查用户名是否已经存在
    User.get(req.body.mail, function (err, user) {

        if (!user) {
            req.flash('error', 'Account does not exist');
            return res.redirect('/forget');
        }

        //数据更新与发送邮件
        user.link = link;
        user.updateLink(function(err) {
            if(err){
                req.flash('error', err);
                return res.redirect('/forget');
            }
        });

        //Smtp服务
        Smtp.send(user, 'revisePW', req.headers.host, function (err) {
        });

        //返回数据
        req.session.user = {
            state: user.state,
            mail: user.mail
        };

        req.flash('success', 'Activation mail sent');
        return res.redirect('/forget');
    });

};

/**
 * revisePW
 */
exports.revisePW = function (req, res) {

    console.log("GET PAGE: Change password");
    console.log(req.session.user);

    User.get(req.params.user, function (err, user) {

        if (!user) {
            req.flash('error', 'Account does not exist');
            return res.redirect('/');
        }

        if (req.params.link != user.link) {
            req.flash('error', 'Invalid Link');
            return res.redirect('/');
        }

        if (user.state != 1) {
            req.flash('error', 'Account not activated');
            return res.redirect('/');
        }

        req.session.user = {
            mail: user.mail,
            state: user.state
        };

        res.render('revisePW', {
            host: host,
            title: "Password Revise",
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
};

/**
 * dorevisePW
 */
exports.doRevisePW = function (req, res) {

    console.log("POST DATA: Change password");
    console.log(req.session.user);

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.params.user, function (err, user) {  // TODO: 用 req.session.user.mail 好，还是 req.params.user 好？

        if (!user) {
            req.flash('error', 'Account does not exist');
            return res.redirect('/login');
        }

        if (user.state === 0) {
            req.flash('error', 'Account not activated');
            return res.redirect('/checkmail');
        }

        //密码修改操作
        user.updatePW(password, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
        });

        req.flash('success', 'Password changed successfully');
        res.redirect('/u/'+ user.mail);
    });
};


/**
 * about页面get方法
 */
exports.getAbout = function (req, res) {

    console.log("GET PAGE: About Stigmergic-Modeling");
    console.log(req.session.user);

    res.render('about', {
        host: host,
        title: 'About',
        user: req.session.user,
        success: '',
        error: ''
    });
};