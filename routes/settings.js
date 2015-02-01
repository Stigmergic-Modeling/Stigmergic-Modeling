var User = require('../models/user.js');

/**
 * settings/profile 页面 get 方法
 */
exports.setProfile = function (req, res) {

    console.log("GET PAGE: User settings / profile");
    console.log(req.session.user);

    User.get(req.params.user, function (err, user) {
        if (!user) {
            req.flash('error', 'Account does not exist');

            return res.redirect('/');
        }

        if (user.state === 0) {
            req.flash('error', 'Account not activated');
            return res.redirect('/checkmail');
        }

        res.render('user_settings', {
            title: user.mail + ' - settings',
            user: req.session.user,
            userInfo: user,
            //data: makeDataForSettings(user),
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
};

/**
 * settings/profile 页面 post 方法
 */
exports.updateProfile = function (req, res) {

    console.log("POST DATA: User settings / profile");
    console.log(req.session.user);

    var profile = {
        name: req.body.name,
        location: req.body.location,
        url: req.body.url
    };

    User.get(req.params.user, function (err, user) {

        if (!user) {
            req.flash('error', 'Account does not exist');
            return res.redirect('/login');
        }

        if (user.state === 0) {
            req.flash('error', 'Account not activated');
            return res.redirect('/checkmail');
        }

        //更新 profile 操作
        user.updateProfile(profile, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/u/' + user.mail + '/settings/profile');
            }
        });

        req.flash('success', 'Profile updated successfully');
        res.redirect('/u/'+ user.mail + '/settings/profile');
    });
};


/**
 * settings/model specific 页面 get 方法
 */
exports.setModelSpecific = function (req, res) {

    console.log("GET PAGE: User settings / model specific");
    console.log(req.session.user);

    User.get(req.params.user, function (err, user) {
        if (!user) {
            req.flash('error', 'Account does not exist');

            return res.redirect('/');
        }

        if (user.state === 0) {
            req.flash('error', 'Account not activated');
            return res.redirect('/checkmail');
        }

        res.render('user_settings_model_specific', {
            title: user.mail + ' - settings',
            user: req.session.user,
            userInfo: user,
            model: req.params.model,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
};

/**
 * settings/model 页面 post 方法
 */
exports.updateModelSpecific = function (req, res) {

    console.log("POST DATA: User settings / model specific");
    console.log(req.session.user);

    //var profile = {
    //    name: req.body.name,
    //    location: req.body.location,
    //    url: req.body.url
    //};
    //
    //User.get(req.params.user, function (err, user) {
    //
    //    if (!user) {
    //        req.flash('error', 'Account does not exist');
    //        return res.redirect('/login');
    //    }
    //
    //    if (user.state === 0) {
    //        req.flash('error', 'Account not activated');
    //        return res.redirect('/checkmail');
    //    }
    //
    //    //更新 profile 操作
    //    user.updateProfile(profile, function (err) {
    //        if (err) {
    //            req.flash('error', err);
    //            return res.redirect('/u/' + user.mail + '/settings/profile');
    //        }
    //    });
    //
    //    req.flash('success', 'Profile updated successfully');
    //    res.redirect('/u/'+ user.mail + '/settings/profile');
    //});
};