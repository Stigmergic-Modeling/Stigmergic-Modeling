define(function (require, exports, module) {

    /*  -------  *
     *  载入模块
     *  -------  */

    // 通用库模块
    var $ = require('../lib/jquery');
    require('../lib/bootstrap');

    // 内部模块


    // 调试模块
    //var debug = require('../module/debug');


    /*  ---------  *
     *  初始化变量
     *  ---------  */

    var ccmInfo = dataPassedIn.ccmInfo;  // dataPassedIn 通过后端的 .ejs 模板传入
    //console.log(ccmInfo);

    /*  ---------  *
     *  初始化页面
     *  ---------  */

    $(document).ready(controlPage);


    /*  -----------  *
     *  页面控制函数
     *  -----------  */

    function controlPage() {

        /*  -----  *
         *  初始化
         *  -----  */

        // 打开bootstrap的tooltip部分功能
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();

        // 将ccm的名称填入select组件
        for (var name in ccmInfo) {
            //console.log(name);
            $('select[name=ccm]').append('<option>' + name + '</option>');
        }


        /*  --------------  *
         *  注册主功能监听器
         *  --------------  */

        // 选择左侧栏
        $(document).on('click', '#sigmod-newmodel-left', handleClkLeft);

        // 选择右侧栏
        $(document).on('click', '#sigmod-newmodel-right', handleClkRight);

        // 选择右侧栏
        $(document).on('change', 'select[name=ccm]', handleChangeSelect);

    }

    /*  ----------  *
     *  页面修改函数
     *  ----------  */

    // 处理：选择左侧栏
    function handleClkLeft() {

        // 调整宽度，隐藏、显示
        $('#sigmod-newmodel-left').removeClass('col-xs-1 col-xs-4 stigmod-cursor-pointer').addClass('col-xs-7');
        $('#sigmod-newmodel-right').removeClass('col-xs-7 col-xs-4').addClass('col-xs-1 stigmod-cursor-pointer');
        $('.stigmod-hide-when-clk-left').hide();
        $('.stigmod-hide-when-clk-right').show();
        $('#stigmod-newmodel-left-inner').show();
    }

    // 处理：选择右侧栏
    function handleClkRight() {

        // 调整宽度，隐藏、显示
        $('#sigmod-newmodel-right').removeClass('col-xs-1 col-xs-4 stigmod-cursor-pointer').addClass('col-xs-7');
        $('#sigmod-newmodel-left').removeClass('col-xs-7 col-xs-4').addClass('col-xs-1 stigmod-cursor-pointer');
        $('.stigmod-hide-when-clk-right').hide();
        $('.stigmod-hide-when-clk-left').show();
        $('#stigmod-newmodel-right-inner').show();
    }

    // 处理：选择框内容变化
    function handleChangeSelect() {
        var name = $(this).val();
        var description = ccmInfo[name];

        // 在 icm 信息栏中填入 ccm 的信息
        $(this).closest('form').find('input[name=name]').val(name);
        $(this).closest('form').find('textarea[name=description]').text(description);
    }

});