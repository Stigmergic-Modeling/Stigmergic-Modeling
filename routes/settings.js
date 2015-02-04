var host = require('../settings').host;
var User = require('../models/user.js');
var ModelInfo = require('../models/model_info.js');

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
            host: host,
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
 * settings/account 页面 get 方法
 */
exports.setAccount = function (req, res) {

    console.log("GET PAGE: User settings / account");
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

        res.render('user_settings_account', {
            host: host,
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
 * settings/model general 页面 get 方法
 */
exports.setModelGeneral = function (req, res) {

    console.log("GET PAGE: User settings / model general");
    console.log(req.session.user);

    ModelInfo.getByUser(req.params.user, function (err, modelInfo) {
        var templateData = [];

        //console.log(modelInfo);
        //console.log('modelInfo done');

        modelInfo.forEach(function(info) {
            var modelInfoShow = {};
            modelInfoShow.name = info.name;

            //console.log(modelInfoShow);
            templateData.push(modelInfoShow);
        });

        //console.log(templateData);
        //console.log('templateData done');

        res.render('user_settings_model', {
            host: host,
            title: req.session.user.mail + ' - settings',
            user: req.session.user,
            modelInfo: templateData,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
};

/**
 * settings/model specific 页面 get 方法
 */
exports.setModelSpecific = function (req, res) {

    console.log("GET PAGE: User settings / model specific");
    console.log(req.session.user);

    ModelInfo.getByUser(req.params.user, function (err, modelInfo) {
        var templateData = [];

        //console.log(modelInfo);
        //console.log('modelInfo done');

        modelInfo.forEach(function(info) {
            var modelInfoShow = {};
            modelInfoShow.name = info.name;

            //console.log(modelInfoShow);
            templateData.push(modelInfoShow);
        });

        //console.log(templateData);
        //console.log('templateData done');

        ModelInfo.getOneByUserAndName(req.params.user, req.params.model, function (err, modelInfo) {
            console.log(req.params.user);
            console.log(req.params.model);
            console.log(modelInfo);
            if (!modelInfo) {
                req.flash('error', 'Model does not exist');

                return res.redirect('/u/'+ req.params.user + '/settings/model');
            }

            res.render('user_settings_model_specific', {
                host: host,
                title: modelInfo.user + ' - settings',
                user: req.session.user,
                modelInfo: templateData,  // 该用户所有的 model 信息集合（仅包含 name）
                name: modelInfo.name,  // 该用户选择的特定 model 的信息
                description: modelInfo.description,  // 该用户选择的特定 model 的信息
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });


};

/**
 * settings/model specific 页面 post 方法 (update)
 */
exports.updateModelSpecific = function (req, res) {

    console.log("POST DATA: User settings / model specific (update)");
    console.log(req.session.user);

    var info = {
        description: req.body.description,
        update_date: new Date()
    };

    ModelInfo.getOneByUserAndName(req.params.user, req.params.model, function(err, modelInfo) {

        if (!modelInfo) {
            req.flash('error', 'Model does not exist');
            return res.redirect('/u/'+ req.params.user + '/settings/model');
        }

        // 更新
        modelInfo.updateModelInfo(info, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/u/'+ req.params.user + '/settings/model');
            }
        });

        req.flash('success', 'Model info updated successfully');
        res.redirect('/u/'+ req.params.user + '/settings/model/' + req.params.model);
    });
};

/**
 * settings/model specific 页面 post 方法 (delete)
 */
exports.deleteModel = function (req, res) {

    console.log("POST DATA: User settings / model specific (delete)");
    console.log(req.session.user);

    ModelInfo.deleteOneByUserAndName(req.params.user, req.params.model, function(err) {

        if (err) {
            req.flash('error', err.toString());
            return res.redirect('/u/'+ req.params.user + '/settings/model/' + req.params.model);
        }

        req.flash('success', 'Model info delete successfully');
        res.redirect('/u/'+ req.params.user + '/settings/model');
    });
};