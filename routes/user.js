var User = require('../models/user.js');


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

        res.render('user', {
            title: user.mail,
            user: req.session.user,
            userInfo: user,
            data: makeDataForUser(user.mail),
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
};

/**
 * settings 页面 get 方法
 */
exports.settings = function (req, res) {

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
            data: makeDataForSettings(user),
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
};

/**
 * settings 页面 post 方法
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
 * 构造传入给 user 页面的数据
 */
function makeDataForUser(user) {
    var data = {};

    data.user = user;

    data.models =   // 假数据。以后要通过 getUserModelInfo() 函数获得，该函数从数据库中提取数据
    [
        {
            name: 'CourseManagementSystem',
            description: 'The course management system helps teachers to post course information and helps students to choose the courses.',
            update: 1,
            classNum: 37,
            relNum: 41
        },
        {
            name: 'CDStore',
            description: 'A CD store engaged in ordering, renting and selling CDs. There are different categories of CDs. The inventory of each has upper and lower limits, while the number of cds is lower than limit, we should order new ones. Member of the store can get a sale in buying CDs.',
            update: 22,
            classNum: 15,
            relNum: 7
        },
        {
            name: 'CourseManagementSystem',
            description: 'The course management system helps teachers to post course information and helps students to choose the courses.',
            update: 1,
            classNum: 37,
            relNum: 41
        },
        {
            name: 'CDStore',
            description: 'A CD store engaged in ordering, renting and selling CDs. There are different categories of CDs. The inventory of each has upper and lower limits, while the number of cds is lower than limit, we should order new ones. Member of the store can get a sale in buying CDs.',
            update: 22,
            classNum: 15,
            relNum: 7
        },
        {
            name: 'CourseManagementSystem',
            description: 'The course management system helps teachers to post course information and helps students to choose the courses.',
            update: 1,
            classNum: 37,
            relNum: 41
        },
        {
            name: 'CDStore',
            description: 'A CD store engaged in ordering, renting and selling CDs. There are different categories of CDs. The inventory of each has upper and lower limits, while the number of cds is lower than limit, we should order new ones. Member of the store can get a sale in buying CDs.',
            update: 22,
            classNum: 15,
            relNum: 7
        }
    ];

    return data;
}


/**
 * 构造传入给 settings 页面的数据
 */
function makeDataForSettings(user) {
    var data = {};

    data.user = user.mail;

    data.profile = {
        name: user.name,
        location: user.location,
        url: user.url
    };

    return data;
}