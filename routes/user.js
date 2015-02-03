var host = require('../settings').host;
var User = require('../models/user.js');
var ModelInfo = require('../models/model_info.js');


/**
 * user 页面 get 方法
 */
exports.user = function (req, res) {

    console.log("GET PAGE: User");
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

        var data = {};

        data.user = user.mail;

        data.models = [];

        ModelInfo.getByUser(user.mail, function (err, modelInfo) {

            //console.log(modelInfo);
            //console.log('modelInfo done');

            modelInfo.forEach(function(info) {
                var modelInfoShow = {};
                modelInfoShow.name = info.name;
                modelInfoShow.description = info.description;
                modelInfoShow.update = info.update_date;
                modelInfoShow.classNum = info.class_num;
                modelInfoShow.relNum = info.relation_num;

                //console.log(modelInfoShow);
                data.models.push(modelInfoShow);
            });

            //console.log(data.models);
            //console.log('data.models done');

            res.render('user', {
                host: host,
                title: user.mail,
                user: req.session.user,
                userInfo: user,
                data: data,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
};


