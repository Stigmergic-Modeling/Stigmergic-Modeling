define(function (require, exports, module) {

    var $ = require('../lib/jquery');
    require('../lib/bootstrap');


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

        /*  --------------  *
         *  注册主功能监听器
         *  --------------  */

        // 左侧导航栏点击激活 并跳转
        $(document).on('click', '#stigmod-settings-left .list-group-item', handleClkLeft);
    }

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

});