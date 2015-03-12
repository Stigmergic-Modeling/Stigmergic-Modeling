var settings = require('../settings');

exports.checkLogin = function (req, res, next) {

    console.log("CHECK: Check login");
    console.log(req.session.user);

    if (!req.session.user) {
        req.flash('error', 'Not signed in');
        return res.redirect('/login');
    }

    if (req.session.user.state === 0) {
        req.flash('error', 'Account not activated');
        return res.redirect('/checkmail');
    }

    next();
};

exports.checkNotLogin = function (req, res, next) {

    console.log("CHECK: Check not login");
    console.log(req.session.user);

    if (req.session.user) {

        if(req.session.user.state === 0){
            req.flash('error', 'Account not activated');
            return res.redirect('/checkmail');

        } else {

            req.flash('error', 'Already signed in');
            return res.redirect('/u/'+req.session.user.mail);
        }
    }

    next();
};

exports.checkNotActive = function (req, res, next) {

    console.log("CHECK: Check not activated");
    console.log(req.session.user);

    if (!req.session.user) {
        req.flash('error', 'Not signed in');
        return res.redirect('/login');

    } else {

        if (req.session.user.state !== 0) {
            req.flash('error', 'Account already activated');
            return res.redirect('/u/'+req.session.user.mail);
        }
    }

    next();
};