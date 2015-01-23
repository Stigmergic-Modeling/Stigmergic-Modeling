var User = require('../models/user.js');


/**
 * user 页面 get 方法
 */
exports.user = function(req, res) {

    console.log("user");
    User.get(req.params.user, function(err, user) {
        if (!user) {
            req.flash('error', 'User not existed/user');

            return res.redirect('/');
        }

        console.log(req.session.user);
        console.log('dfdsfasfdsafdsfsd');
        res.render('user', {
            title: user.mail,
            user: req.session.user,
            userInfo: user,
            data: makeDataForUser(user.mail),
            //active: active,
            success: "",
            error: ""
        });
    });
};

/**
 * settings 页面 get 方法
 */
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
            //data: makeDataForSettings(user.mail),
            success: "",
            error: ""
        });
    });
};

/**
 * 构造传入给 settings 页面的数据
 */
function makeDataForUser(user) {
    var data = {};

    data.user = user;

    data.models =   // 假数据。以后要通过 getUserModelInfo() 函数获得，该函数从数据库中提取数据
    [
        {
            name: 'CourseManagementSystem',
            description: 'The course management system helps teachers to post course infomation and helps students to choose the courses.',
            update: 1,
            classNum: 37,
            relNum: 41
        },
        {
            name: 'CDStore',
            description: 'A CD store engaged in ordering, renting and saling CDs. There are different categories of CDs. The inventory of each has upper and lower limits, while the number of cds is lower than limit, we should order new ones. Member of the store can get a sale in buying CDs.',
            update: 22,
            classNum: 15,
            relNum: 7
        },
        {
            name: 'CourseManagementSystem',
            description: 'The course management system helps teachers to post course infomation and helps students to choose the courses.',
            update: 1,
            classNum: 37,
            relNum: 41
        },
        {
            name: 'CDStore',
            description: 'A CD store engaged in ordering, renting and saling CDs. There are different categories of CDs. The inventory of each has upper and lower limits, while the number of cds is lower than limit, we should order new ones. Member of the store can get a sale in buying CDs.',
            update: 22,
            classNum: 15,
            relNum: 7
        },
        {
            name: 'CourseManagementSystem',
            description: 'The course management system helps teachers to post course infomation and helps students to choose the courses.',
            update: 1,
            classNum: 37,
            relNum: 41
        },
        {
            name: 'CDStore',
            description: 'A CD store engaged in ordering, renting and saling CDs. There are different categories of CDs. The inventory of each has upper and lower limits, while the number of cds is lower than limit, we should order new ones. Member of the store can get a sale in buying CDs.',
            update: 22,
            classNum: 15,
            relNum: 7
        }
    ];

    return data;
}