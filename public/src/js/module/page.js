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
        this.leftColWgt = new LeftColWgt('#stigmod-nav-left', null);
        this.middleColWgt = new MiddleColWgt();
        //this.rightColWgt = new rightColWgt();
        //console.log(this.stateOfPage);
        _.makePublisher(this);

        this.leftColWgt.on('pageStateChanged', 'updateState', this.stateOfPage);  // 左侧栏点击时更新页面状态
    }

    Page.prototype.refreshLeftCol = function() {
        this.leftColWgt.refresh(this.icm);
    };

    /**
     * 组件基类
     * @param elementSelector
     * @param templateSelector
     * @constructor
     */
    function Widget(elementSelector, templateSelector) {

        this.element = elementSelector && $(elementSelector);
        this.template = templateSelector && $(templateSelector).html();
        _.makePublisher(this);
    }


    /**
     * 左侧栏组件
     * @constructor
     */
    function LeftColWgt() {
        Widget.apply(this, arguments);

        var widget = this;

        this.classListGroup = new LeftColListGroupWgt('#stigmod-nav-left-scroll .panel:first-child .list-group', '#template-left-class');
        this.relgrpListGroup = new LeftColListGroupWgt('#stigmod-nav-left-scroll .panel:last-child .list-group', '#template-left-relation-group');

        // 左侧导航栏点击激活 并跳转
        $(document).on('click', '#stigmod-nav-left-scroll .list-group-item', handleClkLeft);

        // 处理：左侧导航栏点击激活 并跳转
        function handleClkLeft() {

            // 激活
            $(this).closest('#stigmod-nav-left-scroll').find('.list-group-item').removeClass('active');
            $(this).addClass('active');

            // 跳转
            var $it = $(this).find('span:nth-child(1)');

            widget.fire('pageStateChanged', {
                clazz: $it.text(),
                flagCRG: ("stigmod-nav-left-class" === $it.attr('class')) ? 0 : 1, // 0: class, 1: relationgroup
                flagDepth: 0
            });

            //fillMiddle(icm);
        }
    }

    _.extend(LeftColWgt, Widget);

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

    LeftColListGroupWgt.prototype.refresh = function(nameArray) {
        var $el = this.element,
                i, len,
                $listItem = this.template;

        $el.empty(); // 清空

        for (i = 0, len = nameArray.length; i < len; ++i) { // 类名
            $el.append($listItem);
            $el.find('a:last-child > span:first-child').text(nameArray[i])
                    .attr('stigmod-nav-left-tag', nameArray[i]); // 以名称作为标签写在组件上，便于查找
        }
    };

    /**
     *
     * @constructor
     */
    function MiddleColWgt() {
        Widget.apply(this, arguments);
    }

    _.extend(MiddleColWgt, Widget);

    /**
     *
     * @param stateRawData
     * @constructor
     */
    function StateOfPage(stateRawData) {

        this.user = stateRawData.userName;      // dataPassedIn 通过后端的 .ejs 模板传入
        this.modelID = stateRawData.icmID;      // dataPassedIn 通过后端的 .ejs 模板传入
        this.modelName = stateRawData.icmName;  // dataPassedIn 通过后端的 .ejs 模板传入

        this.flagCRG = 0;        // 0: class, 1: relationGroup
        this.flagDepth = 0;      // for class: (0: class, 1: attribute, 2: propertyOfA) for relationGroup: (0: relationGroup, 1: relation, 2: propertyOfR)

        this.class = '';         // <-> relationGroup
        this.attribute = '';     // <-> relation
        this.property = '';      // <-> property

        this.addAttrRel = {};
        this.addAttrRel.position = '';   // 增加 attribute 或 relation 时 插入的位置  (attrel name 或 '@') ('@' 代表最下方的add按钮)
        this.addAttrRel.direction = 0;   // 增加 attribute 或 relation 时 插入的方向 （0: up, 1: down

        this.windowResizeMutex = 0;      // 为防止窗口大小变化时频繁执行某些操作，设置一个锁

        _.makePublisher(this);
    }

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