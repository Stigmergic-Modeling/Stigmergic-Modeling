define(function (require, exports, module) {

    var $ = require('../lib/jquery');
    require('../lib/bootstrap');

    /**
     * 滚动监听
     */

    var offset = 70;
    $('body').scrollspy({
        target: '#stigmod-navbar',
        offset: offset  //  这个 offset 只是管 spy 的，不管点击跳转时的 offset （跳转时的 offset 由 .stigmod-help-title 处理）
    });

});