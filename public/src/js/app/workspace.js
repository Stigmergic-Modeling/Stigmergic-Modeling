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



    // 调试模块
    //var debug = require('../module/debug');


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
    //var icm = new ICM(debug.model);  // 调试时使用，从 debug 模块获取 model 数据
    //console.log('dataPassedIn.model', dataPassedIn.model);
    //console.log('icm', icm);

    // 记录 workspace 页面的状态
    var stateOfPage = {
        user: dataPassedIn.user,  // dataPassedIn 通过后端的 .ejs 模板传入
        modelID: dataPassedIn.modelID,  // dataPassedIn 通过后端的 .ejs 模板传入
        modelName: dataPassedIn.modelName,  // dataPassedIn 通过后端的 .ejs 模板传入

        flagCRG: 0,        // 0: class, 1: relationGroup
        flagDepth: 0,      // for class: (0: class, 1: attribute, 2: propertyOfA)
                             // for relationGroup: (0: relationGroup, 1: relation, 2: propertyOfR)

        class: '',         // <-> relationGroup
        attribute: '',     // <-> relation
        property: '',      // <-> property

        addAttrRel: {
            position: '',  // 增加 attribute 或 relation 时 插入的位置  (attrel name 或 '@') ('@' 代表最下方的add按钮)
            direction: 0   // 增加 attribute 或 relation 时 插入的方向 （0: up, 1: down
        },

        windowResizeMutex: 0  // 为防止窗口大小变化时频繁执行某些操作，设置一个锁
    };


    // 左侧栏的类组件
    var componentLeftClass = document.getElementById('template-left-class').innerHTML;

    // 左侧栏的关系组组件
    var componentLeftRelationGroup = document.getElementById('template-left-relation-group').innerHTML;

    // 中间栏的 attribute Basic 组件
    var componentMiddleAttributeBasic = document.getElementById('template-mid-att-basic').innerHTML;

    // 中间栏的 attribute 组件
    var componentMiddleAttribute = document.getElementById('template-mid-att').innerHTML;

    // 中间栏的 relation Basic 组件
    var componentMiddleRelationBasic = document.getElementById('template-mid-rel-basic').innerHTML;

    // 中间栏的 relation 组件
    var componentMiddleRelation = document.getElementById('template-mid-rel').innerHTML;

    // modal 推荐栏 list-item 组件
    var componentModalRec = document.getElementById('template-modal-rec').innerHTML;

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

        //// 左中右栏目高度自适应
        //resizePanel();
        //$(window).on('resize', resizePanel);

        // 初始化组件
        var pageInfo = {
            userName: dataPassedIn.user,
            icmId: dataPassedIn.modelID,
            icmName: dataPassedIn.modelName
        };
        var page = new Page(pageInfo, dataPassedIn.model);
        page.init();

        // 模型可视化
        //modelView(icm);

        // 填入左侧栏的数据
        //page.refreshLeftCol();

        // 打开bootstrap的tooltip部分功能
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();


        // 在锁定滚动条（使之隐藏）的情况下，使用鼠标滚轮控制页面滚动
        $('#stigmod-nav-left-scroll, #stigmod-cont-right-scroll, #stigmod-rcmd-right-scroll, .stigmod-hidden-scroll').on('mousewheel', function(event) {
            var scrollTop = this.scrollTop;

            this.scrollTop = (scrollTop + ((event.deltaY * event.deltaFactor) * -1));
            event.preventDefault();
        });

        /*  --------------  *
         *  注册主功能监听器
         *  --------------  */

        // 左侧导航栏点击激活 并跳转
        //$(document).on('click', '#stigmod-nav-left-scroll .list-group-item', handleClkLeft);

        // 中间内容栏点击激活
        //$(document).on('click', '#stigmod-cont-right .panel', handleClkMid);

        //// 中间栏class状态捕获
        //$(document).on('click', '#stigmod-cont-right-scroll > .row:first-child', handleCapClass);
        //
        //// 中间栏attribute状态捕获
        //$(document).on('click', '#stigmod-cont-right .panel .panel-heading', handleCapAttr);
        //
        //// 中间栏 property 状态捕获
        //$(document).on('click', '#stigmod-cont-right .panel tr', handleCapProp);

        //// 一切“编辑”按钮的点击编辑功能
        //$(document).on('click', '.stigmod-clickedit-btn-edit', handleEnterEdit); // “编辑”按钮的点击编辑功能
        //$(document).on('click', '.stigmod-clickedit-btn-ok', handleSubmitEdit); // 编辑组件内的“提交”按钮功能
        //$(document).on('click', '.stigmod-clickedit-btn-cancel', handleCancelEdit); // 编辑组件内的“取消”按钮功能

        // 点击 add property 下拉菜单选项
        $(document).on('click', '.stigmod-dropdown-addprop .dropdown-menu a', handleClkAddPropDrpdn);

        // 点击 addrelation 中的下拉菜单选项
        $(document).on('click', '#stigmod-dropdown-reltype-modal a', handleClkAddRelDrpdn);

        // 点击 modifyrelation 中的下拉菜单选项
        $(document).on('click', '#stigmod-dropdown-reltype a', handleClkMdfRelDrpdn);

        // addrelation 中点击交换 classname
        $(document).on('click', '#stigmod-addrel-class .glyphicon-transfer', handleClkAddRelDrpdnChg);

        // modifyrelation 中点击交换 classname
        $(document).on('click', '.stigmod-rel-prop-class .glyphicon-transfer', handleClkMdfRelDrpdnChg);

        // 点击 addclass 确认按钮
        //$(document).on('click', '#stigmod-btn-addclass', handleAddClassOk);

        // 点击 addrelationgroup 确认按钮
        //$(document).on('click', '#stigmod-btn-addrelationgroup', handleAddRelGrpOk);

        // addattribute 和 addrelation 的入口
        //$(document).on('click', '.stigmod-addattrel-trig', handleAddAttrRelEntrance);

        //// 点击 addattribute 确认按钮
        //$(document).on('click', '#stigmod-btn-addattribute', handleAddAttrOk);

        //// 点击 addrelation 确认按钮
        //$(document).on('click', '#stigmod-btn-addrelation', handleAddRelOk);

        // att 或 rel 的 .panel 的上下移动
        $(document).on('click', '.fa-arrow-up', handleMoveAttRelPanelUp);
        $(document).on('click', '.fa-arrow-down', handleMoveAttRelPanelDown);

        //// 所有 remove 按钮的入口
        //$(document).on('click', '.fa-remove, .glyphicon-trash, .stigmod-remove-trig', handleRemoveEntrance);

        //// 点击 remove 确认按钮
        //$(document).on('click', '#stigmod-btn-remove', handleRemoveOk);

        //// 点击 show modelView 按钮
        //$(document).on('click', '#stigmod-model-view, #stigmod-model-view-fs', handleShowModelView);

        // 未保存就离开页面
        //$(window).on('beforeunload', handleLeavePage);

        //// 点击保存按钮
        //$(document).on('click', '.stigmod-model-save, .stigmod-model-save-btn', handleClkSave);

        //// 点击左侧搜索按钮
        //$(document).on('click', '#stigmod-search-left-btn', handleClkSearchLeft);

        //// 点击进入全屏
        //$(document).on('click', '.stigmod-enter-full-screen-btn', handleClkEnterFS);
        //
        //// 点击退出全屏
        //$(document).on('click', '.stigmod-exit-full-screen-btn', handleClkExitFS);

        // panel 拖放排序
        $(document).on('dragstart', '#stigmod-cont-right > .panel', handleDragStart);
        $(document).on('dragover', '#stigmod-cont-right > .panel', handleDragOver);
        $(document).on('drop', '#stigmod-cont-right > .panel', handleDrop);

        /*  --------------  *
         *  注册辅功能监听器
         *  --------------  */

        // add attribute 和 add relation 的 modal 中 checkbox 的动作
        $(document).on('change', '#stigmod-modal-addattribute input[type="checkbox"]', handleAddAttrChkBox);
        $(document).on('change', '#stigmod-modal-addrelation input[type="checkbox"]', handleAddRelChkBox);

        // 使 panel 的标题栏中 add property 下拉菜单不随按钮一起隐藏并仅显示尚未添加的 property
        $(document).on('show.bs.dropdown', '.stigmod-hovershow-trig', handleAddPropDrpdn);

        //// 输入框中每输入一个字符，进行一次内容合法性检查
        //// keyup 事件保证 input 的 value 改变后才调用 checkInput
        //$(document).on('keyup', 'input[type=text]', handleCheckInputs);
        //
        //// 输入框的 Enter、ESC 功能 (目前支持：编辑单元.stigmod-clickedit-root 、模态框.modal)
        //$(document).on('keyup', 'input[type=text]', handleKbdCtrlInput);

        // modal 显示时复位
        //var anyModal = '#stigmod-modal-addclass, #stigmod-modal-addrelationgroup, ' +
        //        '#stigmod-modal-addattribute, #stigmod-modal-addrelation';

        //$(document).on('show.bs.modal', anyModal, handleMdlRmTooltip);
        //$(document).on('shown.bs.modal', anyModal, handleMdlFocus);
        //$(document).on('show.bs.modal', '#stigmod-modal-addclass', handleMdlAddClass);
        //$(document).on('show.bs.modal', '#stigmod-modal-addrelationgroup', handleMdlAddRelGrp);
        //$(document).on('show.bs.modal', '#stigmod-modal-addattribute', handleMdlAddAttr);
        //$(document).on('show.bs.modal', '#stigmod-modal-addrelation', handleMdlAddRel);
        $(document).on('show.bs.modal', '#stigmod-modal-remove', handleMdlRemove);


        /**
         * 输入框下拉提示功能中取得子串的辅助函数
         * @param flag
         * @param maxLength
         * @returns {Function}
         */
        var substringMatcher = function(flag, maxLength) {  // 所生成的 matches 集合的最大长度（对于每一个 dataset 来说）

            return function findMatches(q, cb) {
                var matches,
                    substrRegex,
                    strs;  // 将 strs 的生成写在 findMatches 函数中，可保证每次查询时 icm 都是最新的

                switch (flag) {
                    case 'classInICM': strs = Object.keys(icm[0]); break;
                    case 'relGroupInICM': strs = Object.keys(icm[1]); break;
                    case 'classInCCM': strs = ccm.getClassNames(icm); break;
                    default: strs = [];
                }

                // an array that will be populated with substring matches
                matches = [];

                // regex used to determine if a string contains the substring `q`
                substrRegex = new RegExp(q, 'i');

                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                $.each(strs, function(i, str) {
                    if (matches.length <= maxLength && (0 || substrRegex.test(str))) {
                        //console.log(q, str);

                        // the typeahead jQuery plugin expects suggestions to a
                        // JavaScript object, refer to typeahead docs for more info
                        matches.push({ value: str });
                    }
                });

                cb(matches);

                ///**
                // * 数组相减操作
                // * @param a
                // * @param b
                // * @returns {Array}
                // */
                //function arrayMinus(a, b) {
                //    var len = a.length, i = 0, res = [];
                //
                //    for (; i < len; i++) {
                //        if (b.indexOf(a[i]) === -1) {
                //            res.push(a[i]);
                //        }
                //    }
                //
                //    return res;
                //}
            };

        };

        // 为左侧搜索栏添加下拉提示
        $('#stigmod-search-left-input').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },  // 将 class 和 relation group 区分对待：
                {
                    name: 'clsNames',
                    displayKey: 'value',
                    source: substringMatcher('classInICM', 4)
                },
                {
                    name: 'rgNames',
                    displayKey: 'value',
                    source: substringMatcher('relGroupInICM', 4)
                });

        // 为 modelview 搜索栏添加下拉提示
        $('#searchText').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'clsNames',
                    displayKey: 'value',
                    source: substringMatcher('classInICM', 6)
                });

        // 为 addclass modal 添加下拉提示
        $('#stigmod-addclass-input').typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                name: 'clsNames',
                displayKey: 'value',
                source: substringMatcher('classInCCM', 6)
            });

        // 为 addrelationgroup modal 添加下拉提示
        $('#stigmod-addrelgrp-input-first, #stigmod-addrelgrp-input-second').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'clsNames',
                    displayKey: 'value',
                    source: substringMatcher('classInICM', 6)
                });
    }


    /*  ----------  *
     *  页面修改函数
     *  ----------  */


    /*  ----------  *
     *  辅助功能函数
     *  ----------  */

    // addrelation 和 modifyrelation 下拉菜单中的核心处理函数
    function ClkRelDrpdn(reltype, $root, $btn, $nameModify, $roleModify, $multiplicityModify) {
        switch (reltype) {
            case 'Generalization':
                $btn.text('Generalization');
                $nameModify.css({'display': 'none'}).tooltip('destroy');
                $roleModify.eq(0).val('father').tooltip('destroy');
                $roleModify.eq(1).val('child').tooltip('destroy');
                $multiplicityModify.eq(0).attr({'disabled': ''}).val('1').tooltip('destroy');
                $multiplicityModify.eq(1).attr({'disabled': ''}).val('1').tooltip('destroy');
                break;

            case 'Composition':
                $btn.text('Composition');
                $nameModify.css({'display': 'block'}).tooltip('destroy');
                $roleModify.eq(0).val('whole').tooltip('destroy');
                $roleModify.eq(1).val('part').tooltip('destroy');
                $multiplicityModify.eq(0).attr({'disabled': ''}).val('1').tooltip('destroy');
                $multiplicityModify.eq(1).removeAttr('disabled').val('').tooltip('destroy');
                break;

            case 'Aggregation':
                $btn.text('Aggregation');
                $nameModify.css({'display': 'block'}).tooltip('destroy');
                $roleModify.eq(0).val('owner').tooltip('destroy');
                $roleModify.eq(1).val('ownee').tooltip('destroy');
                $multiplicityModify.eq(0).removeAttr('disabled').val('').tooltip('destroy');
                $multiplicityModify.eq(1).removeAttr('disabled').val('').tooltip('destroy');
                break;

            case 'Association':
                $btn.text('Association');
                $nameModify.css({'display': 'block'}).tooltip('destroy');
                $roleModify.eq(0).val('').tooltip('destroy');
                $roleModify.eq(1).val('').tooltip('destroy');
                $multiplicityModify.eq(0).removeAttr('disabled').val('').tooltip('destroy');
                $multiplicityModify.eq(1).removeAttr('disabled').val('').tooltip('destroy');
                break;
        }
    }


    // 失能保存按钮
    function disableSave() {
        $('.stigmod-model-save').hide();
        $('.stigmod-model-saved').show();
        $('.stigmod-model-save-btn').attr({'disabled': ''});
    }

    // 使能保存按钮
    function enableSave() {
        $('.stigmod-model-save').show();
        $('.stigmod-model-saved').hide();
        $('.stigmod-model-save-btn').removeAttr('disabled');
    }

    /*  ----------  *
     *  事件处理函数
     *  ----------  */


    // 处理：add attribute 和 add relation 的 modal 中 checkbox 的动作
    function handleAddAttrChkBox() {
        var id = '#stigmod-addatt-' + $(this).val();

        if ($(this).is(':checked')) {
            $(id).css({'display': 'table-row'});
        } else {
            $(id).css({'display': 'none'});
        }
    }
    function handleAddRelChkBox() {
        var id = '#stigmod-addrel-' + $(this).val();

        if ($(this).is(':checked')) {
            $(id).css({'display': 'table-row'});
        } else {
            $(id).css({'display': 'none'});
        }
    }

    // 处理：使 panel 的标题栏中 addproperty 下拉菜单不随按钮一起隐藏（下拉菜单显示时，去掉该菜单父元素中的悬停显示的触发器）
    function handleAddPropDrpdn() {
        $(this).removeClass('stigmod-hovershow-trig');

        // 顺带解决：下拉菜单展开时显示哪些内容的问题
        $(this).find('.panel-title .dropdown-menu li').show();

        // 下面一行中，不从 stateOfPage 获取 attribute 的原因是 bootstrap 的 dropdown 不好设置 timeout，
        // 而没有 timeout 就不能保证 stateOfPage 的状态是最新的。
        var attributeName = $(this).closest('.panel').attr('stigmod-attrel-name');
        var properties = icm[stateOfPage.flagCRG][stateOfPage.class][0][attributeName][0];

        for (var nameProp in properties) {
            if (properties.hasOwnProperty(nameProp)) {
                $(this).closest('.panel').find('.stigmod-dropdown-' + nameProp).hide();
            }
        }
        $(this).on('hide.bs.dropdown', function () { // 菜单消失时还原触发器
            $(this).addClass('stigmod-hovershow-trig');
        });
    }

    // 处理：点击 add property 下拉菜单选项
    function handleClkAddPropDrpdn(event) {
        var nameProp = $(this).text();

        //// 更新模型 (在编辑确认前，模型也应该加入空值，以保证下拉菜单的显示正确)  TODO：影响了日志的记录，暂时去掉这个功能
        //setTimeout(function () { // 延时是为了解决 stateOfPage 还没有更新就使用未更新的 stateOfPage.attribute 值的问题
        //    if (0 === stateOfPage.flagCRG) {
        //        icm.addPropOfA(stateOfPage.class, stateOfPage.attribute, [nameProp, '']);
        //    } else {
        //        icm.addPropOfR(stateOfPage.class, stateOfPage.attribute, [nameProp, ['', '']]);
        //    }
        //}, 10);

        // 更新显示
        var $propertyRow = $(this).closest('.panel')
                .find('.stigmod-attr-prop-' + nameProp + ', .stigmod-rel-prop-' + nameProp);

        $propertyRow.show(); // 展示该property行
        $propertyRow.find('.stigmod-clickedit-btn-edit').trigger('click'); // 进入编辑状态
        $propertyRow.find('input[type=radio][value=True]').prop('checked', true);  // 单选框都默认勾选 True

        // 展开panel，应对没有展开panel就添加property的情况
        $(this).closest('.panel').find('.panel-collapse').collapse('show');

        event.preventDefault();
    }

    // 处理：点击 addrelation 中的下拉菜单选项
    function handleClkAddRelDrpdn(event) {
        var reltype = $(this).text();
        var $root = $(this).closest('.stigmod-table-addrelation');
        var $btn = $(this).closest('#stigmod-dropdown-reltype-modal').find('button');
        var $nameModify = $root.find('#stigmod-addrel-type').find('.stigmod-input');
        var $roleModify = $root.find('#stigmod-addrel-role').find('.stigmod-input');
        var $multiplicityModify = $root.find('#stigmod-addrel-multiplicity').find('.stigmod-input');

        ClkRelDrpdn(reltype, $root, $btn, $nameModify, $roleModify, $multiplicityModify);

        event.preventDefault();
    }

    // 处理：点击 modifyrelation 中的下拉菜单选项
    function handleClkMdfRelDrpdn(event) {
        var reltype = $(this).text();
        var $root = $(this).closest('.stigmod-table-relation');
        var $btn = $(this).closest('#stigmod-dropdown-reltype').find('button');
        var $nameModify = $root.find('.stigmod-rel-prop-type').find('.stigmod-input');
        var $roleModify = $root.find('.stigmod-rel-prop-role').find('.stigmod-input');
        var $multiplicityModify = $root.find('.stigmod-rel-prop-multiplicity').find('.stigmod-input');

        ClkRelDrpdn(reltype, $root, $btn, $nameModify, $roleModify, $multiplicityModify);

        event.preventDefault();
    }

    // 处理：addrelation 中点击交换 classname
    function handleClkAddRelDrpdnChg(event) {
        var $classnames = $(this).closest('#stigmod-addrel-class').find('.stigmod-input');
        var tmp = $classnames.first().val();

        $classnames.first().val($classnames.last().val());
        $classnames.last().val(tmp);

        event.preventDefault();
    }

    // 处理：modifyrelation 中点击交换 classname
    function handleClkMdfRelDrpdnChg(event) {
        var $classnames = $(this).closest('.stigmod-rel-prop-class').find('.stigmod-input');
        var tmp = $classnames.first().val();

        $classnames.first().val($classnames.last().val());
        $classnames.last().val(tmp);

        event.preventDefault();
    }


    // 处理：att 或 rel 的 .panel 的上下移动
    function handleMoveAttRelPanelUp() {
        var $thisPanel = $(this).closest('.panel');
        var $prevPanel = $thisPanel.prev();

        if ($prevPanel.hasClass('panel')) { // 上面还有 .panel
            var name = $thisPanel.attr('stigmod-attrel-name');

            // 更新模型
            icm.moveOrderElem(stateOfPage.flagCRG, stateOfPage.class, name, -1);

            // 更新显示
            $prevPanel.before($thisPanel);  // 上移当前 panel 节点

            enableSave();

        } else {
            // 已经在最上，不必操作
        }
    }
    function handleMoveAttRelPanelDown() {
        var $thisPanel = $(this).closest('.panel');
        var $nextPanel = $thisPanel.next();

        if ($nextPanel.hasClass('panel')) { // 下面还有 .panel
            var name = $thisPanel.attr('stigmod-attrel-name');

            // 更新模型
            icm.moveOrderElem(stateOfPage.flagCRG, stateOfPage.class, name, 1);

            // 更新显示
            $nextPanel.after($thisPanel);  // 下移当前 panel 节点

            enableSave();

        } else {
            // 已经在最下，不必操作
        }
    }


    function handleMdlRemove() {
        var type = new Array();

        type[0] = new Array('CLASS', 'ATTRIBUTE', 'PROPERTY');
        type[1] = new Array('RELATION GROUP', 'RELATION', 'PROPERTY');

        var name = [stateOfPage.class, stateOfPage.attribute, stateOfPage.property];

        $(this).find('.stigmod-modal-remove-type').text(type[stateOfPage.flagCRG][stateOfPage.flagDepth]);
        $(this).find('.stigmod-modal-remove-name').text(name[stateOfPage.flagDepth]);
    }



    // 处理：panel 拖放排序
    function handleDragStart(event) {

        // 记录被拖动 panel 的 id （实为其子节点 panel-collapse 的 id）
        var id = $(this).find('.panel-collapse').attr('id');
        event.originalEvent.dataTransfer.setData('id', id);
    }
    function handleDragOver(event) {

        event.preventDefault();
    }
    function handleDrop(event) {

        var id = event.originalEvent.dataTransfer.getData('id');
        var $panel = $(document).find('#' + id).parent();
        var name = $panel.attr('stigmod-attrel-name');

        var step = $(this).index() - $panel.index();

        // 当被拖放到原位置时，位置不变
        if (0 === step) {
            return false;
        }

        // 被向下拖放时，向上挤压；
        if (step > 0) {

            // 更新显示
            $(this).after($panel);  // 被向下拖放时，向上挤压该处原有的 panel

        } else if (step < 0) {

            // 更新显示
            $(this).before($panel);  // 被向上拖放时，向下挤压该处原有的 panel
        }

        // 更新模型
        icm.moveOrderElem(stateOfPage.flagCRG, stateOfPage.class, name, step);

        enableSave();
        event.preventDefault();
    }

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