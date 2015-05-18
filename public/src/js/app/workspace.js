define(function (require, exports, module) {

    /*  -------  *
     *  载入模块
     *  -------  */

    // 通用库模块
    var $ = require('../lib/jquery');
    require('../lib/bootstrap');
    require('../lib/mousewheel')($);  // jQuery 鼠标滚轮事件插件
    require('../lib/typeahead.jquery.js')($);  // jQuery 输入框下拉提示插件
    var ObjectId = require('../lib/objectid');  // 用于在浏览器端生成 Mongodb 的 ObjectId

    // 内部模块
    var ICM = require('../module/model');
    var CCM = require('../module/ccm');
    var modelView = require('../module/modelview');  // modelView 是一个函数，接受 icm 作为参数


    // 试验 page 模块
    var Page = require('../module/page');



    /*  ---------  *
     *  初始化变量
     *  ---------  */

    //var fakeICM = [
    //    {
    //        "A": [
    //            {
    //                "time": [
    //                    {
    //                        "name": "time",
    //                        "type": "int"
    //                    }
    //                ]
    //            },
    //            {
    //                "order": [
    //                    "time"
    //                ]
    //            }
    //        ],
    //        "B": [
    //            {
    //                "rewrqw": [
    //                    {
    //                        "name": "rewrqw",
    //                        "type": "int",
    //                        "multiplicity": "1"
    //                    }
    //                ]
    //            },
    //            {
    //                "order": [
    //                    "rewrqw"
    //                ]
    //            }
    //        ],
    //        "C": [
    //            {},
    //            {
    //                "order": []
    //            }
    //        ],
    //        "D": [
    //            {},
    //            {
    //                "order": []
    //            }
    //        ],
    //        "E": [
    //            {},
    //            {
    //                "order": []
    //            }
    //        ],
    //        "F": [
    //            {},
    //            {
    //                "order": []
    //            }
    //        ]
    //    },
    //    {
    //        "A-B": [
    //            {
    //                "554b1a06004b14e8db8afd01": [
    //                    {
    //                        "role": [
    //                            "father",
    //                            "child"
    //                        ],
    //                        "class": [
    //                            "A",
    //                            "B"
    //                        ],
    //                        "multiplicity": [
    //                            "1",
    //                            "1"
    //                        ],
    //                        "type": [
    //                            "Generalization",
    //                            ""
    //                        ]
    //                    }
    //                ]
    //            },
    //            {
    //                "order": [
    //                    "554b1a06004b14e8db8afd01"
    //                ]
    //            }
    //        ]
    //    }
    //];

    // ICM 前端模型
    var icm = new ICM(dataPassedIn.model);  // dataPassedIn 通过后端的 .ejs 模板传入
    //var icm = new ICM(fakeICM);  // 使用假数据
    var ccm = new CCM();


    // modal 推荐栏 list-item 组件
    var componentModalRec = document.getElementById('template-modal-rec').innerHTML;

    /*  ---------  *
     *  初始化页面
     *  ---------  */

    $(document).ready(function () {

        // 初始化组件
        var pageInfo = {
            userName: dataPassedIn.user,
            icmId: dataPassedIn.modelID,
            icmName: dataPassedIn.modelName
        };
        var page = new Page(pageInfo, dataPassedIn.model);
        page.init();


    });


    // 刷新 modal 推荐栏
    function refreshModalRec(selector, data) {
        var data = ccm.getClasses(icm),
                $container = $(selector).empty(),
                i, len, $item, popover;

        //console.log(data);
        for (i = 0, len = data.length; i < len; i++) {
            $item = $(componentModalRec).appendTo($container);
            $item.find('.tag').text(data[i].name);  // 填入名字

            popover = getPopover(data[i].attribute);
            $item.attr('data-content', popover);
            //$(document).on('click', $item, fillInBlanks);
            $item.on('click', fillInBlanks);  // 绑定填表动作
        }

        // 重新激活所有的 popover
        $('[data-toggle="popover"]').popover();

        function getPopover(item) {
            var elem, popover = '', i, len;

            // item 不为空时才进行转换
            if (item) {
                for (i = 0, len = item.length; i < len; i++) {
                    elem = '<p>' + item[i].name;
                    if (item[i].type) {
                        elem += (' : ' + item[i].type);
                    }
                    elem += '</p>';
                    popover += elem;
                }
            }

            //console.log(popover);
            return popover;
        }

        function fillInBlanks(event) {
            var name = $(this).find('span.tag').text();
            console.log(name);
            $(this).closest('div.modal-dialog').find('div.modal-normal input[type=text]:not([readonly])').val(name);
        }
    }

});