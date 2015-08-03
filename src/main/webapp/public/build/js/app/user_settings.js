define("js/app/user_settings", [ "../lib/jquery", "../lib/bootstrap" ], function(require, exports, module) {
    var $ = require("../lib/jquery");
    require("../lib/bootstrap");
    /*  ---------  *
     *  初始化变量
     *  ---------  */
    // 用户账户信息
    var user = dataPassedIn.user;
    var profile = dataPassedIn.profile;
    /*  ---------  *
     *  初始化页面
     *  ---------  */
    $(document).ready(controlPage);
    /*  -----------  *
     *  页面控制函数
     *  -----------  */
    function controlPage() {
        // 打开bootstrap的tooltip部分功能
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();
        // 填入右侧栏 profile 信息
        fillRightProfile(user, profile);
    }
    /*  ----------  *
     *  页面修改函数
     *  ----------  */
    // 填入右侧栏 profile 信息
    function fillRightProfile(user, profile) {
        $(".stigmod-pf-name").val(profile.name);
        $(".stigmod-pf-email").val(user);
        $(".stigmod-pf-location").val(profile.location);
        $(".stigmod-pf-url").val(profile.url);
    }
});