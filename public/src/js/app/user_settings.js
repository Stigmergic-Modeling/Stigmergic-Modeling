define(function (require, exports, module) {

    var $ = require('../lib/jquery');
    require('../lib/bootstrap');

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

        /*  --------------  *
         *  注册主功能监听器
         *  --------------  */

        // 左侧栏点击激活 并跳转
        $(document).on('click', '#stigmod-settings-left .list-group-item', handleClkLeft);

        // 用户 profile 更新
        $(document).on('click', '#stigmod-update-pf-btn', handleClkUpdtPf);
    }

    /*  ----------  *
     *  页面修改函数
     *  ----------  */

    // 填入右侧栏 profile 信息
    function fillRightProfile(user, profile) {
        $('.stigmod-pf-name').val(profile.name);
        $('.stigmod-pf-email').val(user);
        $('.stigmod-pf-location').val(profile.location);
        $('.stigmod-pf-url').val(profile.url);
    }


    /*  ----------  *
     *  事件处理函数
     *  ----------  */

    // 处理：左侧栏点击激活 并跳转
    function handleClkLeft() {

        // 激活
        $(this).closest('#stigmod-settings-left').find('.list-group-item').removeClass('active');
        $(this).addClass('active');

        // 跳转
        //var $it = $(this).find('span:nth-child(1)');
        //stateOfPage.class = $it.text();
        //stateOfPage.flagCRG = ("stigmod-nav-left-class" === $it.attr('class')) ? 0 : 1; // 0: class, 1: relationgroup
        //stateOfPage.flagDepth = 0;
        //fillMiddle(icm);
    }

    // 处理：用户 profile 更新
    function handleClkUpdtPf() {
        var name = $('.stigmod-pf-name').val();
        var location = $('.stigmod-pf-location').val();
        var url = $('.stigmod-pf-url').val();

        $.ajax({
            url: '/u/' + user + '/settings',
            type: 'POST',
            data: {
                profile: {
                    name: name,
                    location: location,
                    url: url
                }
            },
            dataType: 'json',
            success: function (msg) {
                // TODO ?
            },
            error: function () {
                // TODO ?
            }
        })
    }

});