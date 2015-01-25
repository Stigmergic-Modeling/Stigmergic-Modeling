define(function (require, exports, module) {

    var $ = require('../lib/jquery');
    require('../lib/bootstrap');


    /*  ---------  *
     *  初始化变量
     *  ---------  */

    // 模型信息
    var modelInfo = dataPassedIn.models;
    var user = dataPassedIn.user;

    console.log(modelInfo);

    // 右侧栏的 model info 组件
    var componentModelInfo = document.getElementById('template-model-info').innerHTML;


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

        // 右侧栏填入模型信息
        fillModelInfo(user, modelInfo);

        /*  --------------  *
         *  注册主功能监听器
         *  --------------  */

        ////左侧栏点击激活 并跳转
        //$(document).on('click', '#stigmod-settings-left .list-group-item', handleClkLeft);
    }


    /*  ----------  *
     *  页面修改函数
     *  ----------  */

    // 右侧栏填入模型信息  TODO：可被搜索模块复用
    function fillModelInfo(user, modelInfo) {
        var id, link, update, updateInfo;

        for (var i = 0; i < modelInfo.length; i++) {

            // 初始化值
            id = 'stigmod-modelshow-' + i;
            link = '/'+ user + '/' + modelInfo[i].name + '/workspace';
            update = modelInfo[i].update;
            updateInfo = 'Updated ' + update + (update > 1 ? ' days ago' : ' day ago');

            // 逐个 model 加载模型信息
            var $compo = $('#stigmod-model-info-container').append(componentModelInfo).find('.stigmod-modelshow:last');

            // 填入信息细节
            $compo.prop({id: id});
            $compo.find('.stigmod-modelshow-title > a').prop({href: link}).text(modelInfo[i].name);
            $compo.find('.stigmod-modelshow-class').text(modelInfo[i].classNum);
            $compo.find('.stigmod-modelshow-relation').text(modelInfo[i].relNum);
            $compo.find('.stigmod-modelshow-description').text(modelInfo[i].description);
            $compo.find('.stigmod-modelshow-date').text(updateInfo);
        }
    }


    /*  ----------  *
     *  事件处理函数
     *  ----------  */

    //// 处理：左侧栏点击激活 并跳转
    //function handleClkLeft() {
    //
    //    // 激活
    //    $(this).closest('#stigmod-settings-left').find('.list-group-item').removeClass('active');
    //    $(this).addClass('active');
    //
    //    // 跳转
    //    //var $it = $(this).find('span:nth-child(1)');
    //    //stateOfPage.class = $it.text();
    //    //stateOfPage.flagCRG = ("stigmod-nav-left-class" === $it.attr('class')) ? 0 : 1; // 0: class, 1: relationgroup
    //    //stateOfPage.flagDepth = 0;
    //    //fillMiddle(icm);
    //}



});