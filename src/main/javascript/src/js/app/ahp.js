define(function (require, exports, module) {

    var $ = require('../lib/jquery');
    require('../lib/bootstrap');

    // set CSRF for ajax
    // https://docs.spring.io/spring-security/site/docs/current/reference/html/csrf.html#csrf-include-csrf-token-ajax
    var token = $("meta[name='_csrf']").attr("content");
    var header = $("meta[name='_csrf_header']").attr("content");
    $(document).ajaxSend(function(e, xhr, options) {
        xhr.setRequestHeader(header, token);
    });

    // 翻页
    $(document).on('click', '.stigmod-ahp-next', handleClickNext);
    $(document).on('click', '.stigmod-ahp-prev', handleClickPrev);
    $(document).on('click', '.stigmod-ahp-submit', handleSubmit);

    function handleClickNext() {
        var index = $(this).closest('.btn-group').attr('data-index');

        $('#stigmod-ahp-group-' + index).hide();
        $('#stigmod-ahp-group-' + (Number(index) + 1)).show();
    }

    function handleClickPrev() {
        var index = $(this).closest('.btn-group').attr('data-index');

        $('#stigmod-ahp-group-' + index).hide();
        $('#stigmod-ahp-group-' + (Number(index) - 1)).show();
    }

    function handleSubmit() {

        if ('' === $('#stigmod-ahp-email').val()) {
            alert('请填写邮箱地址');
            return;
        }

        var formJSON = $('#stigmod-ahp-form').serializeArray();

        $.ajax({
            url: '/ahp',
            type: 'POST',
            data: JSON.stringify(formJSON),
            //data: encodeURI(JSON.stringify(formJSON)),  // 把数据字符串化以使空数组能正确传递（加一层 URI 编码以正确传输中文）
            contentType: 'application/json',  // 使服务器端能正确理解数据格式
            success: function (msg) {
                alert('评分提交成功！');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('评分提交失败！');
            }
        });
    }

});