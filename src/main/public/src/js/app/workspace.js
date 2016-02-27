define(function (require, exports, module) {

    /*  -------  *
     *  载入模块
     *  -------  */

    // 通用库模块
    var $ = require('../lib/jquery');

    // page 模块
    var Page = require('../module/page');


    /*  ---------  *
     *  初始化页面
     *  ---------  */

    $(document).ready(function () {

        // 初始化组件
        var pageInfo = {
            userName: dataPassedIn.userName,
            icmId: dataPassedIn.icmId,
            icmName: dataPassedIn.icmName
        };
        var page = new Page(pageInfo, dataPassedIn.model);
        page.init();
    });
});