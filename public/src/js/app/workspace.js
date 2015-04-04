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
    var Model = require('../module/model');
    require('../module/modelview');

    // 调试模块
    //var debug = require('../module/debug');


    /*  ---------  *
     *  初始化变量
     *  ---------  */

    // ICM 前端模型
    var icm = new Model(dataPassedIn.model);  // dataPassedIn 通过后端的 .ejs 模板传入
    //var icm = new Model(debug.model);  // 调试时使用，从 debug 模块获取 model 数据
    console.log('dataPassedIn.model', dataPassedIn.model);
    console.log('icm', icm);

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
        }
    };

    var panelHeight = {
        left: 312,
        middle: 202,
        right: 202
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

        // 填入左侧栏的数据
        fillLeft(icm);

        // 打开bootstrap的tooltip部分功能
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();

        // 左中右栏目高度自适应
        resizePanel();
        $(window).on('resize', resizePanel);

        // 在锁定滚动条（使之隐藏）的情况下，使用鼠标滚轮控制页面滚动
        $('#stigmod-nav-left-scroll, #stigmod-cont-right-scroll, #stigmod-rcmd-right-scroll').on('mousewheel', function(event) {
            var scrollTop = this.scrollTop;

            this.scrollTop = (scrollTop + ((event.deltaY * event.deltaFactor) * -1));
            event.preventDefault();
        });

        /*  --------------  *
         *  注册主功能监听器
         *  --------------  */

        // 左侧导航栏点击激活 并跳转
        $(document).on('click', '#stigmod-nav-left-scroll .list-group-item', handleClkLeft);

        // 中间内容栏点击激活
        $(document).on('click', '#stigmod-cont-right .panel', handleClkMid);

        // 中间栏class状态捕获
        $(document).on('click', '#stigmod-cont-right-scroll > .row:first-child', handleCapClass);

        // 中间栏attribute状态捕获
        $(document).on('click', '#stigmod-cont-right .panel .panel-heading', handleCapAttr);

        // 中间栏 property 状态捕获
        $(document).on('click', '#stigmod-cont-right .panel tr', handleCapProp);

        // 一切“编辑”按钮的点击编辑功能
        $(document).on('click', '.stigmod-clickedit-btn-edit', handleEnterEdit); // “编辑”按钮的点击编辑功能
        $(document).on('click', '.stigmod-clickedit-btn-ok', handleSubmitEdit); // 编辑组件内的“提交”按钮功能
        $(document).on('click', '.stigmod-clickedit-btn-cancel', handleCancelEdit); // 编辑组件内的“取消”按钮功能

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
        $(document).on('click', '#stigmod-btn-addclass', handleAddClassOk);

        // 点击 addrelationgroup 确认按钮
        $(document).on('click', '#stigmod-btn-addrelationgroup', handleAddRelGrpOk);

        // addattribute 和 addrelation 的入口
        $(document).on('click', '.stigmod-addattrel-trig', handleAddAttrRelEntrance);

        // 点击 addattribute 确认按钮
        $(document).on('click', '#stigmod-btn-addattribute', handleAddAttrOk);

        // 点击 addrelation 确认按钮
        $(document).on('click', '#stigmod-btn-addrelation', handleAddRelOk);

        // att 或 rel 的 .panel 的上下移动
        $(document).on('click', '.fa-arrow-up', handleMoveAttRelPanelUp);
        $(document).on('click', '.fa-arrow-down', handleMoveAttRelPanelDown);

        // 所有 remove 按钮的入口
        $(document).on('click', '.fa-remove, .glyphicon-trash, .stigmod-remove-trig', handleRemoveEntrance);

        // 点击 remove 确认按钮
        $(document).on('click', '#stigmod-btn-remove', handleRemoveOk);

        // 未保存就离开页面
        $(window).on('beforeunload', handleLeavePage);

        // 点击保存按钮
        $(document).on('click', '.stigmod-model-save, .stigmod-model-save-btn', handleClkSave);

        // 点击左侧搜索按钮
        $(document).on('click', '#stigmod-search-left-btn', handleClkSearchLeft);

        // 点击进入全屏
        $(document).on('click', '.stigmod-enter-full-screen-btn', handleClkEnterFS);

        // 点击退出全屏
        $(document).on('click', '.stigmod-exit-full-screen-btn', handleClkExitFS);

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

        // 输入框中每输入一个字符，进行一次内容合法性检查
        // keyup 事件保证 input 的 value 改变后才调用 checkInput
        $(document).on('keyup', 'input[type=text]', handleCheckInputs);

        // 输入框的 Enter、ESC 功能 (目前支持：编辑单元.stigmod-clickedit-root 、模态框.modal)
        $(document).on('keyup', 'input[type=text]', handleKbdCtrlInput);

        // modal 显示时复位
        var anyModal = '#stigmod-modal-addclass, #stigmod-modal-addrelationgroup, ' +
                '#stigmod-modal-addattribute, #stigmod-modal-addrelation';

        $(document).on('show.bs.modal', anyModal, handleMdlRmTooltip);
        $(document).on('shown.bs.modal', anyModal, handleMdlFocus);
        $(document).on('show.bs.modal', '#stigmod-modal-addclass', handleMdlAddClass);
        $(document).on('show.bs.modal', '#stigmod-modal-addrelationgroup', handleMdlAddRelGrp);
        $(document).on('show.bs.modal', '#stigmod-modal-addattribute', handleMdlAddAttr);
        $(document).on('show.bs.modal', '#stigmod-modal-addrelation', handleMdlAddRel);
        $(document).on('show.bs.modal', '#stigmod-modal-remove', handleMdlRemove);


        /**
         * 输入框下拉提示功能中取得子串的辅助函数
         * @param strs
         * @returns {Function}
         */
        var substringMatcher = function(strs) {

            // 所生成的 matches 集合的最大长度
            var maxLength = 8;

            return function findMatches(q, cb) {
                var matches, substringRegex;

                // an array that will be populated with substring matches
                matches = [];

                // regex used to determine if a string contains the substring `q`
                substrRegex = new RegExp(q, 'i');

                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                $.each(strs, function(i, str) {
                    if (matches.length <= maxLength && substrRegex.test(str)) {
                        // the typeahead jQuery plugin expects suggestions to a
                        // JavaScript object, refer to typeahead docs for more info
                        matches.push({ value: str });
                    }
                });

                cb(matches);
            };
        };

        // 获取所有类名和关系组名
        var clsRgNames = (Object.keys(icm[0])).concat(Object.keys(icm[1]));

        // 为左侧搜索栏添加下拉提示
        $('.typeahead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'clsRgNames',
                    displayKey: 'value',
                    source: substringMatcher(clsRgNames)
                });

    }


    /*  ----------  *
     *  页面修改函数
     *  ----------  */

    // 修改左侧栏并激活，然后跳转
    function modifyLeftAndJump(model, name) {

        // 刷新
        fillLeft(model);  // 填充左侧不会使滚动条移动

        // jump (激活并跳转)
        $(document)
                .find('#stigmod-pg-workspace #stigmod-nav-left-scroll .panel .list-group span[stigmod-nav-left-tag=' + name + ']')
                .trigger('click');
    }

    // 修改左侧栏并激活，不跳转
    function modifyLeft(model, name) {

        // 刷新
        fillLeft(model);

        // 重新激活
        var $this = $(document)
                    .find('#stigmod-nav-left-scroll .panel .list-group span[stigmod-nav-left-tag=' + name + ']')
                    .parent();
        $this.closest('#stigmod-nav-left-scroll').find('.list-group-item').removeClass('active');
        $this.addClass('active');
    }

    // 刷新中间栏 .panel 组件的 title
    function refreshMiddelPanelTitle(model) {
        var $panels = $('#stigmod-cont-right .panel');

        $panels.each(function () {

            // 对于每一个 attribute 或 relation
            var $title = $(this).find('.panel-title > div.row > div:nth-child(2)');
            var properties = icm.getProp(stateOfPage.flagCRG, stateOfPage.class, $(this).attr('stigmod-attrel-name'));
            var title = '';

            if (0 === stateOfPage.flagCRG) {

                // 逐个拼接 properties
                if (undefined !== properties.visibility) {
                    var visSign = '';
                    switch (properties.visibility) {
                        case 'public':
                            visSign = '+';
                            break;
                        case 'private':
                            visSign = '-';
                            break;
                        case 'protected':
                            visSign = '#';
                            break;
                        case 'package':
                            visSign = '~';
                            break;
                    }
                    title = title + visSign + ' ';
                }
                if (undefined !== properties.name) {
                    title = title + properties.name + ' ';
                }
                if (undefined !== properties.type) {
                    title = title + ': ' + properties.type + ' ';
                }
                if (undefined !== properties.multiplicity) {
                    title = title + '[' + properties.multiplicity + '] ';
                }
                if (undefined !== properties.default) {
                    title = title + '= ' + properties.default + ' ';
                }

                // 更新 title
                $title.text(title);

            } else {

                var left = properties.class[0];
                var right = properties.class[1];
                var middle = properties.type[1];

                if ('' !== middle) {
                    middle = '(' + middle + ')';
                }

                switch (properties.type[0]) {
                    case 'Generalization':
                        middle = ' ◁—' + middle + '—— ';
                        break;
                    case 'Composition':
                        middle = ' ◆—' + middle + '—— ';
                        break;
                    case 'Aggregation':
                        middle = ' ◇—' + middle + '—— ';
                        break;
                    case 'Association':
                        middle = ' ——' + middle + '—— ';
                        break;
                }

                if (undefined !== properties.multiplicity) {
                    left = left + ' [' + properties.multiplicity[0] + '] ';
                    right = ' [' + properties.multiplicity[1] + '] ' + right;
                }

                // 更新 title
                $title.empty();
                $title.append('<span>' + left + '</span>');
                $title.append('<span>' + middle + '</span>').find('span:last-child').css({'font-family': 'Lucida Console'});
                $title.append('<span>' + right + '</span>');
            }
        });
    }

    // 局部添加中间栏组件
    function insertMiddle(model, name, noUnfold) {

        // 若第三个参数 noUnfold 被传入且为真，则仅点击一次（变为蓝色）；否则点击两次（变蓝且展开）
        var $compo = null;
        var collapseIndex = null;

        // 计算新 .panel 的编号
        var strPanel = '#stigmod-cont-right .panel ' +
                ((0 === stateOfPage.flagCRG) ? '.stigmod-attr-cont-middle-title' : '.stigmod-rel-cont-middle-title');
        var $panelTitle = $(strPanel); // 取出所有 .panel

        if (0 === $panelTitle.length) { // 还没有 .panel
            collapseIndex = 0;

        } else { // 已经有至少一个 .panel
            var indexMax = -1;

            $panelTitle.each(function () {
                var indexTmp = $(this).attr('data-target');
                indexTmp = parseInt(indexTmp.substr('#collapse'.length));

                if (indexTmp > indexMax) {
                    indexMax = indexTmp;
                }
            });

            collapseIndex = indexMax + 1; // 由于上下移动 attrel 功能的加入，这里需要取所有现存编号中的最大值加一作为新的编号
        }

        // 找到正确的位置并插入新 .panel
        if ('@' === stateOfPage.addAttrRel.position) {
            $compo = $('#stigmod-cont-right .list-group')
                    .before(0 === stateOfPage.flagCRG ? componentMiddleAttribute : componentMiddleRelation).prev();
        } else {
            if (0 === stateOfPage.addAttrRel.direction) { // 上插
                $compo = $('#stigmod-cont-right .panel[stigmod-attrel-name=' + stateOfPage.addAttrRel.position + ']')
                        .before(0 === stateOfPage.flagCRG ? componentMiddleAttribute : componentMiddleRelation).prev();
            } else { // 下插
                $compo = $('#stigmod-cont-right .panel[stigmod-attrel-name=' + stateOfPage.addAttrRel.position + ']')
                        .after(0 === stateOfPage.flagCRG ? componentMiddleAttribute : componentMiddleRelation).next();
            }
        }

        // 在 .panel 中记录 attribute 或 relation 的名字，便于点击时更新 stateOfPage
        $compo.attr({'stigmod-attrel-name': name});

        // 设置collapse属性
        var strTitle = 0 === stateOfPage.flagCRG ? '.stigmod-attr-cont-middle-title' : '.stigmod-rel-cont-middle-title';
        var $collapseTrigger = $compo.find(strTitle).attr({'data-target': '#collapse' + collapseIndex});
        var $collapseContent = $compo.find('.panel-collapse').attr({'id': 'collapse' + collapseIndex});
        var modelProperties = model[stateOfPage.flagCRG][stateOfPage.class][0][name][0];

        for (var modelProperty in modelProperties) {
            if (modelProperties.hasOwnProperty(modelProperty)) {
                var $propertyRow = null;

                if (0 === stateOfPage.flagCRG) {
                    $propertyRow = $collapseContent.find('.stigmod-attr-prop-' + modelProperty).show();

                    $propertyRow.find('td:nth-child(2) > .stigmod-clickedit-disp')
                            .text(model[stateOfPage.flagCRG][stateOfPage.class][0][name][0][modelProperty]);

                } else {
                    $propertyRow = $collapseContent.find('.stigmod-rel-prop-' + modelProperty).show();

                    $propertyRow.find('td:nth-child(2) > .stigmod-clickedit-disp')
                            .text(model[stateOfPage.flagCRG][stateOfPage.class][0][name][0][modelProperty][0]);
                    $propertyRow.find('td:nth-child(3) > .stigmod-clickedit-disp')
                            .text(model[stateOfPage.flagCRG][stateOfPage.class][0][name][0][modelProperty][1]);
                }
            }
        }

        // 刷新所有panel的标题
        refreshMiddelPanelTitle(model);

        // 激活本panel
        if (noUnfold) {
            $compo.trigger('click'); // 变蓝，不展开

        } else {
            $compo.trigger('click'); // 变蓝

            setTimeout(function () {  // 展开
                var strTitle = 0 === stateOfPage.flagCRG ?
                        '.stigmod-attr-cont-middle-title' : '.stigmod-rel-cont-middle-title';

                $compo.find(strTitle).trigger('click');
            }, 10);
        }
    }

    // 局部删除中间栏组件
    function removeMiddle(model, name) {

        $('#stigmod-cont-right .panel[stigmod-attrel-name=' + name + ']').remove();
    }

    // 填充左侧栏
    function fillLeft(model) {
        var $compo = null,
                i;

        // 向左侧栏填入 class 组件和数据
        var modelClassOrdered = [];
        $compo = $('#stigmod-nav-left-scroll .panel:first-child .list-group').empty(); // 清空
        var modelClasses = model[0];

        for (var modelClass in modelClasses) { // 类名读入数组
            if (modelClasses.hasOwnProperty(modelClass)) {
                modelClassOrdered.push(modelClass);
            }
        }

        modelClassOrdered.sort(); // 排序

        for (i = 0; i < modelClassOrdered.length; ++i) { // 类名
            $compo.append(componentLeftClass);
            $compo.find('a:last-child > span:first-child').text(modelClassOrdered[i])
                    .attr('stigmod-nav-left-tag', modelClassOrdered[i]); // 以名称作为标签写在组件上，便于查找
        }

        // 向左侧栏填入 relation group 组件和数据
        var modelRelationGroupOrdered = [];
        var modelRelationGroups = model[1];
        $compo = $('#stigmod-nav-left-scroll .panel:last-child .list-group').empty(); // 清空

        for (var modelRelationGroup in modelRelationGroups) { // 关系组名读入数组
            if (modelRelationGroups.hasOwnProperty(modelRelationGroup)) {
                modelRelationGroupOrdered.push(modelRelationGroup);
            }
        }

        modelRelationGroupOrdered.sort(); // 排序

        for (i = 0; i < modelRelationGroupOrdered.length; ++i) { // 关系组名
            $compo.append(componentLeftRelationGroup);
            $compo.find('a:last-child > span:first-child').text(modelRelationGroupOrdered[i])
                    .attr('stigmod-nav-left-tag', modelRelationGroupOrdered[i]); // 以名称作为标签写在组件上，便于查找
        }
    }

    // 填充中间栏为空白
    function fillMiddleBlank() {
        $('#stigmod-cont-right-scroll').empty();
    }

    // 填充中间栏的基本框架
    function fillMiddleBasic() {
        var $frame = $('#stigmod-cont-right-scroll');
        $frame.empty();
        $frame.append(0 === stateOfPage.flagCRG ? componentMiddleAttributeBasic : componentMiddleRelationBasic);
    }

    // 填充中间栏
    function fillMiddle(model) { // flagCRG 标明是 Class(0) 还是 RelationGroup(1), nameCRG 是 Class 或 RelationGroup 的名字

        // 填入中间栏基本页面
        fillMiddleBasic();

        // 向中间栏填入组件和数据
        $('#stigmod-classname > span:nth-child(2)').text(stateOfPage.class);
        $('#stigmod-cont-right .panel').remove(); // 清空
        var modelAttribute = model[stateOfPage.flagCRG][stateOfPage.class][1]['order']; // 获取 attribute 或 relation 的顺序信息

        for (var i = 0; i < modelAttribute.length; ++i) { // i 既是 attrel 的编号， 也是 collapse 的序号
            var $compo = $('#stigmod-cont-right .list-group')
                    .before(0 === stateOfPage.flagCRG ? componentMiddleAttribute : componentMiddleRelation)
                    .prev();

            // 在 .panel 中记录 attribute 或 relation 的名字，便于点击时更新 stateOfPage
            $compo.attr({'stigmod-attrel-name': modelAttribute[i]});

            // 设置collapse属性
            var strTitle = 0 === stateOfPage.flagCRG ?
                    '.stigmod-attr-cont-middle-title' : '.stigmod-rel-cont-middle-title';
            var $collapseTrigger = $compo.find(strTitle).attr({'data-target': '#collapse' + i});
            var $collapseContent = $compo.find('.panel-collapse').attr({'id': 'collapse' + i});
            var modelProperties = model[stateOfPage.flagCRG][stateOfPage.class][0][modelAttribute[i]][0];

            // 设置 properties
            for (var modelProperty in modelProperties) {
                if (modelProperties.hasOwnProperty(modelProperty)) {
                    var $propertyRow = null;

                    if (0 === stateOfPage.flagCRG) { // class
                        $propertyRow = $collapseContent.find('.stigmod-attr-prop-' + modelProperty).show();

                        $propertyRow.find('td:nth-child(2) > .stigmod-clickedit-disp')
                                .text(model[stateOfPage.flagCRG][stateOfPage.class][0][modelAttribute[i]][0][modelProperty]);

                    } else { // relationGroup
                        $propertyRow = $collapseContent.find('.stigmod-rel-prop-' + modelProperty).show();

                        $propertyRow.find('td:nth-child(2) > .stigmod-clickedit-disp')
                                .text(model[stateOfPage.flagCRG][stateOfPage.class][0][modelAttribute[i]][0][modelProperty][0]);
                        $propertyRow.find('td:nth-child(3) > .stigmod-clickedit-disp')
                                .text(model[stateOfPage.flagCRG][stateOfPage.class][0][modelAttribute[i]][0][modelProperty][1]);
                    }
                }
            }
        }

        // 刷新所有panel的标题
        refreshMiddelPanelTitle(model);
    }

    // 左中侧三栏（panel）高度调整
    function resizePanel() {
        var windowHeight = $(window).height();

        $('#stigmod-nav-left-scroll').height(windowHeight - panelHeight.left);
        $('#stigmod-cont-right-scroll').height(windowHeight - panelHeight.middle);
        $('#stigmod-rcmd-right-scroll').height(windowHeight - panelHeight.right);
    }

    // 显示遮罩
    function showMask() {
        $('.stigmod-mask-white').show();
        $('.stigmod-loader').show();
        $('.stigmod-loader-text').show();
    }

    // 隐藏遮罩
    function hideMask() {
        $('.stigmod-mask-white').hide();
        $('.stigmod-loader').hide();
        $('.stigmod-loader-text').hide();
    }

    /*  ----------  *
     *  辅助功能函数
     *  ----------  */

    // 获取输入内容合法性检查结果
    function getInputCheckResult(model, inputCase, input) {

        var pattern = null;
        switch (inputCase) {

            // 类名
            case 'class-add':
                pattern = /^[A-Z][A-Za-z]*$/;
                if (!pattern.test(input)) {  // 格式不合法
                    return 'Valid Format: ' + pattern.toString();
                } else if (model.doesNodeExist(0, input)) {  // 类名重复
                    return 'Class already exists.';
                } else {  // 合法
                    return 'valid';
                }
                break;
            case 'class-modify':
                pattern = /^[A-Z][A-Za-z]*$/;
                if (!pattern.test(input)) {  // 格式不合法
                    return 'Valid Format: ' + pattern.toString();
                } else if ((stateOfPage.class !== input) && model.doesNodeExist(0, input)) {  // 新类名与【其他】类名重复 (与该类修改前类名重复是允许的)
                    return 'Class already exists.';
                } else {  // 合法
                    return 'valid';
                }
                break;

            // 关系组
            case 'relationgroup-add':
                if (!model.doesNodeExist(0, input)) {  // 类名不存在
                    return 'Class does not exist.';
                } else {  // 合法
                    return 'valid';
                }
                break;

            // attribute 名
            case 'attribute-add':
                pattern = /^[a-z][A-Za-z]*$/;
                if (!pattern.test(input)) {  // 格式不合法
                    return 'Valid Format: ' + pattern.toString();
                } else if (model.doesNodeExist(2, input, stateOfPage.class)) {  // attribute 名重复
                    return 'Attribute name already exists.';
                } else {  // 合法
                    return 'valid';
                }
                break;
            case 'attribute-modify':
                pattern = /^[a-z][A-Za-z]*$/;
                if (!pattern.test(input)) {  // 格式不合法
                    return 'Valid Format: ' + pattern.toString();
                } else if ((stateOfPage.attribute !== input) && model.doesNodeExist(2, input, stateOfPage.class)) {  // attribute 名与其他 attribute 重复
                    return 'Attribute name already exists.';
                } else {  // 合法
                    return 'valid';
                }
                break;

            // 类型名
            case 'type-add':
            case 'type-modify':
                pattern = /^(int|float|string|boolean)$/;  // build-in types
                if (!pattern.test(input) && !(model.doesNodeExist(0, input))) {  // 不是内置类型，也不是类
                    return 'Valid Type: A class or built-in type (int|float|string|boolean).';
                } else {  // 合法
                    return 'valid';
                }
                break;

            // 多重性
            case 'multiplicity-add':
            case 'multiplicity-modify':
                pattern = /^(\*|\d+(\.\.(\d+|\*))?)$/;
            function isValidMultiplicity(mul) {  // 检验是否第一个数小于第二个数
                var hasTwoNum = /\.\./;
                if (hasTwoNum.test(mul)) {
                    var num = input.split('..');  // 获得“..”两端的数字
                    if ('*' !== num[1]) {
                        return parseInt(num[0]) < parseInt(num[1]);  // 当第一个数大于等于第二个数时，返回 false
                    }
                }
                return true;  // 其他情况都返回 true
            }

                if (!pattern.test(input)) {  // 格式不合法
                    return 'Valid Format: ' + pattern.toString();
                } else if (!isValidMultiplicity(input)) {  // 第一个数大于第二个数
                    return 'The second number should be bigger.';
                } else {  // 合法
                    return 'valid';
                }

            // 可见性
            case 'visibility-add':
            case 'visibility-modify':
                pattern = /^(public|private|protected|package)$/;
                if (!pattern.test(input)) {
                    return 'Valid Format: ' + pattern.toString();
                } else {  // 合法
                    return 'valid';
                }
                break;

            // relation 名
            case 'relation-add':
            case 'relation-modify':
                pattern = /^(|[a-z][A-Za-z]*)$/;  // 可为空
                if (!pattern.test(input)) {  // 不是内置类型，也不是类
                    return 'Valid Type: ' + pattern.toString();
                } else {  // 合法
                    return 'valid';
                }
                break;

            // relation 两端的角色
            case 'role-add':
            case 'role-modify':
                pattern = /^[a-z][A-Za-z]*$/;
                if (!pattern.test(input)) {  // 不是内置类型，也不是类
                    return 'Valid Type: ' + pattern.toString();
                } else {  // 合法
                    return 'valid';
                }
                break;

            // 其他非空
            case 'default-add':
            case 'default-modify':
            case 'constraint-add':
            case 'constraint-modify':
            case 'subsets-add':
            case 'subsets-modify':
            case 'redefines-add':
            case 'redefines-modify':
            case 'end-add':  // relation 两端的 class
            case 'end-modify':
                pattern = /^.+$/;  // 非空
                if (!pattern.test(input)) {
                    return 'Input can not be void.';
                } else {  // 合法
                    return 'valid';
                }
                break;

            // 所有的输入框要经过合法性检查，但尚未考虑到的inputCase会走这个分支，即无论输入什么(包括空值)都合法
            default:
                return 'valid';
        }
    }

    // 检查单个输入框输入内容合法性
    function checkInput(model, $input) {  // $input 是单个输入框组件

        var inputCase = $input.attr('stigmod-inputcheck');  // 输入框类型

        // 仅在设定了输入框的 stigmod-inputcheck 属性时进行下面的检查操作
        if (undefined !== inputCase) {
            var input = $input.val();  // 输入框内容
            var checkResult = getInputCheckResult(model, inputCase, input);  // 合法性检查结果
            var tooltipPlacement = null;  // 结果反馈的显示位置
            switch (inputCase) {
                case 'class-modify':
                    tooltipPlacement = 'bottom';  // 对于修改类名来说，为防止提示被区域上沿吃掉，将提示显示在输入框之下
                    break;
                default:
                    tooltipPlacement = 'top';
            }

            // 定义不同场景下 inputCase 的 pattern
            var modalPattern = /add$/;

            if ('valid' !== checkResult) {  // 不合法

                // 显示提示
                $input.tooltip('destroy');  // 首先要清除旧的提示
                $input.tooltip({
                    animation: false,
                    title: checkResult,
                    placement: tooltipPlacement,
                    trigger: 'manual'
                });
                $input.tooltip('show');
                // 返回值
                return false;

            } else {  // 合法

                // 清除提示
                $input.tooltip('destroy');
                // 返回值
                return true;

            }
        }
    }

    // 检查多个输入框输入内容合法性
    function checkInputs(model, $inputs) {  // $inputs 是一组输入框组件

        var num = $inputs.size();
        var allInputsAreValid = true;

        for (var i = 0; i < num; ++i) {

            // checkInput 放在左侧，防止函数里面的动作被 && 懒惰掉了。这样能让所有非法提示全部显示出来。
            allInputsAreValid = checkInput(model, $inputs.eq(i)) && allInputsAreValid;
        }

        return allInputsAreValid;
    }

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

    // 输入框出现后聚焦到第一个输入框上
    function focusOnInputIn($framework) {
        $framework.find('input[type=text]').eq(0).select();
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

    // 处理：左侧导航栏点击激活 并跳转
    function handleClkLeft() {

        // 激活
        $(this).closest('#stigmod-nav-left-scroll').find('.list-group-item').removeClass('active');
        $(this).addClass('active');

        // 跳转
        var $it = $(this).find('span:nth-child(1)');
        stateOfPage.class = $it.text();
        stateOfPage.flagCRG = ("stigmod-nav-left-class" === $it.attr('class')) ? 0 : 1; // 0: class, 1: relationgroup
        stateOfPage.flagDepth = 0;
        fillMiddle(icm);
    }

    // 处理：中间内容栏点击激活
    function handleClkMid() {

        var $collapseToggle = $(this).siblings('.panel').find('.stigmod-attr-cont-middle-title, .stigmod-rel-cont-middle-title');
        var $collapseToggleThis = $(this).find('.stigmod-attr-cont-middle-title, .stigmod-rel-cont-middle-title');

        $collapseToggle.attr('data-toggle', 'none');  // 禁用其他panel的collapse触发器
        $collapseToggleThis.attr('data-toggle', 'collapse'); // 打开本panel的collapse触发器(下次点击即可触发)
        $(this).siblings('.panel').removeClass('panel-primary').addClass('panel-default');
        $(this).removeClass('panel-default').addClass('panel-primary');  // 激活本panel
    }

    // 处理：中间栏 class 状态捕获
    function handleCapClass() {
        stateOfPage.class = $(this).find('.stigmod-clickedit-disp').text();
        stateOfPage.flagDepth = 0;
    }

    // 处理：中间栏 attribute 状态捕获
    function handleCapAttr() {
        stateOfPage.attribute = $(this).parent().attr('stigmod-attrel-name');
        stateOfPage.flagDepth = 1;
    }

    // 处理：中间栏 property 状态捕获
    function handleCapProp() {
        stateOfPage.property = $(this).find('td:first-child').text();
        stateOfPage.flagDepth = 2;
    }

    // 处理：输入框中每输入一个字符，进行一次内容合法性检查
    function handleCheckInputs() {
        checkInput(icm, $(this));
    }

    // 处理：输入框的 Enter、ESC 功能 (目前支持：编辑单元.stigmod-clickedit-root 、模态框.modal)
    function handleKbdCtrlInput(event) {
        if (13 === event.which) {  // Enter

            // 尝试寻找上层的 .stigmod-clickedit-root ，并点击提交
            if (0 !== $(this).closest('.stigmod-clickedit-root').find('.stigmod-clickedit-btn-ok').trigger('click').length) {
                return false;  // 已猜对，不用继续
            }

            // 尝试寻找上层的 .modal ，并点击提交
            if (0 !== $(this).closest('.modal').find('.btn-primary').trigger('click').length) {
                return false;  // 已猜对，不用继续
            }

            // 尝试寻找旁边的搜索按钮 TODO：这几个“尝试”写得不好，应该在一开始就搞清楚属于那种情况
            if (0 !== $(this).parent().find('#stigmod-search-left-btn').trigger('click').length) {
                return false;  // 已猜对，不用继续
            }

        } else if (27 === event.which) {  // ESC

            // 编辑组件取消编辑 （modal的ESC功能是自带的，不用写在这里）
            if (0 !== $(this).closest('.stigmod-clickedit-root').find('.stigmod-clickedit-btn-cancel').trigger('click').length) {
                return false;
            }

            // 左侧搜索栏，清除输入的文字并清除文本框的焦点
            $(this).val('').blur();
        }
    }

    // 处理：进入编辑
    function handleEnterEdit(event) {
        var $root = $(this).closest('.stigmod-clickedit-root');
        var caseEdit = $root.attr('stigmod-clickedit-case');
        var $originalTextElem = $root.find('.stigmod-clickedit-disp');
        var $editComponent = $root.find('.stigmod-clickedit-edit');

        $root.find('.tooltip').remove();  // 每次进入编辑状态时都清掉旧的 tooltip

        if ('title' === caseEdit) { // 中间栏标题的特别处理
            var originalTitle = $originalTextElem.text();
            $editComponent.find('input').val(originalTitle);
            $originalTextElem.css({'display': 'none'});
            $editComponent.css({'display': 'table-row'});

            $(this).addClass('disabled');

        } else {
            var num = $originalTextElem.length;
            var flagGeneralization = 0;

            for (var i = 0; i < num - 1; ++i) { // 同时适用于单列和多列的情况 (最后一个元素是按钮，不参与循环中的处理)
                var originalText = $originalTextElem.eq(i).text();  // 获取原始文字

                switch (caseEdit) {
                    case 'text' : // 输入框
                        $editComponent.eq(i).find('input').val(originalText);
                        break;

                    case 'radio' : // 单选框
                        var radio = $editComponent.eq(i).find('input');
                        if ('True' === originalText) {
                            radio.eq(0).attr({'checked': ''});
                            radio.eq(1).removeAttr('checked');
                        } else if ('False' === originalText) {
                            radio.eq(1).attr({'checked': ''});
                            radio.eq(0).removeAttr('checked');
                        } else {
                            radio.eq(1).removeAttr('checked');
                            radio.eq(0).removeAttr('checked');
                        }
                        break;

                    case 'reltype': // relation 页面的 relation type
                        if (0 === i) {
                            $editComponent.eq(i).find('button').text(originalText);
                            if ('Generalization' === originalText) { // 当关系类型为Generalization时，不显示名字
                                flagGeneralization = 1; // 置位
                            }
                        } else if (1 === i) {
                            if (1 === flagGeneralization) { // 当关系类型为Generalization时，不显示名字
                                $editComponent.eq(i).find('input').css({'display': 'none'});
                                flagGeneralization = 0; // 复位
                            } else {
                                $editComponent.eq(i).find('input').val(originalText);
                            }
                        }

                        // 联动编辑 role、class、multipliciy
                        var $relrole = $(this).closest('.stigmod-clickedit-root').next();
                        var $relclass = $relrole.next();
                        var $relmultiplicity = $relclass.next();

                        $relclass.find('.stigmod-clickedit-btn-edit').trigger('click');
                        if ($relrole.is(':visible')) {
                            $relrole.find('.stigmod-clickedit-btn-edit').trigger('click');  // role 和 multiplicity
                                                                                            // 只有在显示时才联动
                        }
                        if ($relmultiplicity.is(':visible')) {
                            $relmultiplicity.find('.stigmod-clickedit-btn-edit').trigger('click');  // role 和
                                                                                                    // multiplicity
                                                                                                    // 只有在显示时才联动
                        }
                        break;
                }
            }

            $originalTextElem.css({'display': 'none'});
            $editComponent.css({'display': 'table'});
        }

        focusOnInputIn($editComponent);
        event.preventDefault();
    }

    // 处理：确认编辑
    function handleSubmitEdit(event) {

        var $root = $(this).closest('.stigmod-clickedit-root');
        var caseEdit = $root.attr('stigmod-clickedit-case');
        var $originalTextElem = $root.find('.stigmod-clickedit-disp');
        var $editComponent = $root.find('.stigmod-clickedit-edit');
        var $visibleInputs = $root.find('input[type=text]:visible:not([readonly])');  // :not([readonly]) 是为了屏蔽
                                                                                      // typeahead 插件的影响

        // 与该编辑单元相关的输入框内容都合法，才能确认编辑
        if (checkInputs(icm, $visibleInputs)) {

            // 所编辑的内容为 class name 时
            if ('title' === caseEdit) {
                var newTitle = $editComponent.find('input').val();
                var originalTitle = $originalTextElem.text();

                // 更新 class 相关的模型和显示
                icm.modifyClassName(stateOfPage.class, newTitle);
                stateOfPage.class = newTitle;
                $originalTextElem.text(newTitle);

                // 更新 attribute type 相关的模型和显示
                // TODO: 遍历所有class的所有attribute的type，效率比较低。应该寻找更有效率的方式，用一定的空间换取时间
                var classes = icm.getSubModel([0]); // 获取所有 class

                for (var nameC in classes) {
                    if (classes.hasOwnProperty(nameC)) {
                        var attributes = classes[nameC][0];

                        for (var nameA in attributes) {
                            if (attributes.hasOwnProperty(nameA)) {
                                var attrType = attributes[nameA][0]['type'];

                                if (originalTitle === attrType) {
                                    classes[nameC][0][nameA][0]['type'] = newTitle;

                                    // 如果当前类中就有以当前类为属性类型的属性，则需要即时更新显示
                                    if (nameC === stateOfPage.class) {
                                        var $thePanel = $('#stigmod-cont-right .panel[stigmod-attrel-name=' + nameA + ']');

                                        $thePanel.find('tr.stigmod-attr-prop-type > td:nth-child(2) > span:nth-child(1)')
                                                .text(newTitle);  // 更新相关的 attribute 的 type 的值

                                        refreshMiddelPanelTitle(icm);  // 更新 panel 的标题
                                    }
                                }
                            }
                        }
                    }
                }

                // 更新 relation group 相关的模型和显示
                var relationGroups = icm.getSubModel([1]); // 获取所有 relation group

                for (var nameRG in relationGroups) { // 遍历该 model 中的所有 relation group
                    if (relationGroups.hasOwnProperty(nameRG)) {
                        var matchName = null;
                        var oriTitlePat = new RegExp('\\b' + originalTitle + '\\b', 'g');

                        matchName = nameRG.match(oriTitlePat);
                        if (null !== matchName) { // 如果该 relation group 与被修改的 class 有关

                            // 生成新的 relation group 名称
                            var newNameRG = null;
                            newNameRG = nameRG.replace(oriTitlePat, newTitle);

                            // 获得关系两端的类名
                            var nameOfBothEnds = newNameRG.split('-');
                            var relations = relationGroups[nameRG][0];

                            if (nameOfBothEnds[0] > nameOfBothEnds[1]) {

                                // 若更改 class 名后 relation group 名不在是字典序，则更正
                                newNameRG = nameOfBothEnds[1] + '-' + nameOfBothEnds[0];
                            }

                            for (var nameR in relations) { // 遍历该 relation group 中的所有 relation
                                if (relations.hasOwnProperty(nameR)) {

                                    // 修改 relation 中的 class name
                                    var nameClass = relations[nameR][0]['class']; // 获取该 relation 两端的 class 的名字的引用

                                    if (originalTitle === nameClass[0]) { // 需要修改End0
                                        nameClass[0] = newTitle;
                                    } else {  // 需要修改End1
                                        nameClass[1] = newTitle;
                                    }
                                }
                            }

                            // 修改 relation group 的名字
                            icm.modifyRelGrpName(nameRG, newNameRG)
                        }
                    }
                }

                // 更新左侧栏显示
                modifyLeft(icm, newTitle);

                // 更新修改组件的显示
                $originalTextElem.css({'display': 'table-row'});
                $editComponent.css({'display': 'none'});
                $(this).closest('.stigmod-clickedit-root').find('.stigmod-clickedit-btn-edit').removeClass('disabled');

            } else {  // 所编辑的内容不是 class name 时
                var num = $originalTextElem.length;
                var propertyNameOfR = '';
                var propertyValueOfR = ['', ''];
                var flagGeneralization = 0;

                for (var i = 0; i < num - 1; ++i) { // 同时适用于单列和多列的情况 (最后一个元素是按钮，不参与循环中的处理)
                    var originalText = $originalTextElem.eq(i).text();  // 获取原始文字
                    var newText = '';

                    switch (caseEdit) {
                        case 'text' :
                            newText = $editComponent.eq(i).find('input').val();
                            break;

                        case 'radio' :
                            newText = $editComponent.eq(i).find('input:checked').parent().text();
                            break;

                        case 'reltype': // relation 页面的 relation type
                            if (0 === i) {
                                newText = $editComponent.eq(i).find('button').text();
                                if ('Generalization' === newText) { // 当关系类型为Generalization时，将name置空
                                    flagGeneralization = 1; // 置位
                                }
                            } else if (1 === i) {
                                if (1 === flagGeneralization) { // 当关系类型为Generalization时，将name置空
                                    newText = '';
                                    flagGeneralization = 0; // 复位
                                } else {
                                    newText = $editComponent.eq(i).find('input').val();
                                }
                            }

                            // 联动编辑 role、class、multiplicity
                            var $relrole = $(this).closest('.stigmod-clickedit-root').next();
                            var $relclass = $relrole.next();
                            var $relmultiplicity = $relclass.next();

                            $relclass.find('.stigmod-clickedit-btn-ok').trigger('click');
                            if ($relrole.is(':visible')) {
                                $relrole.find('.stigmod-clickedit-btn-ok').trigger('click');
                            }
                            if ($relmultiplicity.is(':visible')) {
                                $relmultiplicity.find('.stigmod-clickedit-btn-ok').trigger('click');
                            }
                            break;
                    }

                    // 更新显示
                    $originalTextElem.eq(i).text(newText);

                    // 更新模型
                    if (0 === stateOfPage.flagCRG) {
                        var propertyName = $(this).closest('.stigmod-clickedit-root').find('td:first-child').text();

                        // 根据模型中是否有该 property，决定使用 ADD 还是 MOD 方法
                        try {
                            icm.getSubModel([0, stateOfPage.class, 0, stateOfPage.attribute, 0, propertyName]);
                            icm.modifyPropOfA(stateOfPage.class, stateOfPage.attribute, propertyName, newText);  // 有，修改

                        } catch(error) {
                            if (error instanceof ReferenceError) {  // 没有，增加
                                icm.addPropOfA(stateOfPage.class, stateOfPage.attribute, [propertyName, newText]);
                            } else {
                                throw error;
                            }
                        }

                        if ('name' === propertyName) {  // 当property是name时，还要修改attribute的key
                            icm.modifyAttrName(stateOfPage.class, stateOfPage.attribute, newText);
                            stateOfPage.attribute = newText; // 页面状态的更新
                            $(this).closest('.panel').attr({'stigmod-attrel-name': newText}); // panel 标记的更新
                        }

                    } else { // 当处理relation的property时，记录两端的key和value，最后在循环外一次性更新到model中
                        propertyNameOfR = $(this).closest('.stigmod-clickedit-root').find('td:first-child').text();
                        propertyValueOfR[i] = newText;
                    }
                }

                if (1 === stateOfPage.flagCRG) { // 当处理relation的property时，记录两端的key和value，最后在循环外一次性更新到model中

                    // 根据模型中是否有该 property，决定使用 ADD 还是 MOD 方法
                    try {
                        icm.getSubModel([1, stateOfPage.class, 0, stateOfPage.attribute, 0, propertyNameOfR]);
                        icm.modifyPropOfR(stateOfPage.class, stateOfPage.attribute, propertyNameOfR, propertyValueOfR);  // 有，修改

                    } catch(error) {
                        if (error instanceof ReferenceError) {  // 没有，增加
                            icm.addPropOfR(stateOfPage.class, stateOfPage.attribute, [propertyNameOfR, propertyValueOfR]);
                        } else {
                            throw error;
                        }
                    }
                }

                $originalTextElem.css({'display': 'table'});
                $editComponent.css({'display': 'none'});

                // 刷新所有panel的标题
                refreshMiddelPanelTitle(icm);
            }
        }

        enableSave();
        event.preventDefault();
    }

    // 处理：取消编辑
    function handleCancelEdit(event) {

        var $root = $(this).closest('.stigmod-clickedit-root');
        var caseEdit = $root.attr('stigmod-clickedit-case');
        var $originalTextElem = $root.find('.stigmod-clickedit-disp');
        var $editComponent = $root.find('.stigmod-clickedit-edit');

        if ('title' === caseEdit) {
            $originalTextElem.css({'display': 'table-row'});
            $editComponent.css({'display': 'none'});
            $(this).closest('.stigmod-clickedit-root').find('.stigmod-clickedit-btn-edit').removeClass('disabled');

        } else {
            switch (caseEdit) {
                case 'reltype': // relation 页面的 relation type

                    // 联动编辑 role、class、multipliciy
                    var $relrole = $(this).closest('.stigmod-clickedit-root').next();
                    var $relclass = $relrole.next();
                    var $relmultiplicity = $relclass.next();

                    $relclass.find('.stigmod-clickedit-btn-cancel').trigger('click');
                    if ($relrole.is(':visible')) {
                        $relrole.find('.stigmod-clickedit-btn-cancel').trigger('click');
                    }
                    if ($relmultiplicity.is(':visible')) {
                        $relmultiplicity.find('.stigmod-clickedit-btn-cancel').trigger('click');
                    }
                    break;
            }

            $originalTextElem.css({'display': 'table'});
            $editComponent.css({'display': 'none'});
        }

        event.preventDefault();
    }

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

    // 处理：点击 addclass 确认按钮
    function handleAddClassOk() {
        var $input = $(this).closest('#stigmod-modal-addclass').find('input[type=text]:not([readonly])');

        if (checkInput(icm, $input)) {  // 仅当输入内容合法后才执行 add 操作
            var className = $input.val();

            // 更新模型
            icm.addClass(className);

            // 更新显示
            stateOfPage.flagCRG = 0;
            stateOfPage.flagDepth = 0;
            stateOfPage.class = className;

            modifyLeftAndJump(icm, className);
            $(this).next().trigger('click'); // 关闭当前 modal

            $('#stigmod-nav-left-scroll').find('span[stigmod-nav-left-tag=' + className + ']')
                    .parent()[0].scrollIntoView();  // 滚动使该元素显示在视口中

            enableSave();
        }
    }

    // 处理：点击 addrelationgroup 确认按钮
    function handleAddRelGrpOk() {
        var $inputs = $(this).closest('#stigmod-modal-addrelationgroup')
                .find('input[type=text]:not([readonly])');  // :not([readonly]) 是为了屏蔽 typeahead 插件的影响
        var class1 = $inputs.eq(0).val();
        var class2 = $inputs.eq(1).val();
        var relationGroupName = (class1 < class2) ? class1 + '-' + class2 : class2 + '-' + class1; // 关系组的name是两端的类的拼合

        function isValidRelationGroup(model, $compo, relationGroupName) {
            if (model.doesNodeExist(1, relationGroupName)) {

                $compo.tooltip('destroy');  // 首先要清除旧的提示
                $compo.tooltip({
                    animation: false,
                    title: 'Relation group already exists.',
                    placement: 'top',
                    trigger: 'manual'
                    //container: 'div'  // 应对 tooltip 的出现导致 btn 格式变化的问题
                });
                $compo.tooltip('show');

                return false;

            } else {
                return true;
            }
        }

        if (checkInputs(icm, $inputs) && isValidRelationGroup(icm, $(this).closest('.modal-footer'), relationGroupName)) {

            // 更新模型
            icm.addRelGrp(relationGroupName);

            // 更新显示
            stateOfPage.flagCRG = 1;
            stateOfPage.flagDepth = 0;
            stateOfPage.class = relationGroupName;
            modifyLeftAndJump(icm, relationGroupName);
            $(this).next().trigger('click'); // 关闭当前 modal

            $('#stigmod-nav-left-scroll').find('span[stigmod-nav-left-tag=' + relationGroupName + ']')
                    .parent()[0].scrollIntoView();  // 滚动使该元素显示在视口中

            enableSave();
        }
    }

    // 处理：addattribute 和 addrelation 的入口
    function handleAddAttrRelEntrance() {
        var $this = $(this); // 为了在 setTimeout() 函数中仍能正却使用
        setTimeout(function () { // 延时是为了解决 stateOfPage 还没有更新 modal 就弹出的问题

            // 获取添加位置和方向信息（也可写在 setTimeout() 之外）
            if ($this.hasClass('stigmod-addattrel-last')) { // 在add大按钮的上方添加（即所有panel的末尾，可能还没有panel）
                stateOfPage.addAttrRel.position = '@';
                stateOfPage.addAttrRel.direction = 0;
            } else {
                stateOfPage.addAttrRel.position = $this.closest('.panel').attr('stigmod-attrel-name');
                if ($this.hasClass('stigmod-addattrel-above')) { // 向上添加
                    stateOfPage.addAttrRel.direction = 0;
                } else { // 向下添加
                    stateOfPage.addAttrRel.direction = 1;
                }
            }

            // 弹框
            if (0 === stateOfPage.flagCRG) {
                $('#stigmod-modal-addattribute').modal('show');
            } else {
                $('#stigmod-modal-addrelation').modal('show');
            }
        }, 10);
    }

    // 处理：点击 addattribute 确认按钮
    function handleAddAttrOk() {
        var $visibleInputs = $(this).closest('#stigmod-modal-addattribute')
                .find('input[type=text]:visible:not([readonly])');  // :not([readonly]) 是为了屏蔽 typeahead 插件的影响

        if (checkInputs(icm, $visibleInputs)) {

            // 添加 attribute 名
            var attributeName = $(this).closest('#stigmod-modal-addattribute').find('#stigmod-addatt-name input').val();

            icm.addAttr(stateOfPage.class, attributeName, stateOfPage.addAttrRel);

            // 添加 properties
            var $propertyNew = $(this).closest('#stigmod-modal-addattribute').find('tr:visible');

            $propertyNew.each(function () {
                var caseName = $(this).attr('stigmod-addatt-case');
                var propertyName = $(this).find('td:first-child').text();
                var propertyValue = null;
                switch (caseName) {
                    case 'text':
                        propertyValue = $(this).find('input').val();
                        break;
                    case 'radio':
                        propertyValue = $(this).find('input:checked').parent().text();
                        break;
                }

                icm.addPropOfA(stateOfPage.class, attributeName, [propertyName, propertyValue]);
            });

            insertMiddle(icm, attributeName);
            $(this).next().trigger('click'); // 关闭当前 modal

            enableSave();
        }
    }

    // 确认：点击 addrelation 确认按钮
    function handleAddRelOk() {
        var $visibleInputs = $(this).closest('#stigmod-modal-addrelation')
                .find('input[type=text]:visible:not([readonly])');  // :not([readonly]) 是为了屏蔽 typeahead 插件的影响
        var $reltypeBtn = $(this).closest('#stigmod-modal-addrelation')
                .find('#stigmod-dropdown-reltype-modal > button');

        function isValidRelation($compo) {
            if ('' === $compo.text()) {  // Relation type 不能为空
                $compo.tooltip('destroy');  // 首先要清除旧的提示
                $compo.tooltip({
                    animation: false,
                    title: 'Relation type can not be void.',
                    placement: 'top',
                    trigger: 'manual'
                    //container: 'div'  // 应对 tooltip 的出现导致 btn 格式变化的问题
                });
                $compo.tooltip('show');
                return false;
            } else {
                return true;
            }
        }

        if (checkInputs(icm, $visibleInputs) && isValidRelation($reltypeBtn)) {

            // 生成 relation id
            var idRelFront = new ObjectId().toString();

            // 添加 relation id 作为该relation在前端的Key
            icm.addRelation(stateOfPage.class, idRelFront, stateOfPage.addAttrRel);

            // 添加 properties
            var $propertyNew = $(this).closest('#stigmod-modal-addrelation').find('tr:visible');

            $propertyNew.each(function () {
                var caseName = $(this).attr('stigmod-addrel-case');
                var propertyName = $(this).find('td:first-child').text();
                var propertyValue1 = null;
                var propertyValue2 = null;

                if ('type' === propertyName) {
                    propertyValue1 = $(this).find('button').text();
                    propertyValue2 = $(this).find('input').val();
                } else {
                    switch (caseName) {
                        case 'text':
                            propertyValue1 = $(this).find('input').first().val();
                            propertyValue2 = $(this).find('input').last().val();
                            break;
                        case 'radio':
                            propertyValue1 = $(this).find('input:checked').first().parent().text();
                            propertyValue2 = $(this).find('input:checked').last().parent().text();
                            break;
                    }
                }

                icm.addPropOfR(stateOfPage.class, idRelFront, [propertyName, [propertyValue1, propertyValue2]]);
            });

            insertMiddle(icm, idRelFront);
            $(this).next().trigger('click'); // 关闭当前 modal

            enableSave();
        }
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

    // 处理：所有删除按钮的入口
    function handleRemoveEntrance() {  // TODO：直接写图标类不是长久之计
        setTimeout(function () { // 延时是为了解决 stateOfPage 还没有更新 modal 就弹出的问题
            $('#stigmod-modal-remove').modal('show');
        }, 10);
    }

    // 处理：点击 remove 确认按钮
    function handleRemoveOk() {  // TODO: 删除后，stateOfPage的更新。
        switch (stateOfPage.flagDepth) {
            case 0:

                // 修改 model
                icm.removeSubModel([stateOfPage.flagCRG], stateOfPage.class);
                if (0 === stateOfPage.flagCRG) { // 删除 class 时，还要删除与之相关的 relation group
                    var relationGroups = icm.getSubModel([1]); // 获取所有 relation group

                    for (var nameRG in relationGroups) { // 遍历该 model 中的所有 relation group
                        if (relationGroups.hasOwnProperty(nameRG)) {
                            var matchName = null;
                            var classPat = new RegExp('\\b' + stateOfPage.class + '\\b');

                            matchName = nameRG.match(classPat);
                            if (null !== matchName) {
                                icm.removeSubModel([1], nameRG);
                            }
                        }
                    }
                }

                // 更新显示
                fillLeft(icm);
                fillMiddleBlank();
                break;

            case 1:

                // 修改 model
                icm.removeSubModel([stateOfPage.flagCRG, stateOfPage.class, 0], stateOfPage.attribute);
                icm.removeOrderElem(stateOfPage.flagCRG, stateOfPage.class, stateOfPage.attribute);

                // 更新显示
                removeMiddle(icm, stateOfPage.attribute);
                break;

            case 2:

                // 修改 model
                icm.removeSubModel([stateOfPage.flagCRG, stateOfPage.class, 0, stateOfPage.attribute, 0], stateOfPage.property);

                // 更新显示
                var prop = ['.stigmod-attr-prop-', '.stigmod-rel-prop-'];
                var strPanel = '#stigmod-cont-right .panel[stigmod-attrel-name=' +
                               stateOfPage.attribute + '] ' + prop[stateOfPage.flagCRG] + stateOfPage.property;
                var $root = $(strPanel);
                var $text = $root.find('.stigmod-clickedit-disp');
                var num = $text.length;

                for (var i = 0; i < num - 1; ++i) { // 同时适用于单列和多列的情况 (最后一个元素是按钮，不参与循环中的处理)
                    $text.eq(i).text('');
                }
                $root.hide();

                // 刷新所有panel的标题
                refreshMiddelPanelTitle(icm);
                break;
        }

        $(this).next().trigger('click'); // 关闭当前 modal

        enableSave();
    }

    // 处理：modal 显示时复位
    function handleMdlRmTooltip() {  // 对任何 modal 都有效
        $(this).find('.tooltip').remove();  // 移除所有的 tooltip 组件
    }
    function handleMdlFocus() {  // 对任何 modal 都有效
        focusOnInputIn($(this));
    }
    function handleMdlAddClass() {
        $(this).find('input').val('');
    }
    function handleMdlAddRelGrp() {
        $(this).find('input').val('');
    }
    function handleMdlAddAttr() {
        $(this).find('input[type=text]').val('');
        $(this).find('input[type=radio][value=True]').prop('checked', true);  // 单选框都默认勾选 True
        $(this).find('input[type=checkbox]').removeAttr('checked');
        $(this).find('input[value=type]').prop('checked', true); // 保留type项的选中状态
        $(this).find('tr').hide();
        $(this).find('tr:nth-child(1)').css('display', 'table-row'); // 显示name项
        $(this).find('tr:nth-child(2)').css('display', 'table-row'); // 显示type项
    }
    function handleMdlAddRel() {
        $(this).find('input[type=text]').val('');
        $(this).find('input[type=radio][value=True]').prop('checked', true);  // 单选框都默认勾选 True
        $(this).find('input[type=checkbox]').removeAttr('checked');
        $(this).find('input[value=role]').prop('checked', true); // 保留role项的选中状态
        $(this).find('input[value=multiplicity]').prop('checked', true); // 保留multiplicity项的选中状态
        $(this).find('tr').hide();
        $(this).find('tr:nth-child(1) button').text('');
        $(this).find('tr:nth-child(2) input').removeAttr('disabled');
        $(this).find('tr:nth-child(4) input').removeAttr('disabled');

        var nameOfBothEnds = stateOfPage.class.split('-'); // 获得关系两端的类名

        $(this).find('tr:nth-child(3) > td:nth-child(2) > input').val(nameOfBothEnds[0]); // 将类名填入
        $(this).find('tr:nth-child(3) > td:nth-child(3) > input').val(nameOfBothEnds[1]); // 将类名填入
        $(this).find('tr:nth-child(1)').css('display', 'table-row'); // 显示type项
        $(this).find('tr:nth-child(2)').css('display', 'table-row'); // 显示role项
        $(this).find('tr:nth-child(3)').css('display', 'table-row'); // 显示class项
        $(this).find('tr:nth-child(4)').css('display', 'table-row'); // 显示multiplicity项
    }
    function handleMdlRemove() {
        var type = new Array();

        type[0] = new Array('CLASS', 'ATTRIBUTE', 'PROPERTY');
        type[1] = new Array('RELATION GROUP', 'RELATION', 'PROPERTY');

        var name = [stateOfPage.class, stateOfPage.attribute, stateOfPage.property];

        $(this).find('.stigmod-modal-remove-type').text(type[stateOfPage.flagCRG][stateOfPage.flagDepth]);
        $(this).find('.stigmod-modal-remove-name').text(name[stateOfPage.flagDepth]);
    }

    // 处理：未保存就离开页面
    function handleLeavePage() {

        if (!icm.isLogEmpty()) {
            return 'Your model changes have not been saved.';
        }
    }

    // 处理：点击保存按钮
    function handleClkSave() {

        // 构建保存内容
        var postData = {};

        postData.date = Date.now();
        postData.user = stateOfPage.user;
        postData.modelID = stateOfPage.modelID;
        postData.modelName = stateOfPage.modelName;

        postData.log = icm.getLog();  // 获取日志
        postData.orderChanges = icm.getAttRelOrderChanges();  // 获取有变动的顺序数组

        // 清空 model 操作日志 & 顺序变动记录
        icm.clearLog();
        icm.clearAttRelOrderChanges();

        // 向后端传送 model 操作日志
        console.log('postData', postData);
        //console.log('postDataStringified', JSON.stringify(postData));

        $.ajax({
            url: '/' + stateOfPage.modelName + '/workspace',
            type: 'POST',
            data: JSON.stringify(postData),  // 把数据字符串化以使空数组能正确传递
            contentType: 'application/json',  // 使服务器端能正确理解数据格式
            success: function (msg) {
                // TODO：后端写好后，这里应该放 disableSave(); （这是最终状态）
                hideMask();
            },
            error: function () {
                //alert('Model save failed.');
                // TODO：后端写好后，这里应该放 enableSave(); （返回可保存状态）
                // TODO：回滚 icm 的 log？
                hideMask();
            }
        });

        showMask();
        disableSave();  // TODO：后端写好后，这里应该是pendSave()，暂时失能保存按钮（这是中间状态）

    }

    // 处理：点击左侧搜索按钮
    function handleClkSearchLeft() {

        // 调试用：输出icm
        console.log(icm);
        //var id = new ObjectId().toString();
        //console.log('id', id);

        var name = $('#stigmod-search-left-input').val();

        if (icm.doesNodeExist(0, name) || icm.doesNodeExist(1, name)) {  // 如果模型中存在名为 name 的类或关系组

            $('#stigmod-nav-left-scroll').find('span[stigmod-nav-left-tag=' + name + ']')
                    .trigger('click')  // 点击激活该元素
                    .parent()[0].scrollIntoView();  // 滚动使该元素显示在视口中
        } else {

            //confirm('Does not exist. Do you want to add one?');
        }

        $(this).blur(); // 按钮单击事件处理完成后去除按钮焦点
    }

    // 处理：点击进入全屏
    function handleClkEnterFS() {

        $('.stigmod-hide-when-full-screen').hide();
        $('.stigmod-show-when-full-screen').show();

        $('body').css({'padding-top': '20px'});

        panelHeight = {
            left: 172,
            middle: 62,
            right: 62
        };
        resizePanel();
    }

    // 处理：点击退出全屏
    function handleClkExitFS() {

        $('.stigmod-show-when-full-screen').hide();
        $('.stigmod-hide-when-full-screen').show();

        $('body').css({'padding-top': '70px'});

        panelHeight = {
            left: 312,
            middle: 202,
            right: 202
        };
        resizePanel();
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

});