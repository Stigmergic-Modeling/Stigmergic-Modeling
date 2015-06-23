define(function (require, exports, module) {

    /**
     * 模块的输出
     * @type {Page}
     */
    module.exports = Page;


    /**
     * 模块的输入
     * @type {exports}
     */

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
    var _ = require('../module/util');



    /**
     * 页面
     * @constructor
     */
    function Page(stateRawData, icmRawData) {

        _.makePublisher(this);

        // 模型
        this.stateOfPage = new StateOfPage(stateRawData);
        this.icm = new ICM(icmRawData);
        this.ccm = new CCM();
        //console.log('icm', this.icm);

        // 参数
        this.panelHeight = {
            left: 312,
            middle: 202,
            right: 202
        };

        // 左侧栏
        this.leftColWgt = new LeftColWgt('#stigmod-nav-left');
        this.leftColWgt.init(this.icm);
        this.leftColWgt.on('pageStateChanged', 'updateState', this.stateOfPage);  // 左侧栏点击时更新页面状态
        this.leftColWgt.on('refreshMiddleCol', 'refreshMiddleCol', this);  // 左侧栏点击时中间栏内容变换

        // 中间栏
        this.middleColWgt = new MiddleColWgt('#stigmod-cont-right-scroll', {
            attributeBasic: '#template-mid-att-basic',
            relationBasic: '#template-mid-rel-basic'
        });
        this.middleColWgt.init(this.icm, this.stateOfPage);
        this.middleColWgt.on('pageStateChanged', 'updateState', this.stateOfPage);  // 中间栏点击时更新页面状态
        this.middleColWgt.on('classNameChanged', 'refreshLeftColAndActivate', this);  // 中间栏点击时更新页面状态

        // 右侧栏
        //this.rightColWgt = new rightColWgt();

        // 顶部栏(网站导航条之下)
        this.headerWgt = new HeaderWgt('#stigmod-header');
        this.headerWgt.init(this.icm, this.stateOfPage);
        this.headerWgt.on('resizePanel', 'resizePanel', this);  // 进入、退出全屏时，以不同的垂直边距重设panel大小

        // addClass对话框
        this.addClassDlgWgt = new ClassDialogWgt('#stigmod-modal-addclass');
        this.addClassDlgWgt.init(this.icm, this.ccm, this.stateOfPage);
        this.addClassDlgWgt.on('pageStateChanged', 'updateState', this.stateOfPage);  // 新建类时更新页面状态
        this.addClassDlgWgt.on('addClass', 'addClass', this.icm);  // 新建类时更新icm模型
        this.addClassDlgWgt.on('addClass', 'refreshLeftColAndActivateAndJump', this);  // 新建类时更新页面显示
        this.addClassDlgWgt.on('init', 'getUpdatedCCM', this);  // 对话框弹出时向后端请求更新ccm

        // addRelGrp对话框
        this.addRelGrpDlgWgt = new RelGrpDialogWgt('#stigmod-modal-addrelationgroup');
        this.addRelGrpDlgWgt.init(this.icm);
        this.addRelGrpDlgWgt.on('pageStateChanged', 'updateState', this.stateOfPage);  // 新建关系组时更新页面状态
        this.addRelGrpDlgWgt.on('addRelGrp', 'addRelGrp', this.icm);  // 新建关系组时更新icm模型
        this.addRelGrpDlgWgt.on('addRelGrp', 'refreshLeftColAndActivateAndJump', this);  // 新建关系组时更新页面显示

        // addAttribute对话框
        this.addAttributeDlgWgt = new AttributeDialogWgt('#stigmod-modal-addattribute');
        this.addAttributeDlgWgt.init(this.icm, this.ccm, this.stateOfPage);
        this.addAttributeDlgWgt.on('pageStateChanged', 'updateState', this.stateOfPage);  // 新建属性时更新页面状态
        this.addAttributeDlgWgt.on('addAttribute', 'addAttr', this.icm);  // 新建属性时更新icm模型
        this.addAttributeDlgWgt.on('addPropOfA', 'addPropOfA', this.icm);  // 新建属性时更新icm模型
        this.addAttributeDlgWgt.on('insertNewItem', 'insertNewMiddleItem', this);  // 新建属性时局部更新中间栏
        this.addAttributeDlgWgt.on('init', 'getUpdatedCCM', this);  // 对话框弹出时向后端请求更新ccm

        // addRelation对话框
        this.addRelationDlgWgt = new RelationDialogWgt('#stigmod-modal-addrelation');
        this.addRelationDlgWgt.init(this.icm, this.ccm, this.stateOfPage);
        this.addRelationDlgWgt.on('pageStateChanged', 'updateState', this.stateOfPage);  // 新建关系时更新页面状态
        this.addRelationDlgWgt.on('addRelation', 'addRelation', this.icm);  // 新建关系时更新icm模型
        this.addRelationDlgWgt.on('addPropOfR', 'addPropOfR', this.icm);  // 新建关系时更新icm模型
        this.addRelationDlgWgt.on('insertNewItem', 'insertNewMiddleItem', this);  // 新建关系时局部更新中间栏
        this.addRelationDlgWgt.on('init', 'getUpdatedCCM', this);  // 对话框弹出时向后端请求更新ccm

        // removeConfirm对话框
        this.removeConfirmDlgWgt = new RemoveConfirmDialogWgt('#stigmod-modal-remove');
        this.removeConfirmDlgWgt.init(this.icm, this.stateOfPage);
        this.removeConfirmDlgWgt.on('classRemoved', 'refreshLeftColAndBlankMiddleCol', this);  // 删除类或关系组后刷新左侧栏
        this.removeConfirmDlgWgt.on('attributeRemoved', 'removeMiddlePanel', this);  // 删除类或关系组后刷新左侧栏
        this.removeConfirmDlgWgt.on('propertyRemoved', 'refreshMiddlePanelTitle', this);  // 删除类或关系组后刷新左侧栏
    }

    // 初始化
    Page.prototype.init = function () {

        // 左中右栏目高度自适应
        this.resizePanel();
        $(window).on('resize', this.resizePanel.bind(this));  // 需要给resizePanel绑定Page作为context，否则无法获取Page对象中的属性

        // 显示左侧栏
        this.refreshLeftCol();

        // 别名
        var icm = this.icm;
        var ccm = this.ccm;
        var stateOfPage = this.stateOfPage;

        // 获取最新ccm数据
        this.getUpdatedCCM();
        console.log(this.icm);

        // 输入框中每输入一个字符，进行一次内容合法性检查。keyup 事件保证 input 的 value 改变后才调用 checkInput
        $(document).on('keyup', 'input[type=text]', handleCheckInputs);

        // 输入框的 Enter、ESC 功能 (目前支持：编辑单元.stigmod-clickedit-root 、模态框.modal)
        $(document).on('keyup', 'input[type=text]', handleKbdCtrlInput);

        // 未保存就离开页面
        $(window).on('beforeunload', handleLeavePage);

        // 在锁定滚动条（使之隐藏）的情况下，使用鼠标滚轮控制页面滚动
        $('#stigmod-nav-left-scroll, #stigmod-cont-right-scroll, #stigmod-rcmd-right-scroll, .stigmod-hidden-scroll').on('mousewheel', function(event) {
            var scrollTop = this.scrollTop;

            this.scrollTop = (scrollTop + ((event.deltaY * event.deltaFactor) * -1));
            event.preventDefault();
        });

        // 激活bootstrap的tooltip部分功能
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();

        // 为左侧搜索栏添加下拉提示
        $('#stigmod-search-left-input').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },  // 将 class 和 relation group 区分对待：
                {
                    name: 'clsNames',
                    displayKey: 'value',
                    source: substringMatcher(icm, ccm, stateOfPage,  'classInICM', 4)
                },
                {
                    name: 'rgNames',
                    displayKey: 'value',
                    source: substringMatcher(icm, ccm, stateOfPage,  'relGroupInICM', 4)
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
                    source: substringMatcher(icm, ccm, stateOfPage,  'classInICM', 6)
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
                    source: substringMatcher(icm, ccm, stateOfPage,  'classInICM', 6)
                });

        // 处理：输入框中每输入一个字符，进行一次内容合法性检查
        function handleCheckInputs() {
            checkInput(icm, $(this), stateOfPage);
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
                if (0 !== $(this).parent().parent().find('#stigmod-search-left-btn, #searchButton').trigger('click').length) {  // 第一个 parent() 是考虑了 typeahead wrapper 的影响
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

        // 处理：未保存就离开页面
        function handleLeavePage() {
            if (!icm.isLogEmpty()) {
                return 'Your model changes have not been saved.';
            }
        }
    };

    // 刷新左侧栏
    Page.prototype.refreshLeftCol = function () {
        this.leftColWgt.refresh(this.icm);
    };

    // 刷新左侧栏并清空中间栏
    Page.prototype.refreshLeftColAndBlankMiddleCol = function () {
        this.leftColWgt.refresh(this.icm);
        this.middleColWgt.blank();
    };

    // 刷新左侧栏并重新激活item
    Page.prototype.refreshLeftColAndActivate = function (name) {
        this.leftColWgt.refresh(this.icm);

        // 重新激活
        var $this = $(document)
                .find('#stigmod-nav-left-scroll .panel .list-group span[stigmod-nav-left-tag=' + name + ']')
                .parent();
        $this.closest('#stigmod-nav-left-scroll').find('.list-group-item').removeClass('active');
        $this.addClass('active');
    };

    // 刷新左侧栏、激活item、并跳转到新的middleCol
    Page.prototype.refreshLeftColAndActivateAndJump = function (name) {
        this.leftColWgt.refresh(this.icm);

        // 重新激活并跳转
        $(document)
                .find('#stigmod-pg-workspace #stigmod-nav-left-scroll .panel .list-group span[stigmod-nav-left-tag=' + name + ']')
                .trigger('click');
    };

    // 刷新中间栏
    Page.prototype.refreshMiddleCol = function () {
        this.middleColWgt.refresh(this.icm, this.stateOfPage);
    };

    // 更新中间栏
    Page.prototype.insertNewMiddleItem = function (name) {
        this.middleColWgt.insertNewItem(this.icm, this.stateOfPage, name)
    };

    // 局部删除中间栏Panel
    Page.prototype.removeMiddlePanel = function (name) {  // TODO: 这里写得不好，越级操作了
        var selector = '#stigmod-cont-right .panel[stigmod-attrel-name=' + name + ']';
        $(selector).remove();
    };

    // 刷新中间栏的PanelTitle
    Page.prototype.refreshMiddlePanelTitle = function () {
        this.middleColWgt.refreshMiddlePanelTitle(this.icm, this.stateOfPage);
    };

    // 左中右三栏（panel）高度调整
    Page.prototype.resizePanel = function (heightObj) {
        var key;

        // 若有参数传入，则重设高度基准
        if (heightObj) {
            for (key in heightObj) {
                if (heightObj.hasOwnProperty(key) && this.panelHeight.hasOwnProperty(key)) {
                    this.panelHeight[key] = heightObj[key];
                }
            }
        }

        var windowHeight = $(window).height();
        var icm = this.icm;
        var stateOfPage = this.stateOfPage;
        var panelHeight = this.panelHeight;

        // 调整三栏的高度
        $('#stigmod-nav-left-scroll').height(windowHeight - panelHeight.left);
        $('#stigmod-cont-right-scroll').height(windowHeight - panelHeight.middle);
        $('#stigmod-rcmd-right-scroll').height(windowHeight - panelHeight.right);

        // 当 modelview 可见时，调整 modelview 中图形的位置（重新初始化）
        if ($('#stigmod-modal-d3view').is(':visible') && stateOfPage.windowResizeMutex === 0) {

            // 加锁
            stateOfPage.windowResizeMutex = 1;

            // 清除旧的 svg 和 Detail
            $('#view').find('svg').remove();
            $('#classDetail').remove();
            $('#relationDetail').remove();

            // 刷新模型图像
            setTimeout(function() {
                modelView(icm, '');

                // 解锁
                stateOfPage.windowResizeMutex = 0;
            }, 500);
        }
    };

    // 获取最新ccm用于推荐（异步）
    Page.prototype.getUpdatedCCM = function () {
        this.ccm.getCCM(this.stateOfPage.modelName);
    };



    /**
     * 组件基类
     * @param elementSelector
     * @param templates
     * @constructor
     */
    function Widget(elementSelector, templates) {

        this.element = elementSelector && $(elementSelector);  // elementSelector 可以是选择器，也可以是element对象（原生或jQ）
        this.templateWgt = {};
        if (templates) {
            this.addTemplateWidget(templates);
        }

        _.makePublisher(this);
    }

    // 为组件添加附属模板，该模板可用于构成该组件的子组件
    Widget.prototype.addTemplateWidget = function (tPair) {
        var key;

        for (key in tPair) {
            if (tPair.hasOwnProperty(key)) {
                this.templateWgt[key] = new TemplateWgt(tPair[key]);
            }
        }
    };



    /**
    * 组件模板类
    * @constructor
    */
    function TemplateWgt() {
        Widget.apply(this, arguments);

        this.templateHtml = this.element && $(this.element).html();
    }
    _.extend(TemplateWgt, Widget);

    // 将模板Html转化为jQ元素
    TemplateWgt.prototype.newElement = function (elementId) {
        var $element = $(this.templateHtml);
        if (elementId) {
            $element.attr('id', elementId);  // TODO 问题：若没有最外层，而是几个并列元素，则这几个元素都会加上相同的id
        }
        return $element;
    };



    /**
     * 左侧栏组件
     * @constructor
     */
    function LeftColWgt() {
        Widget.apply(this, arguments);

        this.classListGroup = new LeftColListGroupWgt('#stigmod-nav-left-scroll .panel:first-child .list-group');
        this.relgrpListGroup = new LeftColListGroupWgt('#stigmod-nav-left-scroll .panel:last-child .list-group');
        this.classListGroup.addTemplateWidget({t: '#template-left-class'});
        this.relgrpListGroup.addTemplateWidget({t: '#template-left-relation-group'});
    }
    _.extend(LeftColWgt, Widget);

    LeftColWgt.prototype.init = function (icm) {
        var widget = this;

        // 左侧导航栏点击激活 并跳转
        $(document).on('click', '#stigmod-nav-left-scroll .list-group-item', handleClkLeft);

        // 点击左侧搜索按钮
        $(document).on('click', '#stigmod-search-left-btn', handleClkSearchLeft);

        // 处理：左侧导航栏点击激活 并跳转
        function handleClkLeft() {

            // 激活
            $(this).closest('#stigmod-nav-left-scroll').find('.list-group-item').removeClass('active');
            $(this).addClass('active');

            // 更新状态
            var $it = $(this).find('span:nth-child(1)');
            widget.fire('pageStateChanged', {
                clazz: $it.text(),
                flagCRG: ("stigmod-nav-left-class" === $it.attr('class')) ? 0 : 1, // 0: class, 1: relationgroup
                flagDepth: 0
            });

            // 跳转
            widget.fire('refreshMiddleCol', null);
        }

        // 处理：点击左侧搜索按钮
        function handleClkSearchLeft() {

            // 调试用：输出icm
            //console.log(icm);
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
    };

    // 刷新左侧栏
    LeftColWgt.prototype.refresh = function(icm) {

        this.classListGroup.refresh(icm.getClassNames());
        this.relgrpListGroup.refresh(icm.getRelGrpNames());
    };



    /**
     * 左侧ListGroup组件
     * @constructor
     */
    function LeftColListGroupWgt() {
        Widget.apply(this, arguments);
    }
    _.extend(LeftColListGroupWgt, Widget);

    // 刷新
    LeftColListGroupWgt.prototype.refresh = function(nameArray) {
        var $el = this.element,
                i, len,
                listItemTemplate = this.templateWgt.t;

        $el.empty(); // 清空

        for (i = 0, len = nameArray.length; i < len; ++i) { // 类名
            $el.append(listItemTemplate.newElement());
            $el.find('a:last-child > span:first-child').text(nameArray[i])
                    .attr('stigmod-nav-left-tag', nameArray[i]); // 以名称作为标签写在组件上，便于查找
        }
    };



    /**
     * 中间内容栏
     * @constructor
     */
    function MiddleColWgt() {
        Widget.apply(this, arguments);

        this.attributeContentBasicWgt = new ContentBasicWgt(this.templateWgt.attributeBasic.newElement());
        this.relationContentBasicWgt = new ContentBasicWgt(this.templateWgt.relationBasic.newElement());

        this.attributeContentBasicWgt.addTemplateWidget({t: '#template-mid-att'});
        this.relationContentBasicWgt.addTemplateWidget({t: '#template-mid-rel'});

    }
    _.extend(MiddleColWgt, Widget);

    // 初始化中间栏事件
    MiddleColWgt.prototype.init = function (icm, stateOfPage) {

        var widget = this;

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

        // addattribute 和 addrelation 的入口
        $(document).on('click', '.stigmod-addattrel-trig', handleAddAttrRelEntrance);

        // 所有 remove 按钮的入口
        $(document).on('click', '.fa-remove, .glyphicon-trash, .stigmod-remove-trig', handleRemoveEntrance);

        // att 或 rel 的 .panel 的上下移动
        $(document).on('click', '.fa-arrow-up', handleMoveAttRelPanelUp);
        $(document).on('click', '.fa-arrow-down', handleMoveAttRelPanelDown);

        // panel 拖放排序
        $(document).on('dragstart', '#stigmod-cont-right > .panel', handleDragStart);
        $(document).on('dragover', '#stigmod-cont-right > .panel', handleDragOver);
        $(document).on('drop', '#stigmod-cont-right > .panel', handleDrop);

        // 点击 add property 下拉菜单选项
        $(document).on('click', '.stigmod-dropdown-addprop .dropdown-menu a', handleClkAddPropDrpdn);

        // 点击 modifyrelation 中的下拉菜单选项
        $(document).on('click', '#stigmod-dropdown-reltype a', handleClkMdfRelDrpdn);

        // 使 panel 的标题栏中 add property 下拉菜单不随按钮一起隐藏并仅显示尚未添加的 property
        $(document).on('show.bs.dropdown', '.stigmod-hovershow-trig', handleAddPropDrpdn);

        // modifyrelation 中点击交换 classname
        $(document).on('click', '.stigmod-rel-prop-class .glyphicon-transfer', handleClkMdfRelDrpdnChg);

        // 处理：中间栏 class 状态捕获
        function handleCapClass() {
            widget.fire('pageStateChanged', {
                clazz: $(this).find('.stigmod-clickedit-disp').text(),
                flagDepth: 0
            });
        }

        // 处理：中间栏 attribute 状态捕获
        function handleCapAttr() {
            widget.fire('pageStateChanged', {
                attribute: $(this).parent().attr('stigmod-attrel-name'),
                flagDepth: 1
            });
        }

        // 处理：中间栏 property 状态捕获
        function handleCapProp() {
            widget.fire('pageStateChanged', {
                property: $(this).find('td:first-child').text(),
                flagDepth: 2
            });
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

            //focusOnInputIn($editComponent);
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
            if (checkInputs(icm, $visibleInputs, stateOfPage)) {

                // 所编辑的内容为 class name 时
                if ('title' === caseEdit) {
                    var newTitle = $editComponent.find('input').val();
                    var originalTitle = $originalTextElem.text();

                    // 更新 class 相关的模型和显示
                    icm.modifyClassName(stateOfPage.clazz, newTitle);
                    stateOfPage.clazz = newTitle;
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
                                        if (nameC === stateOfPage.clazz) {
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
                    widget.fire('classNameChanged', newTitle);

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
                                icm.getSubModel([0, stateOfPage.clazz, 0, stateOfPage.attribute, 0, propertyName]);
                                icm.modifyPropOfA(stateOfPage.clazz, stateOfPage.attribute, propertyName, newText);  // 有，修改

                            } catch(error) {
                                if (error instanceof ReferenceError) {  // 没有，增加
                                    icm.addPropOfA(stateOfPage.clazz, stateOfPage.attribute, [propertyName, newText]);
                                } else {
                                    throw error;
                                }
                            }

                            if ('name' === propertyName) {  // 当property是name时，还要修改attribute的key
                                icm.modifyAttrName(stateOfPage.clazz, stateOfPage.attribute, newText);
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
                            icm.getSubModel([1, stateOfPage.clazz, 0, stateOfPage.attribute, 0, propertyNameOfR]);
                            icm.modifyPropOfR(stateOfPage.clazz, stateOfPage.attribute, propertyNameOfR, propertyValueOfR);  // 有，修改

                        } catch(error) {
                            if (error instanceof ReferenceError) {  // 没有，增加
                                icm.addPropOfR(stateOfPage.clazz, stateOfPage.attribute, [propertyNameOfR, propertyValueOfR]);
                            } else {
                                throw error;
                            }
                        }
                    }

                    $originalTextElem.css({'display': 'table'});
                    $editComponent.css({'display': 'none'});

                    // 刷新所有panel的标题
                    widget.refreshMiddlePanelTitle(icm, stateOfPage);
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

        // 处理：所有删除按钮的入口
        function handleRemoveEntrance() {  // TODO：直接写图标类不是长久之计
            setTimeout(function () { // 延时是为了解决 stateOfPage 还没有更新 modal 就弹出的问题
                $('#stigmod-modal-remove').modal('show');
            }, 10);
        }

        // 处理：att 或 rel 的 .panel 的上下移动
        function handleMoveAttRelPanelUp() {
            var $thisPanel = $(this).closest('.panel');
            var $prevPanel = $thisPanel.prev();

            if ($prevPanel.hasClass('panel')) { // 上面还有 .panel
                var name = $thisPanel.attr('stigmod-attrel-name');

                // 更新模型
                icm.moveOrderElem(stateOfPage.flagCRG, stateOfPage.clazz, name, -1);

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
                icm.moveOrderElem(stateOfPage.flagCRG, stateOfPage.clazz, name, 1);

                // 更新显示
                $nextPanel.after($thisPanel);  // 下移当前 panel 节点

                enableSave();

            } else {
                // 已经在最下，不必操作
            }
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
            icm.moveOrderElem(stateOfPage.flagCRG, stateOfPage.clazz, name, step);

            enableSave();
            event.preventDefault();
        }

        // 处理：点击 add property 下拉菜单选项
        function handleClkAddPropDrpdn(event) {
            var nameProp = $(this).text();

            //// 更新模型 (在编辑确认前，模型也应该加入空值，以保证下拉菜单的显示正确)  TODO：影响了日志的记录，暂时去掉这个功能
            //setTimeout(function () { // 延时是为了解决 stateOfPage 还没有更新就使用未更新的 stateOfPage.attribute 值的问题
            //    if (0 === stateOfPage.flagCRG) {
            //        icm.addPropOfA(stateOfPage.clazz, stateOfPage.attribute, [nameProp, '']);
            //    } else {
            //        icm.addPropOfR(stateOfPage.clazz, stateOfPage.attribute, [nameProp, ['', '']]);
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

        // 处理：使 panel 的标题栏中 addproperty 下拉菜单不随按钮一起隐藏（下拉菜单显示时，去掉该菜单父元素中的悬停显示的触发器）
        function handleAddPropDrpdn() {
            $(this).removeClass('stigmod-hovershow-trig');

            // 顺带解决：下拉菜单展开时显示哪些内容的问题
            $(this).find('.panel-title .dropdown-menu li').show();

            // 下面一行中，不从 stateOfPage 获取 attribute 的原因是 bootstrap 的 dropdown 不好设置 timeout，
            // 而没有 timeout 就不能保证 stateOfPage 的状态是最新的。
            var attributeName = $(this).closest('.panel').attr('stigmod-attrel-name');
            var properties = icm[stateOfPage.flagCRG][stateOfPage.clazz][0][attributeName][0];

            for (var nameProp in properties) {
                if (properties.hasOwnProperty(nameProp)) {
                    $(this).closest('.panel').find('.stigmod-dropdown-' + nameProp).hide();
                }
            }
            $(this).on('hide.bs.dropdown', function () { // 菜单消失时还原触发器
                $(this).addClass('stigmod-hovershow-trig');
            });
        }

        // 处理：modifyrelation 中点击交换 classname
        function handleClkMdfRelDrpdnChg(event) {
            var $classnames = $(this).closest('.stigmod-rel-prop-class').find('.stigmod-input');
            var tmp = $classnames.first().val();

            $classnames.first().val($classnames.last().val());
            $classnames.last().val(tmp);

            event.preventDefault();
        }
    };

    // 刷新中间栏
    MiddleColWgt.prototype.refresh = function (icm, stateOfPage) {
        if (stateOfPage.flagCRG === 0) {  // attribute
            this.element.empty();
            this.element.append(this.attributeContentBasicWgt.element);
            this.attributeContentBasicWgt.refresh(icm, stateOfPage, this.element);

        } else {  // relation
            this.element.empty();
            this.element.append(this.relationContentBasicWgt.element);
            this.relationContentBasicWgt.refresh(icm, stateOfPage, this.element);
        }
    };

    // 清空中间栏
    MiddleColWgt.prototype.blank = function () {
        this.element.empty();
    };

    // 刷新中间栏panel的标题
    MiddleColWgt.prototype.refreshMiddlePanelTitle = function (icm, stateOfPage) {
        if (stateOfPage.flagCRG === 0) {  // attribute
            this.attributeContentBasicWgt.refreshMiddlePanelTitle(icm, stateOfPage, this.element);

        } else {  // relation
            this.relationContentBasicWgt.refreshMiddlePanelTitle(icm, stateOfPage, this.element);
        }
    };

    // 局部添加中间栏组件(无刷新)
    MiddleColWgt.prototype.insertNewItem = function (icm, stateOfPage, name, noUnfold) {

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

        var templateWgt = 0 === stateOfPage.flagCRG
                ? this.attributeContentBasicWgt.templateWgt.t.newElement()
                : this.relationContentBasicWgt.templateWgt.t.newElement();

        // 找到正确的位置并插入新 .panel
        if ('@' === stateOfPage.addAttrRel.position) {
            $compo = $('#stigmod-cont-right .list-group').before(templateWgt).prev();
        } else {
            var baseSelector = '#stigmod-cont-right .panel[stigmod-attrel-name=' + stateOfPage.addAttrRel.position + ']';
            if (0 === stateOfPage.addAttrRel.direction) { // 上插
                $compo = $(baseSelector).before(templateWgt).prev();
            } else { // 下插
                $compo = $(baseSelector).after(templateWgt).next();
            }
        }

        // 在 .panel 中记录 attribute 或 relation 的名字，便于点击时更新 stateOfPage
        $compo.attr({'stigmod-attrel-name': name});

        // 设置collapse属性
        var strTitle = 0 === stateOfPage.flagCRG ? '.stigmod-attr-cont-middle-title' : '.stigmod-rel-cont-middle-title';
        var $collapseTrigger = $compo.find(strTitle).attr({'data-target': '#collapse' + collapseIndex});
        var $collapseContent = $compo.find('.panel-collapse').attr({'id': 'collapse' + collapseIndex});
        var icmProperties = icm[stateOfPage.flagCRG][stateOfPage.clazz][0][name][0];

        for (var icmProperty in icmProperties) {
            if (icmProperties.hasOwnProperty(icmProperty)) {
                var $propertyRow = null;

                if (0 === stateOfPage.flagCRG) {
                    $propertyRow = $collapseContent.find('.stigmod-attr-prop-' + icmProperty).show();

                    $propertyRow.find('td:nth-child(2) > .stigmod-clickedit-disp')
                            .text(icm[stateOfPage.flagCRG][stateOfPage.clazz][0][name][0][icmProperty]);

                } else {
                    $propertyRow = $collapseContent.find('.stigmod-rel-prop-' + icmProperty).show();

                    $propertyRow.find('td:nth-child(2) > .stigmod-clickedit-disp')
                            .text(icm[stateOfPage.flagCRG][stateOfPage.clazz][0][name][0][icmProperty][0]);
                    $propertyRow.find('td:nth-child(3) > .stigmod-clickedit-disp')
                            .text(icm[stateOfPage.flagCRG][stateOfPage.clazz][0][name][0][icmProperty][1]);
                }
            }
        }

        // 刷新所有panel的标题
        this.refreshMiddlePanelTitle(icm, stateOfPage);

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
    };


    /**
     * 中间内容栏基本组件
     * @constructor
     */
    function ContentBasicWgt() {
        Widget.apply(this, arguments);

        // 中间内容栏点击激活
        $(document).on('click', '#stigmod-cont-right .panel', handleClkMid);

        // 处理：中间内容栏点击激活
        function handleClkMid() {
            var $collapseToggle = $(this).siblings('.panel').find('.stigmod-attr-cont-middle-title, .stigmod-rel-cont-middle-title');
            var $collapseToggleThis = $(this).find('.stigmod-attr-cont-middle-title, .stigmod-rel-cont-middle-title');

            $collapseToggle.attr('data-toggle', 'none');  // 禁用其他panel的collapse触发器
            $collapseToggleThis.attr('data-toggle', 'collapse'); // 打开本panel的collapse触发器(下次点击即可触发)
            $(this).siblings('.panel').removeClass('panel-primary').addClass('panel-default');
            $(this).removeClass('panel-default').addClass('panel-primary');  // 激活本panel
        }
    }
    _.extend(ContentBasicWgt, Widget);

    // 刷新中间栏基本组件
    ContentBasicWgt.prototype.refresh = function (icm, stateOfPage, $parentElement) {
        //console.log(this.templateWgt.t.newElement()[0])
        //console.log(icm)

        // 向中间栏填入组件和数据
        $('#stigmod-classname > span:nth-child(2)').text(stateOfPage.clazz);
        $parentElement.find('.panel').remove(); // 清空

        var modelAttribute = icm[stateOfPage.flagCRG][stateOfPage.clazz][1]['order']; // 获取 attribute 或 relation 的顺序信息

        for (var i = 0; i < modelAttribute.length; ++i) { // i 既是 attrel 的编号， 也是 collapse 的序号

            var $compo = $parentElement.find('.list-group').before(this.templateWgt.t.newElement()).prev();
            //console.log($parentElement);

            // 在 .panel 中记录 attribute 或 relation 的名字，便于点击时更新 stateOfPage
            $compo.attr({'stigmod-attrel-name': modelAttribute[i]});

            // 设置collapse属性
            var strTitle = 0 === stateOfPage.flagCRG ? '.stigmod-attr-cont-middle-title' : '.stigmod-rel-cont-middle-title';
            var $collapseTrigger = $compo.find(strTitle).attr({'data-target': '#collapse' + i});
            var $collapseContent = $compo.find('.panel-collapse').attr({'id': 'collapse' + i});
            var modelProperties = icm[stateOfPage.flagCRG][stateOfPage.clazz][0][modelAttribute[i]][0];

            // 设置 properties
            for (var modelProperty in modelProperties) {
                if (modelProperties.hasOwnProperty(modelProperty)) {
                    var $propertyRow = null;

                    if (0 === stateOfPage.flagCRG) { // class
                        $propertyRow = $collapseContent.find('.stigmod-attr-prop-' + modelProperty).show();

                        $propertyRow.find('td:nth-child(2) > .stigmod-clickedit-disp')
                                .text(icm[stateOfPage.flagCRG][stateOfPage.clazz][0][modelAttribute[i]][0][modelProperty]);

                    } else { // relationGroup
                        $propertyRow = $collapseContent.find('.stigmod-rel-prop-' + modelProperty).show();

                        $propertyRow.find('td:nth-child(2) > .stigmod-clickedit-disp')
                                .text(icm[stateOfPage.flagCRG][stateOfPage.clazz][0][modelAttribute[i]][0][modelProperty][0]);
                        $propertyRow.find('td:nth-child(3) > .stigmod-clickedit-disp')
                                .text(icm[stateOfPage.flagCRG][stateOfPage.clazz][0][modelAttribute[i]][0][modelProperty][1]);
                    }
                }
            }
        }

        // 刷新所有panel的标题
        this.refreshMiddlePanelTitle(icm, stateOfPage, $parentElement);
    };

    // 刷新所有panel的标题
    ContentBasicWgt.prototype.refreshMiddlePanelTitle = function (icm, stateOfPage, $parentElement) {
        var $panels = $parentElement.find('.panel');

        $panels.each(function () {

            // 对于每一个 attribute 或 relation
            var $title = $(this).find('.panel-title > div.row > div:nth-child(2)');
            var properties = icm.getProp(stateOfPage.flagCRG, stateOfPage.clazz, $(this).attr('stigmod-attrel-name'));
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
    };



    /**
     * 顶部栏组件(也包括全屏时的悬浮窗)
     * @constructor
     */
    function HeaderWgt() {
        Widget.apply(this, arguments);
    }
    _.extend(HeaderWgt, Widget);

    HeaderWgt.prototype.init = function (icm, stateOfPage) {

        var widget = this;

        // 点击保存按钮
        $(document).on('click', '.stigmod-model-save, .stigmod-model-save-btn', handleClkSave);

        // 点击进入全屏
        $(document).on('click', '.stigmod-enter-full-screen-btn', handleClkEnterFS);

        // 点击退出全屏
        $(document).on('click', '.stigmod-exit-full-screen-btn', handleClkExitFS);

        // 点击 show modelView 按钮
        $(document).on('click', '#stigmod-model-view, #stigmod-model-view-fs', handleShowModelView);

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
            //console.log('postData', postData);
            //console.log('postDataStringified', JSON.stringify(postData));

            $.ajax({
                url: '/' + stateOfPage.modelName + '/workspace',
                type: 'POST',
                data: JSON.stringify(postData),  // 把数据字符串化以使空数组能正确传递
                contentType: 'application/json',  // 使服务器端能正确理解数据格式
                success: function (msg) {
                    hideMask();
                },
                error: function () {
                    // TODO：回滚 icm 的 log？
                    hideMask();
                }
            });

            showMask();
            disableSave();
        }

        // 处理：点击进入全屏
        function handleClkEnterFS() {

            $('.stigmod-hide-when-full-screen').hide();
            $('.stigmod-show-when-full-screen').show();

            $('body').css({'padding-top': '20px'});

            widget.fire('resizePanel', {
                left: 172,
                middle: 62,
                right: 62
            });
        }

        // 处理：点击退出全屏
        function handleClkExitFS() {

            $('.stigmod-show-when-full-screen').hide();
            $('.stigmod-hide-when-full-screen').show();

            $('body').css({'padding-top': '70px'});

            widget.fire('resizePanel', {
                left: 312,
                middle: 202,
                right: 202
            });
        }

        // 处理：点击 show modelView 按钮
        function handleShowModelView() {

            // 清除旧的 svg 和 Detail
            $('#view').find('svg').remove();
            $('#classDetail').remove();
            $('#relationDetail').remove();

            // 显示模型图像
            $('#stigmod-modal-d3view').modal('show');

            // 刷新模型图像
            setTimeout(function() {
                modelView(icm, stateOfPage.clazz);
            }, 500);
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
    };


    /**
     * 对话框组件
     * @constructor
     */
    function DialogWgt() {
        Widget.apply(this, arguments);
        this.initSuperClass();
    }
    _.extend(DialogWgt, Widget);

    // 初始化对话框
    DialogWgt.prototype.initSuperClass = function () {

        // modal 显示时复位
        var modalId = '#' + this.element.attr('id');

        $(document).on('show.bs.modal', modalId, handleMdlRmTooltip);
        $(document).on('shown.bs.modal', modalId, handleMdlFocus);

        // 处理：modal 显示时复位
        function handleMdlRmTooltip() {  // 对任何 modal 都有效
            $(this).find('.tooltip').remove();  // 移除所有的 tooltip 组件（输入提示）
        }
        function handleMdlFocus() {  // 对任何 modal 都有效
            focusOnInputIn($(this));
        }
    };

    // 关闭对话框
    DialogWgt.prototype.close = function () {
        this.element.modal('hide');
    };



    /**
     * addClass 对话框组件
     * @constructor
     */
    function ClassDialogWgt() {
        DialogWgt.apply(this, arguments);

        this.adoptingRec = false;  // 标志位，用于标志是否采纳推荐
        this.adoptedClassId = '';  // 所采纳推荐类的ID
    }
    _.extend(ClassDialogWgt, DialogWgt);

    // 事件监听初始化
    ClassDialogWgt.prototype.init = function (icm, ccm, stateOfPage) {
        var $input = $('#stigmod-addclass-input');

        // 为 addclass modal 添加下拉提示
        $input.typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'clsNames',
                    displayKey: 'value',
                    source: substringMatcher(icm, ccm, stateOfPage, 'classInCCM', 6)
                });

        this.initInputWgts();

        var widget = this;

        // 点击 addclass 确认按钮
        $(document).on('click', '#stigmod-btn-addclass', handleAddClassOk);

        // modal 显示前复位
        $(document).on('show.bs.modal', '#stigmod-modal-addclass', handleMdlAddClass);

        // 输入框中每输入一个字符，过滤一次推荐栏的内容
        $input.on('keyup', handleFilterRec);

        // 处理：点击 addclass 确认按钮
        function handleAddClassOk() {
            var $input = $(this).closest('#stigmod-modal-addclass').find('input[type=text]:not([readonly])');

            if (checkInput(icm, $input)) {  // 仅当输入内容合法后才执行 add 操作
                var className = $input.val(),
                        classId = widget.adoptingRec ? widget.adoptedClassId : new ObjectId().toString(),
                        addingType = widget.adoptingRec ? 'binding' : 'fresh';

                // 更新页面状态
                widget.fire('pageStateChanged', {
                    flagCRG: 0,
                    flagDepth: 0,
                    clazz: className
                });

                // 更新模型和显示
                widget.fire('addClass', [className, classId, addingType]);
                widget.close();  // 关闭当前 modal
                $('#stigmod-nav-left-scroll')
                        .find('span[stigmod-nav-left-tag=' + className + ']')
                        .parent()[0].scrollIntoView();  // 滚动使该元素显示在视口中

                enableSave();
            }
        }

        // 处理：modal 显示前复位
        function handleMdlAddClass() {
            $(this).find('input').val('');

            widget.adoptingRec = false;
            widget.adoptedClassId = '';
            widget.fire('init');

            // 刷新 modal 推荐栏
            widget.initRecWgt(icm, ccm);
        }

        // 处理：过滤推荐栏的内容
        function handleFilterRec() {
            widget.recommendation.filter($(this).val());
        }
    };

    // 初始化该Dialog组件中的Input组件
    ClassDialogWgt.prototype.initInputWgts = function () {
        this.clazz = {};

        // 文本输入
        this.clazz.name = new TextInputWgt('#stigmod-addclass-name');
    };

    // 设置该Dialog组件中Input组件的值
    ClassDialogWgt.prototype.setInputWgtValue = function (classModel) {
        this.clazz.name.setValue([ classModel.name ]);

        // 绑定id
        this.adoptingRec = true;
        this.adoptedClassId = classModel.id;
    };

    // 初始化推荐栏
    ClassDialogWgt.prototype.initRecWgt = function (icm, ccm) {
        this.recommendation = new ClassRecWgt('#stigmod-modal-rec-class');
        this.recommendation.init(icm, ccm);
        this.recommendation.on('itemClicked', 'setInputWgtValue', this);  // 条目被点击时，将该条目的数据填入表中
    };


    /**
     * addRelGrp 对话框组件
     * @constructor
     */
    function RelGrpDialogWgt() {
        DialogWgt.apply(this, arguments);
    }
    _.extend(RelGrpDialogWgt, DialogWgt);

    // 事件监听初始化
    RelGrpDialogWgt.prototype.init = function (icm) {

        var widget = this;

        // 点击 addrelationgroup 确认按钮
        $(document).on('click', '#stigmod-btn-addrelationgroup', handleAddRelGrpOk);

        // modal 显示前复位
        $(document).on('show.bs.modal', '#stigmod-modal-addrelationgroup', handleMdlAddRelGrp);

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

                // 更新页面状态
                widget.fire('pageStateChanged', {
                    flagCRG: 1,
                    flagDepth: 0,
                    clazz: relationGroupName
                });

                // 更新模型和显示
                widget.fire('addRelGrp', relationGroupName);
                widget.close(); // 关闭当前 modal
                $('#stigmod-nav-left-scroll').find('span[stigmod-nav-left-tag=' + relationGroupName + ']')
                        .parent()[0].scrollIntoView();  // 滚动使该元素显示在视口中

                enableSave();

                // 进一步添加具体 relation
                $('#stigmod-cont-right-scroll').find('.stigmod-addattrel-last').trigger('click');
            }
        }

        // 处理：modal 显示前复位
        function handleMdlAddRelGrp() {
            $(this).find('input').val('');
        }
    };



    /**
     * addAttribute 对话框组件
     * @constructor
     */
    function AttributeDialogWgt() {
        DialogWgt.apply(this, arguments);

        this.adoptingRec = false;  // 标志位，用于标志是否采纳推荐
        this.adoptedAttrId = '';  // 所采纳推荐属性的ID
    }
    _.extend(AttributeDialogWgt, DialogWgt);

    // 事件监听初始化
    AttributeDialogWgt.prototype.init = function (icm, ccm, stateOfPage) {
        var $input = $('#stigmod-addatt-name').find('input[type=text]');

        // 为 addattribute modal 添加下拉提示
        $input.typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'attNames',
                    displayKey: 'value',
                    source: substringMatcher(icm, ccm, stateOfPage, 'attributeInCCM', 6)
                });

        this.initInputWgts();

        var widget = this;

        // 点击 addattribute 确认按钮
        $(document).on('click', '#stigmod-btn-addattribute', handleAddAttrOk);

        // modal 显示前复位
        $(document).on('show.bs.modal', '#stigmod-modal-addattribute', handleMdlAddAttr);

        // add attribute 和 add relation 的 modal 中 checkbox 的动作
        $(document).on('change', '#stigmod-modal-addattribute input[type="checkbox"]', handleAddAttrChkBox);

        // 输入框中每输入一个字符，过滤一次推荐栏的内容
        $input.on('keyup', handleFilterRec);

        // 处理：点击 addattribute 确认按钮
        function handleAddAttrOk() {
            var $visibleInputs = $(this).closest('#stigmod-modal-addattribute')
                    .find('input[type=text]:visible:not([readonly])');  // :not([readonly]) 是为了屏蔽 typeahead 插件的影响

            if (checkInputs(icm, $visibleInputs, stateOfPage)) {
                var attrId = widget.adoptingRec ? widget.adoptedAttrId : new ObjectId().toString(),
                        addingType = widget.adoptingRec ? 'binding' : 'fresh';

                // 添加 attribute 名
                var attributeName = $(this).closest('#stigmod-modal-addattribute').find('#stigmod-addatt-name input:not([readonly])').val();
                widget.fire('addAttribute', [stateOfPage.clazz, attributeName, stateOfPage.addAttrRel, attrId, addingType]);

                // 添加 properties
                var $propertyNew = $(this).closest('#stigmod-modal-addattribute').find('tr:visible');

                $propertyNew.each(function () {
                    var caseName = $(this).attr('stigmod-addatt-case');
                    var propertyName = $(this).find('td:first-child').text();
                    var propertyValue = null;
                    switch (caseName) {
                        case 'text':
                            propertyValue = $(this).find('input:not([readonly])').val();
                            break;
                        case 'radio':
                            propertyValue = $(this).find('input:checked').parent().text();
                            break;
                    }

                    widget.fire('addPropOfA', [stateOfPage.clazz, attributeName, [propertyName, propertyValue]]);
                });

                widget.fire('insertNewItem', attributeName);
                widget.close(); // 关闭当前 modal

                enableSave();
            }
        }

        // 处理：modal 显示前复位
        function handleMdlAddAttr() {
            $(this).find('input[type=text]').val('');
            $(this).find('input[type=radio][value=True]').prop('checked', true);  // 单选框都默认勾选 True
            $(this).find('input[type=checkbox]').removeAttr('checked');
            $(this).find('input[value=type]').prop('checked', true); // 保留type项的选中状态
            $(this).find('tr').hide();
            $(this).find('tr:nth-child(1)').css('display', 'table-row'); // 显示name项
            $(this).find('tr:nth-child(2)').css('display', 'table-row'); // 显示type项

            widget.adoptingRec = false;
            widget.adoptedAttrId = '';
            widget.fire('init');

            // 刷新 modal 推荐栏
            widget.initRecWgt(icm, ccm, stateOfPage);
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

        // 处理：过滤推荐栏的内容
        function handleFilterRec() {
            widget.recommendation.filter($(this).val());
        }
    };

    // 初始化该Dialog组件中的Input组件
    AttributeDialogWgt.prototype.initInputWgts = function () {
        var attribute;
        attribute = this.attribute = {};  // attribute中收编所有的property

        // 文本输入
        attribute.name = new TextInputWgt('#stigmod-addatt-name');  // name 永远显示，没有控制开关
        attribute.type = new TextInputWgt('#stigmod-addatt-type', '#stigmod-addatt-type-swt');
        attribute.multiplicity = new TextInputWgt('#stigmod-addatt-multiplicity', '#stigmod-addatt-multiplicity-swt');
        attribute.visibility = new TextInputWgt('#stigmod-addatt-visibility', '#stigmod-addatt-visibility-swt');
        attribute.default = new TextInputWgt('#stigmod-addatt-default', '#stigmod-addatt-default-swt');
        attribute.constraint = new TextInputWgt('#stigmod-addatt-constraint', '#stigmod-addatt-constraint-swt');
        attribute.subsets = new TextInputWgt('#stigmod-addatt-subsets', '#stigmod-addatt-subsets-swt');
        attribute.redefines = new TextInputWgt('#stigmod-addatt-redefines', '#stigmod-addatt-redefines-swt');

        // 单选输入
        attribute.ordering = new RadioInputWgt('#stigmod-addatt-ordering', '#stigmod-addatt-ordering-swt');
        attribute.uniqueness = new RadioInputWgt('#stigmod-addatt-uniqueness', '#stigmod-addatt-uniqueness-swt');
        attribute.readOnly = new RadioInputWgt('#stigmod-addatt-readOnly', '#stigmod-addatt-readOnly-swt');
        attribute.union = new RadioInputWgt('#stigmod-addatt-union', '#stigmod-addatt-union-swt');
        attribute.composite = new RadioInputWgt('#stigmod-addatt-composite', '#stigmod-addatt-composite-swt');
    };

    // 设置该Dialog组件中Input组件的值
    AttributeDialogWgt.prototype.setInputWgtValue = function (attrModel) {
        var properties = 'name type multiplicity visibility default constraint subsets redefines ordering uniqueness readOnly union composite'.split(' '),
                len = properties.length,
                i;

        for (i = 0; i < len; i++) {
            if (properties[i] in attrModel) {
                this.attribute[properties[i]].turnOn([ attrModel[properties[i]] ]);
            } else {
                this.attribute[properties[i]].turnOff();
            }
        }

        // 绑定id
        this.adoptingRec = true;
        this.adoptedAttrId = attrModel.id;
    };

    // 初始化推荐栏
    AttributeDialogWgt.prototype.initRecWgt = function (icm, ccm, stateOfPage) {
        this.recommendation = new AttributeRecWgt('#stigmod-modal-rec-attribute');
        this.recommendation.init(icm, ccm, stateOfPage);
        this.recommendation.on('itemClicked', 'setInputWgtValue', this);  // 条目被点击时，将该条目的数据填入表中
    };



    /**
     * addRelation 对话框组件
     * @constructor
     */
    function RelationDialogWgt() {
        DialogWgt.apply(this, arguments);

        this.adoptingRec = false;  // 标志位，用于标志是否采纳推荐
        this.adoptedRelationId = '';  // 所采纳推荐属性的ID
    }
    _.extend(RelationDialogWgt, DialogWgt);

    // 事件监听初始化
    RelationDialogWgt.prototype.init = function (icm, ccm, stateOfPage) {
        var $input = $('#stigmod-dropdown-reltype-modal').find('li');

        var widget = this;

        this.initInputWgts();

        // 点击 addrelation 确认按钮
        $(document).on('click', '#stigmod-btn-addrelation', handleAddRelOk);

        // modal 显示前复位
        $(document).on('show.bs.modal', '#stigmod-modal-addrelation', handleMdlAddRel);

        // add attribute 和 add relation 的 modal 中 checkbox 的动作
        $(document).on('change', '#stigmod-modal-addrelation input[type="checkbox"]', handleAddRelChkBox);

        // 点击 addrelation 中的下拉菜单选项
        $(document).on('click', '#stigmod-dropdown-reltype-modal a', handleClkAddRelDrpdn);

        // addrelation 中点击交换 classname
        $(document).on('click', '#stigmod-addrel-class .glyphicon-transfer', handleClkAddRelDrpdnChg);

        // 每改变一次relation type，过滤一次推荐栏的内容
        $input.on('click', handleFilterRec);

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

            if (checkInputs(icm, $visibleInputs, stateOfPage) && isValidRelation($reltypeBtn)) {
                var relationId = widget.adoptingRec ? widget.adoptedRelationId : new ObjectId().toString(),
                        addingType = widget.adoptingRec ? 'binding' : 'fresh';

                // 添加 relation id 作为该relation在前端的Key
                icm.addRelation(stateOfPage.clazz, relationId, stateOfPage.addAttrRel, relationId, addingType);

                // 添加 properties
                var $propertyNew = $(this).closest('#stigmod-modal-addrelation').find('tr:visible');

                $propertyNew.each(function () {
                    var caseName = $(this).attr('stigmod-addrel-case');
                    var propertyName = $(this).find('td:first-child').text();
                    var propertyValue1 = null;
                    var propertyValue2 = null;

                    if ('type' === propertyName) {
                        propertyValue1 = $(this).find('button').text();
                        propertyValue2 = $(this).find('input:not([readonly])').val();
                    } else {
                        switch (caseName) {
                            case 'text':
                                propertyValue1 = $(this).find('input:not([readonly])').first().val();
                                propertyValue2 = $(this).find('input:not([readonly])').last().val();
                                break;
                            case 'radio':
                                propertyValue1 = $(this).find('input:checked').first().parent().text();
                                propertyValue2 = $(this).find('input:checked').last().parent().text();
                                break;
                        }
                    }

                    icm.addPropOfR(stateOfPage.clazz, relationId, [propertyName, [propertyValue1, propertyValue2]]);
                });

                widget.fire('insertNewItem', relationId);
                widget.close(); // 关闭当前 modal

                enableSave();
            }
        }

        // 处理：modal 显示前复位
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

            var nameOfBothEnds = stateOfPage.clazz.split('-'); // 获得关系两端的类名

            $(this).find('tr:nth-child(3) > td:nth-child(2) > input').val(nameOfBothEnds[0]); // 将类名填入
            $(this).find('tr:nth-child(3) > td:nth-child(3) > input').val(nameOfBothEnds[1]); // 将类名填入
            $(this).find('tr:nth-child(1)').css('display', 'table-row'); // 显示type项
            $(this).find('tr:nth-child(2)').css('display', 'table-row'); // 显示role项
            $(this).find('tr:nth-child(3)').css('display', 'table-row'); // 显示class项
            $(this).find('tr:nth-child(4)').css('display', 'table-row'); // 显示multiplicity项

            widget.adoptingRec = false;
            widget.adoptedRelationId = '';
            widget.fire('init');

            // 刷新 modal 推荐栏
            widget.initRecWgt(icm, ccm, stateOfPage);
        }

        // 处理：add attribute 和 add relation 的 modal 中 checkbox 的动作
        function handleAddRelChkBox() {
            var id = '#stigmod-addrel-' + $(this).val();

            if ($(this).is(':checked')) {
                $(id).css({'display': 'table-row'});
            } else {
                $(id).css({'display': 'none'});
            }
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

        // 处理：addrelation 中点击交换 classname
        function handleClkAddRelDrpdnChg(event) {
            var $classnames = $(this).closest('#stigmod-addrel-class').find('.stigmod-input');
            var tmp = $classnames.first().val();

            $classnames.first().val($classnames.last().val());
            $classnames.last().val(tmp);

            event.preventDefault();
        }

        // 处理：过滤推荐栏的内容
        function handleFilterRec() {
            widget.recommendation.filter($(this).find('a').text());
        }
    };

    // 初始化该Dialog组件中的Input组件
    RelationDialogWgt.prototype.initInputWgts = function () {
        var relation;
        relation = this.relation = {};  // relation中收编所有的property

        // dropdown输入  TODO: 如果以后有自动修改type的需求，这里再写起来
        //relation.type = new DropdownInputWgt('#stigmod-addrel-type');  // 单个框

        // 文本输入
        relation.name = new TextInputWgt('#stigmod-addrel-type');  // 单个框、没有开关(与type组件共用同一个id)
        relation.role = new TextInputWgt('#stigmod-addrel-role', '#stigmod-addrel-role-swt');
        relation.clazz = new TextInputWgt('#stigmod-addrel-class');  // 没有开关
        relation.multiplicity = new TextInputWgt('#stigmod-addrel-multiplicity', '#stigmod-addrel-multiplicity-swt');
        relation.subsets = new TextInputWgt('#stigmod-addrel-subsets', '#stigmod-addrel-subsets-swt');
        relation.redefines = new TextInputWgt('#stigmod-addrel-redefines', '#stigmod-addrel-redefines-swt');

        // 单选输入
        relation.ordering = new RadioInputWgt('#stigmod-addrel-ordering', '#stigmod-addrel-ordering-swt');
        relation.uniqueness = new RadioInputWgt('#stigmod-addrel-uniqueness', '#stigmod-addrel-uniqueness-swt');
        relation.readOnly = new RadioInputWgt('#stigmod-addrel-readOnly', '#stigmod-addrel-readOnly-swt');
        relation.union = new RadioInputWgt('#stigmod-addrel-union', '#stigmod-addrel-union-swt');
        relation.composite = new RadioInputWgt('#stigmod-addrel-composite', '#stigmod-addrel-composite-swt');
    };

    // 设置该Dialog组件中Input组件的值
    RelationDialogWgt.prototype.setInputWgtValue = function (relationModel) {

        // 处理双框
        var properties = 'role clazz multiplicity ordering uniqueness readOnly union subsets redefines composite'.split(' '),
                len = properties.length, i;

        for (i = 0; i < len; i++) {
            if (properties[i] in relationModel) {
                this.relation[properties[i]].turnOn(relationModel[properties[i]].split('-'));
            } else {
                this.relation[properties[i]].turnOff();
            }
        }

        // 处理单框组件 (type, name)
        if (relationModel.name) {
            this.relation.name.turnOn([relationModel.name]);
        } else {
            this.relation.name.turnOn(['']);
        }

        // 绑定id
        this.adoptingRec = true;
        this.adoptedRelationId = relationModel.id;
    };

    // 初始化推荐栏
    RelationDialogWgt.prototype.initRecWgt = function (icm, ccm, stateOfPage) {
        this.recommendation = new RelationRecWgt('#stigmod-modal-rec-relation');
        this.recommendation.init(icm, ccm, stateOfPage);
        this.recommendation.on('itemClicked', 'setInputWgtValue', this);  // 条目被点击时，将该条目的数据填入表中
    };



    /**
     * removeConfirm 对话框组件
     * @constructor
     */
    function RemoveConfirmDialogWgt() {
        DialogWgt.apply(this, arguments);
    }
    _.extend(RemoveConfirmDialogWgt, DialogWgt);

    // 事件监听初始化
    RemoveConfirmDialogWgt.prototype.init = function (icm, stateOfPage) {
        this.initSuperClass();
        var widget = this;

        // 点击 remove 确认按钮
        $(document).on('click', '#stigmod-btn-remove', handleRemoveOk);

        // modal 显示前信息预处理
        $(document).on('show.bs.modal', '#stigmod-modal-remove', handleMdlRemove);

        // 处理：点击 remove 确认按钮
        function handleRemoveOk() {  // TODO: 删除后，stateOfPage的更新。(貌似没有这个需求)
            switch (stateOfPage.flagDepth) {
                case 0:

                    // 修改 model
                    icm.removeSubModel([stateOfPage.flagCRG], stateOfPage.clazz);
                    if (0 === stateOfPage.flagCRG) { // 删除 class 时，还要删除与之相关的 relation group
                        var relationGroups = icm.getSubModel([1]); // 获取所有 relation group

                        for (var nameRG in relationGroups) { // 遍历该 model 中的所有 relation group
                            if (relationGroups.hasOwnProperty(nameRG)) {
                                var matchName = null;
                                var classPat = new RegExp('\\b' + stateOfPage.clazz + '\\b');

                                matchName = nameRG.match(classPat);
                                if (null !== matchName) {
                                    icm.removeSubModel([1], nameRG);
                                }
                            }
                        }
                    }

                    // 更新显示
                    widget.fire('classRemoved', null);
                    break;

                case 1:

                    // 修改 model
                    icm.removeSubModel([stateOfPage.flagCRG, stateOfPage.clazz, 0], stateOfPage.attribute);
                    icm.removeOrderElem(stateOfPage.flagCRG, stateOfPage.clazz, stateOfPage.attribute);

                    // 更新显示
                    widget.fire('attributeRemoved', stateOfPage.attribute);
                    break;

                case 2:

                    // 修改 model
                    icm.removeSubModel([stateOfPage.flagCRG, stateOfPage.clazz, 0, stateOfPage.attribute, 0], stateOfPage.property);

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
                    widget.fire('propertyRemoved', null);
                    break;
            }

            widget.close(); // 关闭当前 modal
            enableSave();
        }

        // 处理：modal 显示前信息预处理
        function handleMdlRemove() {
            var type = new Array();

            type[0] = new Array('CLASS', 'ATTRIBUTE', 'PROPERTY');
            type[1] = new Array('RELATION GROUP', 'RELATION', 'PROPERTY');

            var name = [stateOfPage.clazz, stateOfPage.attribute, stateOfPage.property];

            $(this).find('.stigmod-modal-remove-type').text(type[stateOfPage.flagCRG][stateOfPage.flagDepth]);
            $(this).find('.stigmod-modal-remove-name').text(name[stateOfPage.flagDepth]);
        }
    };



    /**
     * 页面状态
     * @param stateRawData
     * @constructor
     */
    function StateOfPage(stateRawData) {

        this.user = stateRawData.userName;      // dataPassedIn 通过后端的 .ejs 模板传入
        this.modelID = stateRawData.icmId;      // dataPassedIn 通过后端的 .ejs 模板传入
        this.modelName = stateRawData.icmName;  // dataPassedIn 通过后端的 .ejs 模板传入

        this.flagCRG = 0;        // 0: class, 1: relationGroup
        this.flagDepth = 0;      // for class: (0: class, 1: attribute, 2: propertyOfA) for relationGroup: (0: relationGroup, 1: relation, 2: propertyOfR)

        this.clazz = '';         // <-> relationGroup
        this.attribute = '';     // <-> relation
        this.property = '';      // <-> property

        this.addAttrRel = {};
        this.addAttrRel.position = '';   // 增加 attribute 或 relation 时 插入的位置  (attrel name 或 '@') ('@' 代表最下方的add按钮)
        this.addAttrRel.direction = 0;   // 增加 attribute 或 relation 时 插入的方向 （0: up, 1: down

        this.windowResizeMutex = 0;      // 为防止窗口大小变化时频繁执行某些操作，设置一个锁

        _.makePublisher(this);
    }

    // 用传入的数据更新页面状态
    StateOfPage.prototype.updateState = function (obj) {
        if (typeof obj !== 'object') {
            return;
        }
        var keys;
        for (keys in obj) {
            if (obj.hasOwnProperty(keys)) {
                if (typeof this[keys] !== 'undefined') {  // 防止StateOfPage对象被随意添加属性
                    this[keys] = obj[keys];
                }
            }
        }
        //console.log('StateOfPage', this);
    };



    /**
     * 输入组件
     * 注意: 组件的element并不直接是input，而是包裹在input外层的元素（可能有多层包裹，一般是TR+TD的包裹方式）
     * @constructor
     */
    function InputWgt() {
        Widget.call(this, arguments[0]);  // 注意！InputWgt中不能有template（第二个参数仅用于构造开关）

        // 若传入了第二个参数，则构造一个开关
        if (arguments[1]) {
            this.addSwitch(arguments[1]);
        }
    }
    _.extend(InputWgt, Widget);

    // 增加开关（一般为CheckBoxInputWgt类型）
    InputWgt.prototype.addSwitch = function (selector) {
        this.swt = new CheckBoxInputWgt(selector);
    };

    // 打开
    InputWgt.prototype.turnOn = function (value) {
        this.setValue(value);
        this.element.show();

        if (this.swt) {
            this.swt.doCheck();
        }
    };

    // 关闭
    InputWgt.prototype.turnOff = function () {
        this.setValue(['', '']);
        this.element.hide();

        if (this.swt) {
            this.swt.undoCheck();
        }
    };



    /**
     * 文本输入组件
     * @constructor
     */
    function TextInputWgt() {
        InputWgt.apply(this, arguments);
        this.init();
    }
    _.extend(TextInputWgt, InputWgt);

    // 初始化
    TextInputWgt.prototype.init = function () {
        var wrapper = this.element;

        this.inputElements = wrapper.find('input[type=text]:not([readonly])');  // input元素
        this.number = this.inputElements.length;  // input元素个数
    };

    // 为组件设置值
    TextInputWgt.prototype.setValue = function (value) {  // value 是一个数组，即使只有一个参数
        var i, el;

        for (i = 0; i < this.number; i++) {
            el = this.inputElements.eq(i);
            el.val(value[i]);

            // 触发文本合法性检查（value为空字符串时，表示需要重置该组件，因此不需触发检查。）
            if (value[i] !== '') {  // （若value为空字符串时触发检查，则会引发错误显示tooltip的BUG）
                el.trigger('keyup');
            }
        }
    };



    /**
     * 单选输入组件
     * @constructor
     */
    function RadioInputWgt() {
        InputWgt.apply(this, arguments);
        this.init();
    }
    _.extend(RadioInputWgt, InputWgt);

    // 初始化
    RadioInputWgt.prototype.init = function () {
        var wrapper = this.element;

        this.tds = wrapper.find('td');  // 表格中的td元素，第一个td是不含input的名字
        this.number = this.tds.length - 1;  // 有效td个数
    };

    // 为组件设置值
    RadioInputWgt.prototype.setValue = function (value) {  // value 是一个数组，即使只有一个参数
        var i, radio;

        for (i = 1; i - 1 < this.number; i++) {  // i从1开始，只看有效的td
            radio = this.tds.eq(i).find('input');

            if ('True' === value[i - 1]) {
                radio.eq(0).prop({'checked': true});  // 一定要用prop() | 因为attr()不好使，其仅在第一次执行时有用
                radio.eq(1).removeAttr('checked');

            } else if ('False' === value[i - 1]) {
                radio.eq(0).removeAttr('checked');
                radio.eq(1).prop({'checked': true});

            } else {
                radio.eq(0).removeAttr('checked');
                radio.eq(1).removeAttr('checked');
            }
        }
    };



    /**
     * 下拉框（Bootstrap中的dropdown组件）输入组件
     * @constructor
     */
    // TODO 修改设置值和初始化的操作细节
    function DropdownInputWgt() {
        InputWgt.apply(this, arguments);
        this.init();
    }
    _.extend(DropdownInputWgt, InputWgt);

    // 初始化
    DropdownInputWgt.prototype.init = function () {
        var wrapper = this.element;

        this.tds = wrapper.find('td');  // 表格中的td元素，第一个td是不含input的名字
        this.number = this.tds.length - 1;  // 有效td个数
    };

    // 为组件设置值
    DropdownInputWgt.prototype.setValue = function (value) {  // value 是一个数组，即使只有一个参数
        var i, radio;

        for (i = 1; i - 1 < this.number; i++) {  // i从1开始，只看有效的td
            radio = this.tds.eq(i).find('input');

            if ('True' === value[i - 1]) {
                radio.eq(0).prop({'checked': true});  // 一定要用prop() | 因为attr()不好使，其仅在第一次执行时有用
                radio.eq(1).removeAttr('checked');

            } else if ('False' === value[i - 1]) {
                radio.eq(0).removeAttr('checked');
                radio.eq(1).prop({'checked': true});

            } else {
                radio.eq(0).removeAttr('checked');
                radio.eq(1).removeAttr('checked');
            }
        }
    };


    /**
     * 多选输入组件(不同于文本或单选，一般仅做为输入组件的开关存在)
     * @constructor
     */
    function CheckBoxInputWgt() {
        InputWgt.apply(this, arguments);
    }
    _.extend(CheckBoxInputWgt, InputWgt);

    // 勾选
    CheckBoxInputWgt.prototype.doCheck = function () {
        this.element.find('input[type=checkbox]').prop('checked', true);
    };

    // 取消勾选
    CheckBoxInputWgt.prototype.undoCheck = function () {
        this.element.find('input[type=checkbox]').removeAttr('checked');
    };



    /**
     * 推荐组件
     * @constructor
     */
    function RecommendationWgt() {
        Widget.apply(this, arguments);
        this.addTemplateWidget({t: '#template-modal-rec'});  // 所有推荐栏都使用同样的模板（list-group）
    }
    _.extend(RecommendationWgt, Widget);

    // 过滤结果
    RecommendationWgt.prototype.filter = function (text) {
        var $items = this.element.children(),
                len = $items.length,
                i, $item;

        for (i = 0; i < len; i++) {
            $item = $items.eq(i);

            if ($item.find('span.tag').text() === text) {
                $item.show();
            } else {
                $item.hide();
            }
        }
    };



    /**
     * Class推荐组件
     * @constructor
     */
    function ClassRecWgt() {
        RecommendationWgt.apply(this, arguments);
    }
    _.extend(ClassRecWgt, RecommendationWgt);

    // 初始化
    ClassRecWgt.prototype.init = function (icm, ccm) {
        this.data = ccm.getClasses(icm);
        console.log('this.data(getClasses)', this.data);

        var data = this.data,
                $container = this.element.empty(),
                template = this.templateWgt.t,
                widget = this,
                i, len, $item, popover;

        for (i = 0, len = data.length; i < len; i++) {
            $item = template.newElement().appendTo($container);
            $item.find('.tag').text(data[i].name);  // 填入名字
            $item.attr('data-i', i);  // 做标记，用于处理点击

            popover = this.getPopover(data[i].attribute);
            $item.attr('data-content', popover);
            $item.attr('title', 'CLASS : ' + data[i].name);

            // 点击填表
            $item.on('click', fillInBlanks);
        }

        // 重新激活所有的 popover
        this.element.find('[data-toggle="popover"]').popover();

        // 初始时不显示
        this.filter('');

        // 处理：点击填表
        function fillInBlanks(event) {
            var i = $(this).attr('data-i');
            widget.fire('itemClicked', data[i]);
        }
    };

    // 获取popover内容
    ClassRecWgt.prototype.getPopover = function (item) {
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

        return popover;
    };


    /**
     * Attribute推荐组件
     * @constructor
     */
    function AttributeRecWgt() {
        RecommendationWgt.apply(this, arguments);
    }
    _.extend(AttributeRecWgt, RecommendationWgt);

    // 初始化
    AttributeRecWgt.prototype.init = function (icm, ccm, stateOfPage) {
        var classId = icm.getClassId(stateOfPage.clazz);
        this.data = ccm.getAttributes(icm, classId, stateOfPage.clazz);
        console.log('this.data(getAttributes)', this.data);

        var data = this.data,
                $container = this.element.empty(),
                template = this.templateWgt.t,
                widget = this,
                i, len, $item, popover;

        for (i = 0, len = data.length; i < len; i++) {
            $item = template.newElement().appendTo($container);
            $item.find('.tag').text(data[i].name);  // 填入名字
            $item.attr('data-i', i);  // 做标记，用于处理点击

            popover = this.getPopover(data[i]);
            $item.attr('data-content', popover);
            $item.attr('title', 'ATTRIBUTE : ' + data[i].name);

            // 点击填表
            $item.on('click', fillInBlanks);
        }

        // 重新激活所有的 popover
        this.element.find('[data-toggle="popover"]').popover();

        // 初始时不显示
        this.filter('');

        // 处理：点击填表
        function fillInBlanks(event) {
            var i = $(this).attr('data-i');
            widget.fire('itemClicked', data[i]);
        }
    };

    // 获取popover内容
    AttributeRecWgt.prototype.getPopover = function (item) {
        var elem, popover = '', key,
                hiddenList = {  // 屏蔽掉功能字段
                    'id': true,
                    'ref': true
                };

        // item 不为空时才进行转换
        if (item) {
            for (key in item) {
                if (item.hasOwnProperty(key) && !(key in hiddenList)) {
                    elem = '<p>' + key + ' : ' + item[key] + '</p>';
                    popover += elem;
                }
            }
        }

        return popover;
    };


    /**
     * Relation推荐组件
     * @constructor
     */
    function RelationRecWgt() {
        RecommendationWgt.apply(this, arguments);
    }
    _.extend(RelationRecWgt, RecommendationWgt);

    // 初始化
    RelationRecWgt.prototype.init = function (icm, ccm, stateOfPage) {
        this.data = ccm.getRelations(icm, stateOfPage.clazz);
        console.log('this.data(getRelations)', this.data);

        var data = this.data,
                $container = this.element.empty(),
                template = this.templateWgt.t,
                widget = this,
                i, len, $item, popover;

        for (i = 0, len = data.length; i < len; i++) {
            $item = template.newElement().appendTo($container);
            $item.find('.tag').text(data[i].type);  // 填入名字
            $item.attr('data-i', i);  // 做标记，用于处理点击

            popover = this.getPopover(data[i]);
            $item.attr('data-content', popover);
            $item.attr('title', 'RELATION : ' + data[i].type);

            // 点击填表
            $item.on('click', fillInBlanks);
        }

        // 重新激活所有的 popover
        this.element.find('[data-toggle="popover"]').popover();

        // 初始时不显示
        this.filter('');

        // 处理：点击填表
        function fillInBlanks(event) {
            var i = $(this).attr('data-i');
            widget.fire('itemClicked', data[i]);
        }
    };

    // 获取popover内容
    RelationRecWgt.prototype.getPopover = function (item) {
        var elem, popover = '', key,
                hiddenList = {  // 屏蔽掉功能字段
                    'id': true,
                    'ref': true
                    //'clazz': true
                };

        // item 不为空时才进行转换
        if (item) {
            for (key in item) {
                if (item.hasOwnProperty(key) && !(key in hiddenList)) {
                    elem = '<p>' + key + ' : ' + item[key] + '</p>';
                    popover += elem;
                }
            }
        }

        return popover;
    };


    /** ---------------------- *
     *
     *         辅助函数
     *
     ** ---------------------- */

    // 获取输入内容合法性检查结果
    function getInputCheckResult(model, inputCase, input, stateOfPage) {

        var pattern = null;
        switch (inputCase) {

            // 类名
            case 'class-add':
                pattern = /^[A-Z][A-Za-z]*$/;
                if (!pattern.test(input)) {  // 格式不合法
                    return 'Valid Format: English letters, with initials in capitals.';
                } else if (model.doesNodeExist(0, input)) {  // 类名重复
                    return 'Class already exists.';
                } else {  // 合法
                    return 'valid';
                }
                break;
            case 'class-modify':
                pattern = /^[A-Z][A-Za-z]*$/;
                if (!pattern.test(input)) {  // 格式不合法
                    return 'Valid Format: English letters, with initials in capitals.';
                } else if ((stateOfPage.clazz !== input) && model.doesNodeExist(0, input)) {  // 新类名与【其他】类名重复 (与该类修改前类名重复是允许的)
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
                    return 'Valid Format: English letters, with the first letter in lowercase.';
                } else if (model.doesNodeExist(2, input, stateOfPage.clazz)) {  // attribute 名重复
                    return 'Attribute name already exists.';
                } else {  // 合法
                    return 'valid';
                }
                break;
            case 'attribute-modify':
                pattern = /^[a-z][A-Za-z]*$/;
                if (!pattern.test(input)) {  // 格式不合法
                    return 'Valid Format: English letters, with the first letter in lowercase.';
                } else if ((stateOfPage.attribute !== input) && model.doesNodeExist(2, input, stateOfPage.clazz)) {  // attribute 名与其他 attribute 重复
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
                    return 'Valid Type: A class or built-in type ("int" / "float" / "string" / "boolean").';
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
                    return 'Valid Format: A number("*" denotes "multiple"), or two numbers concatenated by ".."';
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
                    return 'Valid Format: "public" / "private" / "protected" / "package"';
                } else {  // 合法
                    return 'valid';
                }
                break;

            // relation 名
            case 'relation-add':
            case 'relation-modify':
                pattern = /^(|[a-z][A-Za-z]*)$/;  // 可为空
                if (!pattern.test(input)) {  // 不是内置类型，也不是类
                    return 'Valid Format: NULL or english letters, with the first letter in lowercase.';
                } else {  // 合法
                    return 'valid';
                }
                break;

            // relation 两端的角色
            case 'role-add':
            case 'role-modify':
                pattern = /^[a-z][A-Za-z]*$/;
                if (!pattern.test(input)) {  // 不是内置类型，也不是类
                    return 'Valid Format: English letters, with the first letter in lowercase.';
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
                    return 'Input can not be NULL.';
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
    function checkInput(model, $input, stateOfPage) {  // $input 是单个输入框组件

        var inputCase = $input.attr('stigmod-inputcheck');  // 输入框类型

        // 仅在设定了输入框的 stigmod-inputcheck 属性时进行下面的检查操作
        if (undefined !== inputCase) {
            var input = $input.val();  // 输入框内容
            var checkResult = getInputCheckResult(model, inputCase, input, stateOfPage);  // 合法性检查结果
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
    function checkInputs(model, $inputs, stateOfPage) {  // $inputs 是一组输入框组件

        var num = $inputs.size();
        var allInputsAreValid = true;

        for (var i = 0; i < num; ++i) {

            // checkInput 放在左侧，防止函数里面的动作被 && 懒惰掉了。这样能让所有非法提示全部显示出来。
            allInputsAreValid = checkInput(model, $inputs.eq(i), stateOfPage) && allInputsAreValid;
        }

        return allInputsAreValid;
    }

    // 输入框出现后聚焦到第一个输入框上
    function focusOnInputIn($framework) {
        $framework.find('input[type=text]:not([readonly])').eq(0).select();  // not可处理typeahead带来的影响
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

    // 输入框下拉提示功能中取得子串的辅助函数
    function substringMatcher(icm, ccm, stateOfPage,  flag, maxLength) {  // 所生成的 matches 集合的最大长度（对于每一个 dataset 来说）

        return function findMatches(q, cb) {
            var matches,
                    substrRegex,
                    strs,  // 将 strs 的生成写在 findMatches 函数中，可保证每次查询时 icm 都是最新的
                    classId = icm.getClassId(stateOfPage.clazz);

            switch (flag) {
                case 'classInICM': strs = Object.keys(icm[0]); break;
                case 'relGroupInICM': strs = Object.keys(icm[1]); break;
                case 'classInCCM': strs = ccm.getClassNames(icm); break;
                case 'attributeInCCM': strs = ccm.getAttributeNames(icm, classId, stateOfPage.clazz); break;  // TODO 使用正确的ClassID
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
    }


});