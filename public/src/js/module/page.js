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
    //var modelView = require('../module/modelview');  // modelView 是一个函数，接受 icm 作为参数
    var _ = require('../module/util');

    /**
     * 页面
     * @constructor
     */
    function Page(stateRawData, icmRawData) {
        this.stateOfPage = new StateOfPage(stateRawData);
        this.icm = new ICM(icmRawData);

        this.leftColWgt = new LeftColWgt('#stigmod-nav-left');
        this.middleColWgt = new MiddleColWgt('#stigmod-cont-right-scroll', {
            attributeBasic: '#template-mid-att-basic',
            relationBasic: '#template-mid-rel-basic'
        });
        //this.rightColWgt = new rightColWgt();

        //this.middleColWgt.addTemplateWidget({
        //    attributeBasic: '#template-mid-att-basic',
        //    relationBasic: '#template-mid-rel-basic'
        //});

        _.makePublisher(this);

        this.leftColWgt.on('pageStateChanged', 'updateState', this.stateOfPage);  // 左侧栏点击时更新页面状态
        this.leftColWgt.on('refreshMiddleCol', 'refreshMiddleCol', this);  // 左侧栏点击时中间栏内容变换
    }

    // 刷新左侧栏
    Page.prototype.refreshLeftCol = function () {
        this.leftColWgt.refresh(this.icm);
    };

    // 刷新中间栏
    Page.prototype.refreshMiddleCol = function () {
        this.middleColWgt.refresh(this.icm, this.stateOfPage);
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

        var widget = this;
        this.classListGroup = new LeftColListGroupWgt('#stigmod-nav-left-scroll .panel:first-child .list-group');
        this.relgrpListGroup = new LeftColListGroupWgt('#stigmod-nav-left-scroll .panel:last-child .list-group');
        this.classListGroup.addTemplateWidget({t: '#template-left-class'});
        this.relgrpListGroup.addTemplateWidget({t: '#template-left-relation-group'});

        // 左侧导航栏点击激活 并跳转
        $(document).on('click', '#stigmod-nav-left-scroll .list-group-item', handleClkLeft);

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
    }
    _.extend(LeftColWgt, Widget);

    // 刷新左侧栏
    LeftColWgt.prototype.refresh = function(icm) {

        this.classListGroup.refresh(icm.getClassNames());
        this.relgrpListGroup.refresh(icm.getRelgrpNames());
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

    /**
     * 中间内容栏基本组件
     * @constructor
     */
    function ContentBasicWgt() {
        Widget.apply(this, arguments);
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
        refreshMiddelPanelTitle();

        function refreshMiddelPanelTitle() {
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
        }
    };

    /**
     * 页面状态
     * @param stateRawData
     * @constructor
     */
    function StateOfPage(stateRawData) {

        this.user = stateRawData.userName;      // dataPassedIn 通过后端的 .ejs 模板传入
        this.modelID = stateRawData.icmID;      // dataPassedIn 通过后端的 .ejs 模板传入
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
    };


    module.exports = Page;


});