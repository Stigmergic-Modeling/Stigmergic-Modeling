define(function (require, exports, module) {

    var $ = require('../lib/jquery');
    require('../lib/bootstrap');

    // 打开bootstrap的tooltip部分功能
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

    $(document).on('click', '#stigmod-btn-delete', handleDeletingModel);  // 确认删除模型

    function handleDeletingModel() {
        $('#hidden-submit-button').trigger('click');
    }

});