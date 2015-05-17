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

    /**
     * 继承
     * @param subType
     * @param superType
     */
    function extend(subType, superType) {
        var F = function () {};
        F.prototype = superType.prototype;
        subType.prototype = new F();
        subType.prototype.constructor = subType;
    }


    /**
     * 页面
     * @constructor
     */
    function Page(icmRawData) {
        this.stateOfPage = new StateOfPage();
        this.icm = new ICM(icmRawData);
        this.leftColWgt = new LeftColWgt('#stigmod-nav-left', null);
        this.middleColWgt = new MiddleColWgt();
        //this.rightColWgt = new rightColWgt();
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
        //var tName;

        this.element = elementSelector && $(elementSelector);
        this.template = templateSelector && $(templateSelector).html();

        //for (tName in tPairs) {
        //    if (tPairs.hasOwnProperty(tName)) {
        //        this.template[tName] = $(tPairs[tName]).html();
        //    }
        //}
    }

    ///**
    // *
    // * @param element
    // * @param templateId
    // * @constructor
    // */
    //function WgtView(element, templateId) {
    //
    //    this.element = element;
    //    this.templateId = templateId;
    //
    //}
    //
    ///**
    // *
    // * @constructor
    // */
    //function WgtModel() {
    //
    //}
    //
    ///**
    // *
    // * @constructor
    // */
    //function WgtController() {
    //
    //}

    /**
     * 左侧栏组件
     * @constructor
     */
    function LeftColWgt() {
        Widget.apply(this, arguments);

        this.classListGroup = new LeftColListGroupWgt('#stigmod-nav-left-scroll .panel:first-child .list-group', '#template-left-class');
        this.relgrpListGroup = new LeftColListGroupWgt('#stigmod-nav-left-scroll .panel:last-child .list-group', '#template-left-relation-group');
    }

    extend(LeftColWgt, Widget);

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

    extend(LeftColListGroupWgt, Widget);

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

    extend(MiddleColWgt, Widget);

    /**
     *
     * @param userName
     * @param icmID
     * @param icmName
     * @constructor
     */
    function StateOfPage(userName, icmID, icmName) {

        this.user = userName;          // dataPassedIn 通过后端的 .ejs 模板传入
        this.modelID = icmID;      // dataPassedIn 通过后端的 .ejs 模板传入
        this.modelName = icmName;  // dataPassedIn 通过后端的 .ejs 模板传入

        this.flagCRG = 0;        // 0: class, 1: relationGroup
        this.flagDepth = 0;      // for class: (0: class, 1: attribute, 2: propertyOfA) for relationGroup: (0: relationGroup, 1: relation, 2: propertyOfR)

        this.class = '';         // <-> relationGroup
        this.attribute = '';     // <-> relation
        this.property = '';      // <-> property

        this.addAttrRel = {};
        this.addAttrRel.position = '';   // 增加 attribute 或 relation 时 插入的位置  (attrel name 或 '@') ('@' 代表最下方的add按钮)
        this.addAttrRel.direction = 0;   // 增加 attribute 或 relation 时 插入的方向 （0: up, 1: down

        this.windowResizeMutex = 0;      // 为防止窗口大小变化时频繁执行某些操作，设置一个锁

    }

    StateOfPage.prototype.setUser = function () {

    };


    module.exports = Page;
    //var page = new Page();


});