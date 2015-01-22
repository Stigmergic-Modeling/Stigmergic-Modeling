var User = require('../models/user.js');

exports.user = function(req, res) {

    console.log("user");
    User.get(req.params.user, function(err, user) {
        if (!user) {
            req.flash('error', 'User not existed/user');

            return res.redirect('/');
        }

        console.log(req.session.user);
        res.render('user', {
            title: user.mail,
            user: req.session.user,
            userInfo: user,
            userModelInfo: getUserModelInfo(user.mail),
            //active: active,
            success: "",
            error: ""
        });
    });
};

exports.settings = function(req, res) {

    console.log("User Settings");
    User.get(req.params.user, function(err, user) {
        if (!user) {
            req.flash('error', 'User not existed /settings');

            return res.redirect('/');
        }

        console.log(req.session.user);
        res.render('user_settings', {
            title: user.mail + ' - settings',
            user: req.session.user,
            userInfo: user,
            userModelInfo: getUserModelInfo(user.mail),
            success: "",
            error: ""
        });
    });
};

function getUserModelInfo(user) {

}