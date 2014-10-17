//var single_name_old;
var mutex_input_dblclick = 0;
//element-global
$(function(){
    show_revise_change = function(that){
        $(that).children(".row-hover").hide();
        $(that).children(".control-sub").show();
        return true;
    };

    $(".row-hover .controls-text-small").live("dblclick",function(){
        $(this).parent().parent().children(".span1-compact").children().children(".icon-edit").trigger("click");
    });

    $(".row-hover .icon-edit").live("click",function(){
        //alert(".row-hover .icon-edit")
        if($(this).parent().parent().hasClass("relationTypeEdit")) return; //勉强这样做吧，虽然不太合适

        if(mutex_input_dblclick) return;
        else mutex_input_dblclick=1;

        show_revise_change($(this).parent().parent().parent().parent());
        //当修改属性时
        //先删除，以统一格式
        statusArray['attribute']['id'] = $(this).parent().parent().parent().parent().parent().parent().parent().children("input[type='hidden']").val();
        //Name Reform
        //for(var attributeName in icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id]['attributeName']){
        for(var attributeName in icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id]['name']){
            statusArray['attribute']["value"] = attributeName;
        }
        statusArray.attributeElem.type =chToEn[$(this).parent().parent().parent().children(".span4").children("label").text()];
        statusArray.attributeElem.id   = $(this).parent().parent().parent().children(".span4").children("p").text()
    });

    $(".icd-element-input-cancel").live("click",function(){
        var single_name_old = $(this).parent().parent().parent().parent().children(".row").children(".span4").children("p").text();
        if(single_name_old.replace( /^[" "|"　"]*/, "") === '') return;//去除所有均为空的情况
        $(this).parent().parent().children("input[type='text']").val(single_name_old);

        $(this).parent().parent().parent().hide();
        $(this).parent().parent().parent().parent().children(".row").show();
        mutex_input_dblclick = 0;
    });

    $(".icd-element-textarea").live("dblclick",function(){
        if(mutex_input_dblclick) return;
        else mutex_input_dblclick=1;

        $(this).hide();
        $(this).parent().children(".controls-small").show();
    });
});

var reviseElem ={};
//submit
$(function(){
    //cdName
    $(".icd-element-input-cd-submit").live("click",function(){
        var value = revise_show_change_submit($(this),icd['cd'],false);
        if(value.state === true){
            //显示部分
            var head= '<i class="icon-chevron-right" title="click to remove"></i><i class="icon-remove-sign-right"></i>';
            //替换显示
            $(".bs-docs-sidenav .active").children("a").html(head+value.new);
            $(".bs-docs-sidenav .active").attr('name',value.new);
            //存储相关
            $.ajax({
                url: '/post/data/icd-element',
                type: 'post',
                data: {
                    statusArray:statusArray,
                    type : 'cd',
                    process : 'revise',
                    data: {
                        old:value.old,
                        sub :icd['cd'][value.old],
                        new:value.new
                    }
                },
                dataType: 'json',
                success: function(doc){
                    icd = doc.icd;
                    getSourceNav();
                    if(doc.count != 1) return alert("Fail! Please refresh the page and try it again");
                }
            });
        }
    });
    //cd _discription
    $(".icd-element-textarea-submit").live("click",function(){
        var newDescription = $(this).parent().parent().children("textarea").val();
        //if(old === '') return;
        if(newDescription.replace( /^[" "|"　"]*/, "") === '') return;//去除所有均为空的情况
        $(this).parent().parent().parent().children("p").text(newDescription);

        $(this).parent().parent().hide();
        $(this).parent().parent().parent().children(".icd-element-textarea").show();
        mutex_input_dblclick = 0;
        $.ajax({
            url: '/post/data/icd-element',
            type: 'post',
            data: {
                statusArray:statusArray,
                type : '_description',
                process : 'revise',
                data: {
                    sub:newDescription
                }
            },
            dataType: 'json',
            success: function(doc){
                if(doc.count != 1) return alert("Fail! Please refresh the page and try it again");
                icd = doc.icd;
                getSourceNav();
            }
        });
    });

    $(".icd-element-textarea-cancel").live("click",function(){
        var old = $(this).parent().parent().parent().children("p").text();
        if(old.replace( /^[" "|"　"]*/, "") === '') return;//去除所有均为空的情况
        $(this).parent().parent().children("textarea").val(old);

        $(this).parent().parent().hide();
        $(this).parent().parent().parent().children(".icd-element-textarea").show();
        mutex_input_dblclick = 0;
    });
    //class
    $(".icd-element-input-class-submit").live("click",function(){
        var value = revise_show_change_submit($(this),icd['class'],true);
        if(value.state === true){
            //show部分
            var head= '<i class="icon-chevron-right" title="click to remove"></i><i class="icon-remove-sign-right"></i>';
            $(".bs-docs-sidenav .active").children("a").html(head+value.new);
            //存储部分
            var data ={
                old:value.old,
                sub :icd['class'][statusArray.class.id]['name'][value.old],
                new:value.new
            }
            ajax_classNameRevise(data);
        }
    });

    $('#modal-alter-content').on('show', function () {
        //验证信息
        $("#modal-alter-content").children(".modal-header").children("h5").text(reviseElem.label+"：From “"+reviseElem.old.value+"” to “"+reviseElem.new.value+"”");
        $("#modal-alter-content").children(".modal-body").find(".selector").find(".body").children().remove();
        $("#modal-alter-content").children(".modal-body").find(".info").find(".body").children().remove();

        idToIcdDir = {};
        generateIcdIndex(reviseElem.sub.icd,reviseElem.old.id,'class');
        selectLoop(reviseElem.sub.icd,reviseElem.sub.ccd,'class',reviseElem.new,$("#modal-alter-content").children(".modal-body").find(".selector").find(".body"));

    });

    $(".icd-element-input-relation-submit").live("click",function(){
        var class1 = $(this).parent().parent().children().eq(0).children("input[type='text']").val();
        var class2 = $(this).parent().parent().children().eq(1).children("input[type='text']").val();

        if(class1.replace( /^[" "|"　"]*/, "") === '') return;//去除所有均为空的情况
        if(class2.replace( /^[" "|"　"]*/, "") === '') return;//去除所有均为空的情况

        var relationname = class1 +'-'+class2;
        if(checkExist(icd['relation'],relationname)) return alert("Name aleady Exist");

        var text = $(this).parent().parent().parent().children(".row").children(".span4").children("p");
        var oldName=$(text).text();
        $(text).text(relationname);

        $(this).parent().parent().parent().children().show();
        $(this).parent().parent().hide();
        mutex_input_dblclick = 0;

        var head= '<i class="icon-chevron-right" title="click to remove"></i><i class="icon-remove-sign-right"></i>';
        $(".bs-docs-sidenav .active").children("a").html(head+relationname);

        $.ajax({
            url: '/post/data/icd-element',
            type: 'post',
            data: {
                statusArray:statusArray,
                type : 'relation',
                process : 'revise',
                data: {
                    old:oldName,
                    sub :icd['relation'][statusArray['relation']]['_value'][oldName],
                    new:relationname
                }
            },
            dataType: 'json',
            async: true,
            success: function(doc){
                icd = doc.icd;
                getSourceNav();
                if(doc.count != 1) return alert("Fail! Please refresh the page and try it again");
            }
        });
    });

    $(".icd-element-input-relation-cancel").live("click",function(){
        var relationname = $(this).parent().parent().parent().children(".row").children(".span4").children("p").text();
        relationname = relationname.split("-");
        if(relationname[0].replace( /^[" "|"　"]*/, "") === '') return;//去除所有均为空的情况
        if(relationname[1].replace( /^[" "|"　"]*/, "") === '') return;//去除所有均为空的情况

        $(this).parent().parent().children().eq(0).children("input[type='text']").val(relationname[0]);
        $(this).parent().parent().children().eq(1).children("input[type='text']").val(relationname[1]);

        $(this).parent().parent().parent().children().show();
        $(this).parent().parent().hide();
        mutex_input_dblclick = 0;
    });

    revise_show_change_submit = function(that,dir,checkLegal){
        var value = {state:false};
        value.new = $(that).parent().parent().children("input[type='text']").val();
        value.type = $(that).parent().parent().parent().children("label").text();
        if(value.new.replace( /^[" "|"　"]*/, "") === '') return value;//去除所有均为空的情况
        else if(checkLegal){
            if(checkExist(dir,value.type,value.new))  return;
        }
        value.state = true;

        var text = $(that).parent().parent().parent().parent().children(".row").children(".span4").children("p");
        value.old = $(text).text();
        $(text).text(value.new);

        $(that).parent().parent().parent().hide();
        $(that).parent().parent().parent().parent().children(".row").show();

        mutex_input_dblclick = 0;
        return value;
    };

    $(".icd-element-input-submit").live("click",function(){
        statusArray['attribute']={
            value : $(this).parent().parent().parent().parent().parent().children().eq(0).find("p").text(),
            id :$(this).parent().parent().parent().parent().parent().parent().parent().children("input[type='hidden']").val()
        }
        var dir = null;
        //如果不是attributeName之后会修正
        var value = revise_show_change_submit($(this),icd.class[statusArray.class.id].attribute,true);
        var that = $(this).parent().parent().parent().parent();
        //无需做重复性检验这里只是为了统一
        if(value.state === true){
            if(chToEn[value.type] === "multiplicity"){
                value.new = multiTransform.changeToShow(value.new);
                value.old = multiTransform.changeToShow(value.old);
                //因为直接出发的是不对的
                var showElem = multiTransform.changeToPost(value.new);
                $(this).parent().parent().parent().parent().children(".recommend-element").children(".span4").children("p").text(showElem);
                $(this).parent().parent().children("input[type='text']").val(showElem)
            }
            statusArray['attributeElem'] = {
                type : chToEn[value.type],
                id : value.new
            }
            var type="attributeElem";
            if(chToEn[value.type] === "name"){
                type = "attributeName";//此处因为是上传数据。。。
            }
            $.ajax({
                url: '/post/data/icd-element',
                type: 'post',
                data: {
                    statusArray:statusArray,
                    type : type,
                    process : 'revise',
                    data: {
                        old:value.old,
                        sub :icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][statusArray.attributeElem.type][value.old],
                        new:value.new
                    }
                },
                dataType: 'json',
                async: true,
                success: function(doc){
                    icd = doc.icd;
                    getSourceNav();
                    if(doc.count != 1) return alert("Fail! Please refresh and try it again");
                    summaryIntoString($(that).parent().parent().parent());
                    $(that).children(".recommend-element").trigger("click");
                }
            });
        }
    });

    $(".icd-element-input-relation-type-submit").live("click",function(){
        var value={};
        value.new = $(this).parent().parent().children("label").children("input[type='radio']:checked").val();
        var text = $(this).parent().parent().parent().children(".row").children(".span4").children("p");
        value.old = $(text).text();
        $(text).text(value.new);

        value.new = chToEn[value.new];
        value.old = chToEn[value.old];

        $(this).parent().parent().hide();
        $(this).parent().parent().parent().children(".row").show();
        mutex_input_dblclick=0;
        var url='/post/html/icd-element-relation-sub-'+value.new;

        $.ajax({
            url: '/post/data/icd-element',
            type: 'post',
            data: {
                statusArray:statusArray,
                type : 'relationType',
                process : 'revise',
                data: {
                    old:value.old,
                    sub :icd['relation'][statusArray['relation']][value.old],
                    new:value.new
                }
            },
            dataType: 'json',
            async: true,
            success: function(doc){
                icd = doc.icd;
                getSourceNav();
                if(doc.count != 1) return alert("Fail! Please refresh and try it again");
                $.ajax({
                    url: url,
                    type: 'post',
                    data: {},
                    success: function(html){
                        $("#icd-relation-detail").children().remove();
                        $("#icd-relation-detail").append(html);
                        var className = statusArray['relation'].split("-");
                        icd_element_relationType_show[value.new]($("#icd-relation-detail"),className,icd['relation'][statusArray['relation']][value.new]);
                    }
                });
            }
        });
    });

    $(".icd-element-input-relation-type-cancel").live("click",function(){
        var checked_val = $(this).parent().parent().parent().find("p").text();
        $(this).parent().parent().children("label").children("input[type='radio'][value="+checked_val+"]").attr('checked','checked');

        $(this).parent().parent().hide();
        $(this).parent().parent().parent().children(".row").show();
        mutex_input_dblclick=0;
    });

    $(".icd-element-input-multi1-submit").live("click",function(){
        multi_submit($(this),'multiply1');
    });

    $(".icd-element-input-multi2-submit").live("click",function(){
        multi_submit($(this),'multiply2');
    });

    multi_submit = function(that,multiType){
        var value = revise_show_change_submit($(that),null,false);
        statusArray['relationElem'] = multiType;
        if(value.state === true){
            $.ajax({
                url: '/post/data/icd-element',
                type: 'post',
                data: {
                    statusArray:statusArray,
                    type : 'relationElemValue',
                    process : 'revise',
                    data: {
                        old:value.old,
                        sub :icd['relation'][statusArray['relation']][statusArray['relationType']][multiType][value.old],
                        new:value.new
                    }
                },
                dataType: 'json',
                success: function(doc){
                    icd = doc.icd;
                    getSourceNav();
                    if(doc.count != 1) return alert("Fail! Please refresh and try it again");
                }
            });
        }
    };
});

//accordion-group top lable
$(function(){
    var this_group = '';
    var alert_type = '';
    var alert_name = '';
    var alert_id = '';

    $(".accordion-heading .row").live('click',function(){
        $(this).parent().parent().parent().children(".accordion-body").toggle();
    })
    //这是relation层的，为什么导致上面直接用accordion-heading的不工作，不太清楚
    $(".accordion-heading.row").live('click',function(){
        $(this).parent().children(".accordion-body").toggle();
    })

    $(".accordion-heading .span4").live("click",function(){
        //$(this).parent().parent().parent().parent().children(".accordion-body").toggle();
    });

    $(".recommend-attribute .icon-zoom-in").live("click",function(){
        //$(this).parent().parent().parent().parent().parent().parent().children(".accordion-body").toggle();
    });

    $(".recommend-attribute .icon-trash").live("click",function(){
        $(this).parent().parent().parent().parent().parent().parent().children(".accordion-body").toggle();
        this_group = $(this).parent().parent().parent().parent().parent().parent();
        alert_type = "Attribute";
        alert_name =  $(this_group).children(".accordion-body").children(".accordion-inner ").children(".control-group").eq(0).find(".span4").children("p").text();
        $('#modal-alert-element').modal('show');
    });

    $('#modal-alert-element').on('show', function () {
        $("#modal-alert-element").children(".modal-body").children("h5").text("Delete  "+alert_type+" : "+alert_name+"?");
    });

    $('#delete-element').live('click',function(){
        var status_type;
        var attribute_id,alert_id;
        if(alert_type === 'Attribute'){
            status_type = 'attribute';
            attribute_id = $(this_group).children("input[type='hidden']").val();
            var element = statusArray['attribute'] = {
                id : attribute_id,
                value : alert_name
            };
            var sub = icd['class'][statusArray.class.id]['attribute'][attribute_id];
        }else{
            //可能与recommend存在重复性
            status_type = 'attributeElem';
            attribute_id = $(this_group).parent().parent().parent().children("input[type='hidden']").val();
            //Name Reform
            //for(var key in icd['class'][statusArray.class.id]['attribute'][attribute_id]['attributeName']){
            for(var key in icd['class'][statusArray.class.id]['attribute'][attribute_id]['name']){
                statusArray['attribute'] = {
                    id : attribute_id,
                    value : key
                }
                break;
            }
            var element = statusArray['attributeElem'] = {
                type : chToEn[alert_type],
                id : alert_name
            };
            var sub = icd['class'][statusArray.class.id]['attribute'][attribute_id][chToEn[alert_type]][alert_name];
        }
        $.ajax({
            url: '/post/data/icd-element',
            type: 'post',
            data: {
                statusArray:statusArray,
                type : status_type,
                process : 'remove',
                data: {
                    new:element,
                    sub:sub
                }
            },
            dataType: 'json',
            async: true,
            success: function(doc){
                icd =doc.icd;
                getSourceNav();
                if(doc.count != 1) return alert("Fail! Please refresh and try it again");
                else{
                    if(status_type != 'attribute') {
                        var accordionGroup = $(this_group).parent().parent().parent();
                        $(this_group).remove();
                    }else{
                        $(this_group).remove();
                        icd_element_attribute_order_get();
                    }
                    summaryIntoString(accordionGroup);
                }

            }
        });
    });

    $('#delete-relation-type').live('click',function(){
        //id 用户删除，type用户定性，id用户定位
        //sub层面精确到id的下一层
        var element = statusArray.relationType;
        var sub = icd['relation'][statusArray.relation.id][statusArray.relationType.type][statusArray.relationType.id];
        $.ajax({
            url: '/post/data/icd-element',
            type: 'post',
            data: {
                statusArray:statusArray,
                type : 'relationType',
                process : 'remove',
                data: {
                    new:element,
                    sub:sub
                }
            },
            dataType: 'json',
            async: true,
            success: function(doc){
                icd =doc.icd;
                if(doc.count != 1) return alert("Fail! Please refresh and try it again");
                else $(this_group).remove();
            }
        });
    });

    $(".recommend-attribute .icon-plus-sign").live("click",function(){
        $(this).parent().parent().parent().parent().parent().parent().children(".accordion-body").toggle();
        this_group = $(this).parent().parent().parent().parent().parent().parent();
        var attribute = $(this_group).children("input[type='hidden']").val();
        //Name Reform
        //for(var key in icd['class'][statusArray.class.id]['attribute'][attribute]['attributeName']){
        for(var key in icd['class'][statusArray.class.id]['attribute'][attribute]['name']){
            statusArray['attribute'] = {
                id : attribute,
                value : key
            }
            break;
        }

        this_group = $(this).parent().parent().parent().parent().parent().parent();
        alert_type = "attribute";
        alert_name =  $(this_group).children(".accordion-body").children(".accordion-inner ").children(".control-group").eq(0).find(".span4").children("p").text();

        //$('#modal-attribute-add').modal('show');
        $('#modal-attribute-add-multi').modal('show');
    });

    $('#modal-attribute-add').on('show', function () {
        $("#modal-attribute-add").children(".modal-header").children("h5").text('Create element of Attribute"'+alert_name+'"');
        $("#modal-attribute-add").children(".modal-body").children(".btn-group").children("button").html('Select  ...  <span class="caret"></span>');
        var ul = $("#modal-attribute-add").children(".modal-body").children(".btn-group").children("ul");
        $(ul).children().remove();
        var dir = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id];
        for(var i=0;i<m_attributeElem.length;i++){
            if(dir[m_attributeElem[i]] === undefined){
                $(ul).append("<li value="+m_attributeElem[i]+"><a href='javascript:;'>"+enToCh[m_attributeElem[i]]+"</a></li>");
            }
        }
        $("#modal-attribute-add").children(".modal-body").children("input[type=text]").val("");
    });

    $('#modal-attribute-add-multi').on('show', function () {
        //初始化title
        $(this).children(".modal-header").children("h5").text('Add properties of Attribute"'+alert_name+'"');
        //初始化结构
        $(this).find(".multi-choose").children().remove();
        ajax_getHtml('/post/html/icd-modal-attribute-property-choose',$(this).find(".multi-choose"),null);
        $(this).find(".multi-input").children().remove();
        ajax_getHtml('/post/html/icd-modal-attribute-property-input',$(this).find(".multi-input"),null);
        //填充
        var dir = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id];
        var list = {};
        for(var label in dir){
           if(typeof dir[label] === 'string') continue;
            for(var value in dir[label]){
                list[label] = value;
            }
        }
        //遍历，填充，fix，click
        var trs = $("#modal-attribute-add-multi .multi-input tr");

        for(var i=0;i<trs.length;i++){
            var label = $(trs).eq(i).children("td").eq(0).text();
            if(list[label] != undefined){
                //数据填充
                var input=$(trs).eq(i).children("td").eq(1).find("input");
                if(input.length === 1){
                    if(label === 'multiplicity') list[label] = multiTransform.changeToPost(list[label]);
                    $(input).val(list[label])
                }
                else{
                    if(list[label] === "True") $(input).eq(0).attr("checked",true);
                    else $(input).eq(1).attr("checked",true);
                }
                //fix
                $(trs).eq(i).addClass("fixed");
                $(input).attr("disabled","disabled");
                //trigger有问题，就分开来做吧
                $(trs).eq(i).show();
                $("#modal-attribute-add-multi .multi-choose input[name="+label+"]").attr("checked",true);
            }
        }
    });

    $('#modal-attribute-add-multi').on('shown', function () {
        var trs = $("#modal-attribute-add-multi .multi-input tr");
        var height = $("#modal-attribute-add-multi .modal-body").height();
        $("#modal-attribute-add-multi .modal-body").css("maxHeight",height+36*trs.length);
    })

    $("#attribute-add").live("click", function(){
        var type = $(this).parent().parent().parent().children(".modal-body").children(".btn-group").children("button").text();
        type = chToEn[type];
        if(type === undefined) return alert("Fail! Please select a element first.");
        switch(type){
            case 'ordering': case 'uniqueness':case 'readOnly':case 'union':case'composite':
                var attributeElemValue = $(this).parent().parent().parent().children(".modal-body").children(".control-sub").find("input[type='radio']:checked").val();
                if(attributeElemValue === undefined) return alert("Can't be void");
                break;
            default:
                var attributeElemValue = $(this).parent().parent().parent().children(".modal-body").children("input[type='text']").val();
                if(attributeElemValue.replace( /^[" "|"　"]*/, "") === '') return alert("Can't be void");//去除所有均为空的情况
                break;
        }
        if(checkExist(null,enToCh[type],attributeElemValue)) {return;}
        if(type === "multiplicity"){
            attributeElemValue = multiTransform.changeToShow(attributeElemValue);
        }
        statusArray['attributeElem'] = {
            type : type,
            id : attributeElemValue
        };
        var elem = statusArray['attributeElem'];

        $.ajax({
            url: '/post/data/icd-element',
            type: 'post',
            data: {
                statusArray:statusArray,
                type : 'attributeElem',
                process : 'cite',
                data: {
                    new : elem
                }
            },
            dataType: 'json',
            async: true,
            success: function(doc){
                icd = doc.icd;
                getSourceNav();
                if(doc.count != 1) return alert("Fail! Please refresh and try it again");
                $.ajax({
                    url: '/post/html/icd-element',
                    type: 'post',
                    data: {},
                    success: function(html){
                        var root =$(this_group).children(".accordion-body").children(".accordion-inner");
                        $(root).append(html);
                        icd_element_attributeElem_show($(root).children().last(),type,icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type]);
                        summaryIntoString(this_group);
                    }
                });
            }
        });
    });

    $("#modal-attribute-add-multi .modal-body .multi-choose input[type=checkbox]").live("click",function(){
        //避免超出区域
        var height = $("#modal-attribute-add-multi .modal-body").height();
        $("#modal-attribute-add-multi .modal-body").css("maxHeight",height+36);
        //进行显示填写
        var label = $(this).parent().text();
        var trs = $("#modal-attribute-add-multi .modal-body .multi-input tr");
        for(var i=0;i<trs.length;i++){
            if(label === $(trs).eq(i).children("td").eq(0).text()){
                var tr = $(trs).eq(i);
                break;
            }
        }
        if($(this).attr("checked") === 'checked'){
            $(tr).show();
        }else{
            if($(tr).hasClass("fixed")){
                $(this).attr("checked",true);
                if(window.alert("The item cannot be removed in this way?")){
                    //$(tr).removeClass("fixed");
                    return;
                }
            }else{
                $(tr).hide();
            }

        }
    });

    $("#attribute-add-multi").live("click", function(){
        var trs = $("#modal-attribute-add-multi .multi-input tr:visible");
        var item=[];
        for(i=0;i<trs.length;i++){
            if($(trs).eq(i).hasClass("fixed")) continue;
            else{//读取label和数值
                var type = $(trs).eq(i).children("td").eq(0).text();
                if(type === undefined) return alert("Fail! Please select a element first.");
                switch(type){
                    case 'ordering': case 'uniqueness':case 'readOnly':case 'union':case'composite':
                    var attributeElemValue =$(trs).eq(i).children("td").eq(1).find("input[type='radio']:checked").val();
                    if(attributeElemValue === undefined) return alert(type+"Can't be void");
                    break;
                    default:
                        var attributeElemValue = $(trs).eq(i).children("td").eq(1).find("input[type='text']").val();
                        if(attributeElemValue.replace( /^[" "|"　"]*/, "") === '') return alert(type+"Can't be void");//去除所有均为空的情况
                        break;
                }
                if(checkExist(null,enToCh[type],attributeElemValue)) {return;}
                if(type === "multiplicity"){
                    attributeElemValue = multiTransform.changeToShow(attributeElemValue);
                }
                statusArray['attributeElem'] = {
                    type : type,
                    id : attributeElemValue
                };
                var elem = statusArray['attributeElem'];

                $.ajax({
                    url: '/post/data/icd-element',
                    type: 'post',
                    data: {
                        statusArray:statusArray,
                        type : 'attributeElem',
                        process : 'cite',
                        data: {
                            new : elem
                        }
                    },
                    dataType: 'json',
                    async: false,
                    success: function(doc){
                        icd = doc.icd;
                        getSourceNav();
                        if(doc.count != 1) return alert("Fail! Please refresh and try it again");
                        //这里有可能已经改变了
                        $.ajax({
                            url: '/post/html/icd-element',
                            type: 'post',
                            data: {},
                            async: false,
                            success: function(html){
                                var root =$(this_group).children(".accordion-body").children(".accordion-inner");
                                $(root).append(html);
                                icd_element_attributeElem_show($(root).children().last(),type,icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type]);
                                summaryIntoString(this_group);
                            }
                        });
                    }
                });
            }
        }

    });

    $('#modal-single-select').on('show', function () {
        if(m_recommendAdd){
            //通过推荐引用则不支持新建
            m_recommendAdd = false;
            $(this).find("#new-single-element").hide();
        }else{
            $(this).find("#new-single-element").show();
        }
        //数据处理
        $("#modal-single-select").children(".modal-header").html('<h5>Create '+chooseList.type+'：'+chooseList.name+'</h5>');
        var item = $("#modal-single-select").children(".modal-body");
        item.children().remove();
        switch(chooseList.typeEn){
            case 'class':
                for(var i=0;i<chooseList.array.length;i++){
                    //classModelOption(chooseList.dir,chooseList.array[i],item);
                    ModelOptionFrame(chooseList.dir,chooseList.array[i],item,'class');
                    if(i>=3) {
                        $(item).append('<div style="height:25px;text-align: center;">more...</div>');
                        break;
                    }
                }
                break;
            case 'attribute':
                for(var i=0;i<chooseList.array.length;i++){
                    ModelOptionFrame(chooseList.dir,chooseList.array[i],item,'attribute');
                    if(i>=3) {
                        $(item).append('<div style="height:25px;text-align: center;">more...</div>');
                        break;
                    }
                }
                break;
        }
        $("#modal-single-select .modal-body input[type='radio']").eq(0).attr("checked",true);
    });

    $('#modal-single-select .accordion-heading').live('click',function(){
        $(this).parent().children(".accordion-body").toggle();
    })
    $('#modal-single-select input[type="radio"]').live('click',function(){
        $(this).parent().parent().parent().children(".accordion-body").toggle();
        //radio
        $('#modal-single-select input[type="radio"]').attr('checked',false);
        $(this).attr('checked',true);
    });

    //这个是relationType中的选项
    $('.optional .accordion-heading').live('click',function(){
        $(this).parent().children(".accordion-body").toggle();
    });
    $('.optional input[type="radio"]').live('click',function(){
        //radio
        $('.optional input[type="radio"]').attr('checked',false);
        $(this).attr('checked',true);

        var itemGroup = $(this).parent().parent().parent();
        $(itemGroup).children(".accordion-body").show();//先show所以可以获取
        //从title信息获取数据
        var title = $(itemGroup).children(".accordion-heading").children(".span9").children("p").eq(1)//.text();
        $(title).children().text(" ");
        var selectedTypeTitle = splitRelationTypeTitle(title.text());
        selectedTypeTitle.id = $(itemGroup).children("input[type=hidden]").val();
        selectShow($(itemGroup).parent().parent(),selectedTypeTitle);
        //从表格信息获取数据
        var group = $(itemGroup).find(".accordion-group");
        var typeValue = getCreateRelationTypeValue(group);  //获取所有元素信息
        if(typeValue === undefined) return; //说明数据存在问题
        selectDetailShow($(itemGroup).parent().parent(),typeValue);
        $(itemGroup).children(".accordion-body").hide();//后hide
    });



    $("#new-single-element").live('click',function(){
        var data = {
            statusArray:statusArray,
            type : chooseList.typeEn,
            process : 'add',
            data: {
                new: {
                    value : chooseList.name,
                    id : 'id'
                }
            }
        };
        switch(chooseList.typeEn){
            case 'class':ajax_classAdd(data);
                break;
            case 'attribute':ajax_attributeAdd(data,this_group);
                break;
            default:break;
        }
    });

    $("#select-single-element").live('click',function(){
        var itemGroup = $('#modal-single-select input[type="radio"]:checked').parent().parent().parent();
        if(itemGroup.length != 1) return alert('Choose one before click button "select"');
        var data = {
            statusArray:statusArray,
            type : chooseList.typeEn,
            process : 'cite',
            data: {
                new: {
                    value : chooseList.name,
                    id : $(itemGroup).children("input[type=hidden]").val()
                }
            }
        };
        switch(chooseList.typeEn){
            case 'class':ajax_classAdd(data);
                break;
            case 'attribute':
                //选项的预处理
                var list = getModalNewSingleElementAttrProp($(itemGroup));
                if(list.name != undefined) {
                    data.data.new.value = list.name;
                    delete list.name;
                }

                data.data.sub = list;
                ajax_attributeAdd(data,this_group);
                break;
            default:break;
        }
    })



    $(".relationType-plus").live('click',function(){
        statusArray.relationType.id = undefined;
        $('#modal-create-relationType').modal('show');
    })

    $('#modal-create-relationType').on('show', function(){
        $.ajax({
            url: '/post/html/icd-element-relation-sub',
            type: 'post',
            async: false,
            success: function(html){
                if(m_relationTypeAddHoldOn) return m_relationTypeAddHoldOn=false ;//表示继续进行前一次修改

                $("#modal-create-relationType").children(".modal-body").children().remove();
                $("#modal-create-relationType").children(".modal-body").append(html);
                var accordionGroup = $('#modal-create-relationType').children(".modal-body").children()
                relationSubToRevise(accordionGroup); //基本内容初始化逻辑
            }
        });
    })

    $('.table-relation li').live('click',function(){
        relationSubTypeReform($(this));
        //获得一个中间量 寄存使用
        TypeAheadState.relationTYpe.type = $(this).attr('name');
        if(TypeAheadState.relationTYpe.type === 'association'){
            relationSubOptional(TypeAheadState.relationTYpe.type,
                $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().children(".optional"));
        }
    })

    $("#create-relationType").live('click',function(){
        //获得页面所有元素值
        if(m_relationTypeRevise === false){
            var group = $('#modal-create-relationType').find(".accordion-group")
            var typeValue = getCreateRelationTypeValue(group);  //获取所有元素信息
            if(typeValue === undefined) return; //说明数据存在问题
            //生成上传数据信息
            //同时更新了statusArray
            var alertStr = getCreateRelationPostValue(typeValue);
            if(alertStr != undefined) return alert(alertStr);

            var checkItem = icd.relation[statusArray.relation.id];
            if(checkItem[statusArray.relationType.type] != undefined){
                if(statusArray.relationType.type === 'association'){
                    //break;
                }
                if(checkItem[statusArray.relationType.type][statusArray.relationType.id] != undefined){
                    for(var order in statusArray.relationType.sub['order']){
                        if(checkItem[statusArray.relationType.type][statusArray.relationType.id].order[order] != undefined){
                            return alert("Fail！Already exist")
                        }
                    }
                }
            }
            $("#modal-create-relationType").modal("hide");
            var data = {
                statusArray:statusArray,
                type : 'relationType',
                process : 'multiCite',
                data: {
                    new: statusArray.relationType
                }
            };
            var itemGroup = $("#icd-relation-name").parent().children(".accordion");
            ajax_relationTypeAdd(data,itemGroup);
        }else{
            var old =  statusArray.relationType;
            var group = $('#modal-create-relationType').find(".accordion-group")
            var typeValue = getCreateRelationTypeValue(group);  //获取所有元素信息
            var alertStr = getCreateRelationPostValue(typeValue);
            if(alertStr != undefined) return alert(alertStr);
            $("#modal-create-relationType").modal("hide");
            var data = {
                statusArray:statusArray,
                type : 'relationType',
                process : 'multiRevise',
                data: {
                    new: statusArray.relationType,
                    old: old
                }
            };
            ajax_relationTypeAdd(data,m_relationTypeGroup);
            $(m_relationTypeGroup).remove();
        }
    });
    ///
    $(".btn-group.controls-small li").live("click",function(){
        var this_value = $(this).children("a").text();
        $(this).parent().parent().children("button").html(this_value+'<span class="caret"></span>');
        switch(chToEn[this_value]){
            case 'ordering': case 'uniqueness':case 'readOnly':case 'union':case'composite':
                $(this).parent().parent().parent().children("input[type='text']").hide();
                $(this).parent().parent().parent().children(".control-sub").show();
                break;
            default :
                $(this).parent().parent().parent().children("input[type='text']").show();
                $(this).parent().parent().parent().children(".control-sub").hide();
                break;
        }
    });

    $(".control-sub input[type='radio']").live('click',function(){
        $(this).parent().parent().find("input[type='radio']").attr('checked',false);
        $(this).attr('checked',true);
    });

    $(".content-detail .control-sub input[type='radio']").live('click',function(){
        var val = $(this).val();
        $(this).parent().parent().parent().children("input[type='text']").val(val);
    });

    $(".attribute-plus").live("click",function(){
        var attributes_group = $(this).parent().parent().children(".accordion").children();
        if(attributes_group.length){
            this_group = $(attributes_group).last();
        }else{
            this_group.length = 0;
        }

        $('#modal-create-attribute').modal('show');
    });

    $('#modal-create-attribute .icon-plus-sign').live("click",function(){
        $('#modal-create-attribute .multi-choose').toggle();
    });

    $('#modal-create-attribute').on("show",function(){
        $('#modal-create-attribute').find("input[type=text]").val("");
        $('#modal-create-attribute').find(".multi-choose").hide();
        $('#modal-create-attribute').find("tr").removeClass("fixed");
        $('#modal-create-attribute').find("input").removeAttr("disabled");
    });

    $("#modal-create-attribute .modal-body .multi-choose input[type=checkbox]").live("click",function(){
        //避免超出区域
        var height = $("#modal-create-attribute .modal-body").height();
        $("#modal-create-attribute .modal-body").css("maxHeight",height+36);
        //进行显示填写
        var label = $(this).parent().text();
        var trs = $("#modal-create-attribute .modal-body .multi-input tr");
        for(var i=0;i<trs.length;i++){
            if(label === $(trs).eq(i).children("td").eq(0).text()){
                var tr = $(trs).eq(i);
                break;
            }
        }
        if($(this).attr("checked") === 'checked'){
            $(tr).show();
        }else{
            if($(tr).hasClass("fixed")){
                $(this).attr("checked",true);
                if(window.alert("The item cannot be removed in this way?")){
                    //$(tr).removeClass("fixed");
                    return;
                }
            }else{
                $(tr).hide();
            }

        }
    });

    $(".recommend-attribute .icon-plus").live("click",function(){
        $(this).parent().parent().parent().parent().parent().parent().children(".accordion-body").toggle();
        this_group = $(this).parent().parent().parent().parent().parent().parent();
        $('#modal-create-attribute').modal('show');
    });

    $("#create-attribute").live("click", function(){
        var trs = $("#modal-create-attribute .multi-input tr:visible");
        var attribute={};

        for(var i=0;i<trs.length;i++){
            var type = $(trs).eq(i).children("td").eq(0).text();
            if(type === undefined) return alert("Fail! Please select a element first.");
            switch(type){
                case 'ordering': case 'uniqueness':case 'readOnly':case 'union':case'composite':
                    var attributeElemValue =$(trs).eq(i).children("td").eq(1).find("input[type='radio']:checked").val();
                    if(attributeElemValue === undefined) return alert(type+"Can't be void");
                    break;
                default:
                    var attributeElemValue = $(trs).eq(i).children("td").eq(1).find("input[type='text']").val();
                    if(attributeElemValue.replace( /^[" "|"　"]*/, "") === '') return alert(type+"Can't be void");//去除所有均为空的情况
                    break;
            }
            //if(checkExist(null,enToCh[type],attributeElemValue)) {return;}
            if(type === "multiplicity"){
                attributeElemValue = multiTransform.changeToShow(attributeElemValue);
            }
            //
            attribute[type] = attributeElemValue;
        }
        var list = $(".form-horizontal").find(".accordion").find(".accordion-inner").find("p:first");
        if(checkInIcd(list,attribute.name) === true) return;//attributeName

        var array = checkInCcd(icd['class'][statusArray.class.id]['attribute'],ccd['class'][statusArray.class.id]['attribute'],attribute.name,'attribute');
        var process,elem={};
        if(array.length === 0) {
            var data = {
                statusArray:statusArray,
                type : 'attribute',
                process : 'add',
                data: {
                    new: {
                        value : attribute.name,
                        id : 'id'
                    }
                }
            };
            delete attribute.name;
            data.data.sub = attribute;
            ajax_attributeAdd(data,this_group);
        }else{
            var attributeName = attribute.name;
            delete attribute.name;
            setChooseList(attributeName,'attribute',array,attribute);
            $('#modal-single-select').modal('show');
        }
    });

    //according-heading
    $(".recommend-attribute .icon-arrow-up").live("click",function(){
        var this_root = $(this).parent().parent().parent().parent().parent().parent();
        var html = '<div class="accordion-group">'+$(this_root).html()+'</div>';
        if($(this_root).prev().hasClass("accordion-group")){
            $(this_root).prev().before(html);
            $(this_root).remove();
        }
        icd_element_attribute_order_get();
    });

    $(".recommend-attribute .icon-arrow-down").live("click",function(){
        var this_root = $(this).parent().parent().parent().parent().parent().parent();
        var html = '<div class="accordion-group">'+$(this_root).html()+'</div>';
        if($(this_root).next().hasClass("accordion-group")){
            $(this_root).next().after(html);
            $(this_root).remove();
        }
        icd_element_attribute_order_get();
    });

    $(".recommend-element .icon-trash").live("click",function(){
        //$(this).parent().parent().parent().parent().parent().parent().children(".accordion-body").toggle();
        this_group = $(this).parent().parent().parent().parent();
        var span4 =  $(this_group).children(".row").children(".span4");
        alert_type = $(span4).children("label").text();
        alert_name = $(span4).children("p").text();
        alert_id = statusArray.attribute.id;
        $('#modal-alert-element').modal('show');
    });

    $(".icon-refresh.source").live("click",function(){
        var item={};
        item.label = $(this).parent().parent().children("label").text();
        item.value = $(this).parent().parent().children("input").val();

        var ccd_dir;
        var array;
        $("#modal-source-detail").children(".modal-body").children(".detail-info").children().remove();
        switch(item.label){
            case "类":
                ccd_dir = ccd["class"][item.value];
                for(var key in ccd_dir){
                    if(regex.test(key) === false){
                        $("#modal-source-detail").children(".modal-body").children(".detail-info").append(
                            "<label class='control-label-small controls-small'>Attribute:</label>"
                        +"<p class='controls-text-small' style='padding-left: 75px'>"+key+"</p>")
                    }
                };
                break;
            case "属性":
                ccd_dir = ccd['class'][statusArray['class']][item.value];
                for(var key in ccd_dir){
                    if(regex.test(key) === false){
                        for(var val in ccd_dir[key]){
                            if(regex.test(val) === false){
                                $("#modal-source-detail").children(".modal-body").children(".detail-info").append(
                                    "<label class='control-label-small controls-small'>"+enToCh[key]+":</label>"
                                +"<p class='controls-text-small' style='padding-left: 75px'>"+val+"</p>")
                            }
                        }
                    }
                };
                break;
            default: break;
        }
    });

    $(".icon-ok.source").live("click",function(){
        var item={};
        item.label = $(this).parent().parent().children("label").text();
        item.value = $(this).parent().parent().children("input").val();
        item.exist = false;

        generateItem(item);
        if(item.exist)  return alert("Fail! Already Exist")
        $.ajax({
            url: '/post/data/icd-element',
            type: 'post',
            data: {
                statusArray:statusArray,
                type : item.type,
                process : 'revise',
                data: {
                    old:modalSourceValue,
                    sub :item.sub,
                    new:item.value
                }
            },
            dataType: 'json',
            success: function(doc){
                icd = doc.icd;
                getSourceNav();
                if(doc.count != 1) return alert("Fail! Please refresh and try it again");
                updateSource(item.label,item.value);
            }
        });
    })


    //relationType
    /*
    $(".content-detail .table-relation .icon-trash").live('click',function(){
        var td = $(this).parent().parent().parent().parent();
        var typeValue = {
            type : $(td).children(".show").children("p").text(),
            id: $(td).parent().parent().parent().parent().parent().parent().parent().children("input[type=hidden]").val()
        }

        if(regexAssociation.test(typeValue.type)) typeValue.type = '关联关系';
        statusArray.relationType = {
            type : chToEn[typeValue.type],
            id :typeValue.id
        }

        this_group = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent();
        alert_type = "关系";
        alert_name =  $(this_group).find(".accordion-heading").find("p").text();
        $('#modal-alert-relation-type').modal('show');
    });
    */
    $(".content-detail .relationTypeEdit .icon-trash").live('click',function(){
        $(this).parent().parent().parent().parent().children(".accordion-heading").trigger('click');
        var td = $(this).parent().parent().parent().parent().children(".accordion-body").find(".basic").children("tr").children("td").eq(1);
        var typeValue = {
            type : $(td).children(".show").children("p").text(),
            id: $(td).parent().parent().parent().parent().parent().parent().parent().children("input[type=hidden]").val()
        }

        if(regexAssociation.test(typeValue.type)) typeValue.type = 'association';
        statusArray.relationType = {
            type : chToEn[typeValue.type],
            id :typeValue.id
        }

        //this_group = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent();
        this_group = $(this).parent().parent().parent().parent();
        alert_type = "Relation";
        alert_name =  $(this_group).find(".accordion-heading").find("p").text();
        $('#modal-alert-relation-type').modal('show');
    });
    /*
    $(".content-detail .table-relation .icon-edit").live('click',function(){
        var accordionGroup = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent();

        var typeDefault = getCreateRelationTypeValue(accordionGroup)
        if(typeDefault === undefined) return; //说明数据存在问题
        var alertStr = getCreateRelationPostValue(typeDefault);
        if(alertStr != undefined) return alert(alertStr);
        //alertStr 就是poster
        m_relationTypeAddHoldOn = true;
        m_relationTypeRevise = true
        m_relationTypeGroup = accordionGroup;
        $('#modal-create-relationType').modal('show');
        relationTypeRevise(statusArray.relationType)
    });
    */
    $(".content-detail .relationTypeEdit .icon-edit").live('click',function(){
        var accordionGroup = $(this).parent().parent().parent().parent();
        $(accordionGroup).children(".accordion-heading").trigger('click');

        var typeDefault = getCreateRelationTypeValue(accordionGroup)
        if(typeDefault === undefined) return; //说明数据存在问题
        var alertStr = getCreateRelationPostValue(typeDefault);
        if(alertStr != undefined) return alert(alertStr);
        //alertStr 就是poster
        m_relationTypeAddHoldOn = true;
        m_relationTypeRevise = true
        m_relationTypeGroup = accordionGroup;
        $('#modal-create-relationType').modal('show');
        relationTypeRevise(statusArray.relationType)
    });

    $("#modal-create-relationType .table-relation input[type='radio']").live('click',function(){
        $(this).parent().parent().find("input[type='radio']").attr('checked',false);
        $(this).attr('checked',true);
    });

    $("#modal-create-relationType .icon-plus-sign").live('click',function(){
        m_relationTypeAddHoldOn = true;
        //进行时要check当前的状态
        $("#modal-create-relationType").modal('toggle');
        $("#modal-relationType-add").modal('show');
    });

    $("#modal-relationType-add").on('show', function(){
        var controls = $("#modal-relationType-add").children(".modal-body").children(".control-group").children(".controls");
        $(controls).children().remove();
        //寻找一下
        //var hiddenTr = $("#modal-create-relationType").find(".additional").children("tr:hidden");
        var hiddenTr = $("#modal-create-relationType").find(".additional").eq(0).children("tr:hidden");
        for(var i=0;i<hiddenTr.length;i++){
           var title = $(hiddenTr).eq(i).children("td").eq(0).text();
            if(i%3 === 0) $(controls).append("<div></div>");
            $(controls).append(modalRelationTypeAdd.checkbox(chToEn[title],title));
        }
        $(controls).append(modalRelationTypeAdd.note());
    });

    $("#relationType-add").live('click',function(){
        //添加逻辑改为hide和show
        var checkedItem = $("#modal-relationType-add").find("input[type=checkbox]:checked");
        var checkedList = {};
        for(var i=0;i<checkedItem.length;i++){
            var val = $(checkedItem).eq(i).val();
            checkedList[val] = 1;
        }

        var hiddenTr = $("#modal-create-relationType").find(".additional").eq(0).children("tr:hidden");
        for(var i=0;i<hiddenTr.length;i++){
            var title = $(hiddenTr).eq(i).children("td").eq(0).text();
            if(checkedList[chToEn[title]] != undefined){
                $(hiddenTr).eq(i).show();
                $(hiddenTr).eq(i).find(".show").hide();
                $(hiddenTr).eq(i).find(".control-sub").show();
            }
        }

        $("#modal-create-relationType").modal('show');
    });

    $("tr .icon-minus").live("click",function(){
        $(this).parent().parent().parent().parent().hide();
    })

    $("#create-relationType-add-cancel").live('click',function(){
        $("#modal-create-relationType").modal('show');
    })

    $('#modal-alert-relation-type').on('show', function () {
        $("#modal-alert-relation-type").children(".modal-body").children("h5").text("Delete  "+alert_type+" : "+alert_name+"?");
    });

    $("#modal-create-relationType .icon-resize-horizontal").live("click",function(){
        var tr = $(this).parent().parent().parent().parent().parent();
        relationNameExchange(tr);
    })

    $(".content-detail legend .help-inline li").live("click",function(){
        $(".nav-classdiagram li.active .icon-remove-sign-right").trigger("click");
    })


    generateItem = function(item){
        switch(item.label){
            case "类":
                item.type = 'class';
                item.sub = icd['class'][statusArray['class']];
                if(icd['class'][item.value] != undefined) item.exist=true;
                break;
            case "属性":
                item.type = 'attribute';
                item.sub = icd['class'][statusArray['class']][statusArray['attribute']];
                if(icd['class'][statusArray['class']][item.value] != undefined) item.exist=true;
                break;
            default: break;
        }
    }
    updateSource = function(label,value){
        switch(label){
            case "类":
                $(".bs-docs-sidenav .active").attr('name',value);
                $(".bs-docs-sidenav .active").trigger('click');
                break;
            case "属性":
                $(recommenditem).children("input[type='hidden']").val(value);
                $(recommenditem).find(".recommend-attribute").trigger('click');
                break;
            default: break;
        }
    }
});




