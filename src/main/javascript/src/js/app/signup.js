define(function (require, exports, module) {

    var $ = require('../lib/jquery');
    require('../lib/bootstrap');

    // 点击注册后失能注册按钮一段时间，防止快速重复点击引发 bug
    $(document).on('click', '#stigmod-fake-submit-1', function() {

        var $fakeSubmit1 = $('#stigmod-fake-submit-1');
        var $fakeSubmit2 = $('#stigmod-fake-submit-2');
        var $realSubmit = $('#stigmod-real-submit');

        $fakeSubmit1.hide();
        $fakeSubmit2.show();

        setTimeout(function() {
            $fakeSubmit2.hide();
            $fakeSubmit1.show();
        }, 10000);

        $realSubmit.trigger('click');
    });

    // 失能回车提交表单功能
    $(document).on('keydown', 'input', function(event){
        if(13 === event.keyCode) {
            event.preventDefault();
            return false;
        }
    });

});