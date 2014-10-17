var recommenditem;
var modalSourceLabel;
var modalSourceValue;
var recommendLength = 4;

recommend = function(label,name){
    $.ajax({
        url: '/post/data/ccd',
        type: 'post',
        data: {id:icd.ccd_id},
        dataType: 'json',
        async: true,
        success: function(doc){
            ccd = doc.ccd;
            var root = $("#recommend").children(".form-horizontal");
            recommendInit($(root));
            //recommendGetSource(root,label,name);
            recommendGetName(root,label,name);
            recommendGetLateral(root,label,name);
            recommendGetSub(root,label,name);
        }
    });
}

recommendInit = function(root){
    $(root).children().remove();
    $(root).append("<div class='recommendTitle'></div>"
        +"<div class='recommendSource'></div>"
        +"<div class='recommendName'></div>"
        +"<div class='recommendLateral'></div>"
        +"<div class='recommendSub'></div>");
    $(root).children(".recommendTitle").append('<p style="margin-top: 10px;text-align: center;font-weight: bold;font-size: 21px">推荐信息</p>')
    /*
     $(root).children(".recommendTitle").append('<hr style="margin: 0 0 5px 0;"/>');
     $(root).children(".recommendTitle").append('<label style="margin-left:-5px;height:25px;text-align: center;background-color: #0088cc;color:#ffffff">'+label+name+'</label>');
     $(root).children(".recommendTitle").append('<hr style="margin: 0 0 5px 0;"/>');
     $(root).children(".recommendTitle").append('<div><h6 style="display: inline">数据源信息:</h6>'+
     '<i class="icon-question-sign pull-right" style="margin-right: 32px;margin-top: 4px" title="帮助"></i></div>')
     $(root).children(".recommendTitle").append(
     '<p class="help-inline" style="width:100px;text-align: right">bird</p>'+
     '<div class="help-inline"><i class="icon-arrow-right" title="引用关系"></i></div>'+
     '<p class="help-inline"  style="width:100px;text-align: left">bird</p>');
     //*/
};

recommendGetSource = function(root,label,name){
    //点击显示正常，但是配合处理逻辑需要进行重写
    var str1,str2;
    switch(label){
        case '类':
        case '类名':
            str1 = "类";
            str2 = statusArray['class'];
            break;
        case '属性':
        case '名称':
            str1 = "属性";
            str2 =  statusArray['attribute'];
            break;
        case '关系':
            str1 = '关系';
            str2 =  statusArray['relation'];
            break;
        default: return;
    }
    $(root).children(".recommendSource").append('<hr style="margin: 0 0 5px 0;"/>');
    $(root).children(".recommendSource").append("<div><h6>源数据信息:</h6></div>")
    $(root).children(".recommendSource").append('<div class="row"><p class="span3">'+str1+': '+str2.value+'</p>' +
        '<input class="label" type="hidden" name='+str1+' value= '+str2.value+' >' +
        '<span class="add-on remove-input" style="margin-left:-2px">' +
        '<i class="icon-zoom-in" title="显示详细"></i></span>' +
        '<span class="add-on remove-input" style="padding-left:2px">' +
        '<i class="icon-remove" title="显示详细"></i></span>' +
        '</div>');

}

//本元素值推荐
recommendGetName = function(root,label,name){
    var dir={};
    //var title="推荐";
    switch(label){
        case '类':
        case '类名':
            //Name Reform
            dir.icd = icd['class'][statusArray.class.id]['name'];
            dir.ccd = ccd['class'][statusArray.class.id]['name'];
            label = "类名";
            break;
        case '属性':
        case '名称':
            //Name Reform
            dir.icd = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id]['name'];
            dir.ccd = ccd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id]['name'];
            label = "属性名";
            break;
        case "类型": case "多重性": case "可见性": case "默认值": case "属性性质": case "约束":
            dir.icd = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][chToEn[label]];
            dir.ccd  = ccd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][chToEn[label]];
            break;
        case '关系':
            //Name Reform
            //不存在，因为其名称是根据Class进行挑选的
            return;
            break;
        case "关系类型"://这边未执行因为数据类型过大的问题
            dir.icd = icd['relation'][statusArray.relation.id]['relationType'][statusArray.relationType.id]['name'];
            dir.ccd = ccd['relation'][statusArray.relation.id]['relationType'][statusArray.relationType.id]['name'];
            return;
            break;
        default: return;
    }
    var item = getSource(dir);

    var length = recommendLength<item.length ? recommendLength:item.length;
    $(root).children(".recommendName").append('<hr style="margin: 0 0 5px 0;"/>');
    //mark_label
    //$(root).children(".recommendName").append("<div><h6>本元素值推荐:</h6></div>");
    $(root).children(".recommendName").append("<div><h6>相关"+label+"推荐:</h6></div>");
    for(var i=0;i<length;i++){
        var name = item[i];
        $(root).children(".recommendName").append('<div class="row"><p class="span3">'+label+': '+name+'</p>' +
            '<input type="hidden" name='+label+' value='+name+' >' +
            '<span class="add-on remove-input" style="padding-left:0px"><i class="icon-retweet" title="替换"></i></span></div>');
    }
}

//同层相关元素推荐
recommendGetLateral = function(root,label,name){
    var dir={};
    var item=[];
    switch(label){
        case '类':
        case '类名':
            dir.icd = icd['class'];
            dir.ccd = ccd['class'];
            //item = getSource(dir);
            item = getName(dir);
            label = "类";
            break;
        case '属性':
        case '名称':
            dir.icd = icd['class'][statusArray.class.id]['attribute'];
            dir.ccd = ccd['class'][statusArray.class.id]['attribute'];
            //item = getSource(dir);
            item = getName(dir);
            label = "属性"
            break;
        case "类型": case "多重性": case "可见性": case "默认值": case "属性性质": case "约束":
            dir.icd = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id];
            dir.ccd = ccd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id];
            item = getSource(dir);
            label = "属性元素";
            break;
        case '关系':
            dir.icd = icd['relation'];
            dir.ccd = ccd['relation'];

            var tmp = getName(dir);
            for(var i=0;i<tmp.length;i++){
                tmp[i] = getShowName(tmp[i].split("-"));
            }//需要在sourceList里面

            var permitList = {};
            for(var i=0;i<source_nav.length;i++){permitList[source_nav[i]] = 1;}
            for(var i=0;i<tmp.length;i++){
                tmp[i] = tmp[i].split("-");
                if(permitList[tmp[i][0]] != undefined){
                    if(permitList[tmp[i][1]] != undefined){
                        item.push(tmp[i][0]+"-"+tmp[i][1]);
                    }
                }
            }
            break;
        case "关系类型":
            dir.icd  = icd['relation'][statusArray.relation.id];
            dir.ccd  = ccd['relation'][statusArray.relation.id];
            item = getRelationType(dir);
        default: return;
    }
    //显示ID方式
    var length = recommendLength<item.length ? recommendLength:item.length;
    $(root).children(".recommendLateral").append('<hr style="margin: 0 0 5px 0;"/>');
    //$(root).children(".recommendLateral").append("<div><h6>相关元素推荐:</h6></div>");
    $(root).children(".recommendLateral").append("<div><h6>相关"+label+"推荐:</h6></div>");
    for(var i=0;i<length;i++){
        var name = item[i];
        if(label === "属性元素") name = enToCh[name];
        if(label === "类型关系") {name = enToCh[item[i].type];}
        $(root).children(".recommendLateral").append('<div class="row"><p class="span3">'+label+': '+name+'</p><input type="hidden" name='+label+' value='+name+' ><span class="add-on remove-input" style="padding-left:0px"><i class="icon-plus-sign" title="添加"></i></span></div>');
        if(label === "类型关系") {
            $(root).children(".recommendLateral").append('<div class="row"><p  class="span3">'+item[i].title+'</p></div>');
            var img = $(root).find("img");
            var imgScr = $(img).attr("src");
            imgScr = imgScr.split("-");
            $(img).attr("src",imgScr[0]+"-1.png");
        }
    }
}

//子层元素推荐
recommendGetSub = function(root,label,name){
    var dir={};
    var item=[];
    switch(label){
        case '类':
        case '类名':
            dir.icd  = icd['class'][statusArray.class.id]['attribute'];
            dir.ccd  = ccd['class'][statusArray.class.id]['attribute'];
            item = getName(dir);
            label = "属性";
            break;
        case '属性':
        case '名称':
            dir.icd  = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id];
            dir.ccd  = ccd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id];
            item = getSource(dir);
            label = "属性元素";
            break;
        case "类型": case "多重性": case "可见性": case "默认值": case "属性性质": case "约束":
            return;
            break;
        case '关系':
            //return;//因为实在没法处理....
            //这边的关系推荐方法还需要另行考虑
            dir.icd  = icd['relation'][statusArray.relation.id];
            dir.ccd  = ccd['relation'][statusArray.relation.id];
            item = getRelationType(dir);
            label = "类型关系";
            break;
        case "关系类型":
            //存在一些问题
            return;
            break;
        default: return;
    }
    var length = recommendLength<item.length ? recommendLength:item.length;
    $(root).children(".recommendSub").append('<hr style="margin: 0 0 5px 0;"/>');
    //$(root).children(".recommendSub").append("<div><h6>子信息推荐:</h6></div>");
    $(root).children(".recommendSub").append("<div><h6>相关"+label+"推荐:</h6></div>");
    for(var i=0;i<length;i++){
        var name = item[i];
        if(label === "属性元素") name = enToCh[name];
        if(label === "类型关系") {name = enToCh[item[i].type];}
        $(root).children(".recommendSub").append('<div class="row"><p class="span3">'+label+': '+name+'</p>' +
            '<input type="hidden" name='+label+' value='+name+' ><span class="add-on remove-input" style="padding-left:0px">' +
            '<i class="icon-plus-sign" title="添加"></i></span></div>');

        if(label === "类型关系") {
            $(root).children(".recommendSub").append('<div class="row"><p  class="span3">'+item[i].title+'</p></div>');
            var img = $(root).find("img");
            var imgScr = $(img).attr("src");
            imgScr = imgScr.split("-");
            $(img).attr("src",imgScr[0]+"-1.png");
        }
    }
}

//recommend
$(function(){
    //点击元素
    $(".row.recommend-element").live("click",function(){
        //添加active
        recommenditem = $(this).parent().parent().parent().parent();
        if(!$(recommenditem).hasClass("accordion-group")) recommenditem = null;
        contentDetailActive(recommenditem,this,"recommend-attribute");

        var label = $(this).children(".span4").children("label").text();
        var name = $(this).children(".span4").children("p").text();
        switch(label){
            case "名称": case "类型": case "多重性": case "可见性": case "默认值": case "属性性质": case "约束":
            saAttribute($(this).parent().parent().parent().parent().children("input[type='hidden']").val());
            //statusArray['attribute']["id"] = $(this).parent().parent().parent().parent().children("input[type='hidden']").val();
            //statusArray['attribute']["value"]= icd['class'][statusArray.class.id]['attribute'][statusArray['attribute']["id"]]["_value"];
            break;
        }
        if(label === "名称")  label="属性";
        recommend(label,name);
    });

    $(".row.recommend-attribute").live("click",function(){
        recommenditem = $(this).parent().parent().parent();
        contentDetailActive(recommenditem,$(recommenditem).find(".accordion-inner").children().first().children(".recommend-element"),"recommend-attribute")

        var label = $(this).children(".span4").children("label").text();
        label="属性";
        var name = $(this).parent().parent().parent().children(".accordion-body").children().children().eq(0).children(".row").children(".span4").children("p").text();
        saAttribute($(this).parent().parent().parent().children("input[type='hidden']").val());
        //statusArray['attribute']["id"] =  $(this).parent().parent().parent().children("input[type='hidden']").val();
        //statusArray['attribute']["value"]= icd['class'][statusArray.class.id]['attribute'][statusArray['attribute']["id"]]["_value"];s
        recommend(label,name);
    });

    $(".row.recommend-relation").live("click",function(){
        //添加active
        recommenditem = $(this).parent().parent().parent().parent();
        var label = "关系";
        var name = $(this).children(".span4").children("p").text();
        recommend(label,name);
    });

    $(".row.recommend-relationType").live("click",function(){
        contentDetailActive($(this).parent(),{},"recommend-relationType");
        var label = "关系类型";
        recommend(label,name);
    });

});

//替换元素
$("#recommend .recommendSource .icon-zoom-in").live("click",function(){
    modalSourceLabel= $(this).parent().parent().children("input[type='hidden']").attr('name');
    modalSourceValue= $(this).parent().parent().children("input[type='hidden']").val();

    $('#modal-source-detail').modal('show');
});

$('#modal-source-detail').on('show', function () {
    $("#modal-source-detail").children(".modal-header").children("h5").text("源数据[详细信息]");
    $("#modal-source-detail").children(".modal-body").children("label").text(modalSourceLabel);
    $("#modal-source-detail").children(".modal-body").children("input").val(modalSourceValue);

    $("#modal-source-detail").children(".modal-body").find(".icon-refresh").trigger("click");
});

$("#recommend .recommendName .icon-retweet").live("click",function(){
    var label= $(this).parent().parent().children("input[type='hidden']").attr('name');
    var value= $(this).parent().parent().children("input[type='hidden']").val();

    switch(label){
        case '类名':
            var item = $("#icd-class-name").find("input[type='text']");
            $(item).val(value);
            $(item).parent().find(".icd-element-input-class-submit").trigger('click');
            break;
        case "属性名": case "名称": case "类型": case "多重性": case "可见性": case "默认值": case "属性性质": case "约束":
            if(label === "属性名") label = "名称";
            var item = $(".content-detail .accordion-group.active").find(".control-sub label");
            var length=$(item).length
            for(var n= 0;n<length;n++){
                if($(item).eq(n).text() === label){
                    $(item).eq(n).parent().find("input[type='text']").val(value);
                    $(item).eq(n).parent().find(".icd-element-input-submit").trigger('click');
                    break;
                }
            }
            break;
        default: return;
    }
});
$("#recommend .recommendLateral .icon-plus-sign").live("click",function(){
    var label= $(this).parent().parent().children("input[type='hidden']").attr('name');
    var value= $(this).parent().parent().children("input[type='hidden']").val();

    switch(label){
        case '类':
            m_recommendAdd = true;
            $("#modal-create-class").modal('show');
            $("#modal-create-class").children(".modal-body").children("input").val(value);
            $("#create-class").click();
            break;
        case "属性":
            m_recommendAdd = true;
            $("#modal-create-attribute").modal('show');
            $("#modal-create-attribute").children(".modal-body").children("input").val(value);
            $("#create-attribute").click();
            break;
        case "属性元素":
            m_recommendAdd = true;
            $("#modal-attribute-add").modal('show');
            $("#modal-attribute-add").children(".modal-body").find("button").text(value);
        default: return;
    }
    return;
});
$("#recommend .recommendSub .icon-plus-sign").live("click",function(){
    var label= $(this).parent().parent().children("input[type='hidden']").attr('name');
    var value= $(this).parent().parent().children("input[type='hidden']").val();

    switch(label){
        case '类':
            m_recommendAdd = true;
            $("#modal-create-class").modal('show');
            $("#modal-create-class").children(".modal-body").children("input").val(value);
            $("#create-class").click();
            break;
        case "属性":
            m_recommendAdd = true;
            $("#modal-create-attribute").modal('show');
            $("#modal-create-attribute").children(".modal-body").children("input").val(value);
            $("#create-attribute").click();
            break;
        case "属性元素":
            m_recommendAdd = true;
            $("#modal-attribute-add").modal('show');
            $("#modal-attribute-add").children(".modal-body").find("button").text(value);
        default: return;
    }
    return;
});

generateDir = function(label){
    var dir={};
    switch(label){
        case '类':
            dir.type = 'class';
            break;
        case '类名':
            break;
        case '属性':
            dir.type = 'attribute'
        case '名称':
            break;
        case "属性元素":
            dir.type = 'attributeElem'
            break;
        case '关系':
            dir.type = 'relation';
            break;
    }
    return dir;
}

getSubItem = function(label){
    switch(label){
        case '属性':
            recommenditem = $(".span6-compact.content-detail .accordion").children().last();
            break;
        default :break;
    }
}

addElement = function(type,value){
    switch(type){
        case 'class':
            var header_class = $(".nav.nav-list.bs-docs-sidenav").children(".nav-header-relation");
            var html =  '<li name='+value+' class="class"><a href="javascript:;"><i class="icon-chevron-right "></i><i class="icon-remove-sign-right" title="点击叉号删除" style="display: none"></i>'+ value +'</a></li>';
            $(header_class).before(html);
            $(header_class).prev().trigger('click');
            break;
        case 'relation':
            var html = '<li name='+value+' class="relation"><a href="javascript:;"><i class="icon-chevron-right "></i><i class="icon-remove-sign-right" title="点击叉号删除" style="display: none"></i>'+ value +'</a></li>';
            $(".nav.nav-list.bs-docs-sidenav").append(html);
            $(".nav.nav-list.bs-docs-sidenav").children().trigger('click');
            break;
        case 'attribute':
            $.ajax({
                url: '/post/html/icd-element-attribute',
                type: 'post',
                data: {},
                success: function(html){
                    $(recommenditem).after(html);
                    icd_element_attribute_show($(recommenditem).next(),value,icd['class'][statusArray['class']][value]);
                }
            });
            break;
        case 'attributeElem':
            $.ajax({
                url: '/post/html/icd-element',
                type: 'post',
                data: {},
                success: function(html)
                {
                    var root =$(recommenditem).children(".accordion-body").children(".accordion-inner");
                    $(root).append(html);
                    icd_element_attributeElem_show($(root).children().last(),value,icd['class'][statusArray['class']][statusArray['attribute']][statusArray['attributeElem']]);
                    $(root).children().last().trigger('click');
                }
            });
            break;
    }
}

//search
getSource = function(dir){
    //可以加一个原始项orig
    var array=[];
    var msg=[];
    for(var value in dir.ccd){
        if(regex.test(value) === false){
            if(dir.icd === null){
                array.push([value,dir.ccd[value]._nor]);
            }
            else if(dir.icd[value] === undefined){
                array.push([value,dir.ccd[value]._nor]);
            }
        }
    };
    array.sort(function(a,b){return (b[1] - a[1]);});
    for(var i=0;i<array.length;i++){
        msg.push(array[i][0]);
    }
    return msg;
}

getName = function(dir){
    //可以加一个原始项orig
    var array=[];
    var repeatKeyList = {};
    var repeatValueList = {};
    var msg=[];

    for(var key in dir.icd){
        repeatKeyList[key] = 1;
        for(var value in dir.icd[key]['name']){
            if(regex.test(value) === false){
                //避免同名元素
                repeatValueList[value] = 1;
            }
        }
    }
    for(var key in dir.ccd){
        if(repeatKeyList[key] != undefined) continue;//如果已经被引用过了
        for(var value in dir.ccd[key]['name']){
            if(regex.test(value) === false){
                array.push([value,dir.ccd[key]['name'][value]._nor]);
            }
        }
    }
    array.sort(function(a,b){return (b[1] - a[1]);});
    for(var i=0;i<array.length;i++){
        if(repeatKeyList[array[i][0]] === undefined){
            repeatKeyList[array[i][0]] = 1;
            msg.push(array[i][0]);
        }
    }
    return msg;
}

getRelationType = function(dir){
    //判断哪些元素可以存在。
    var array=[];
    var msg=[];
    for(var key in dir.ccd){
        for(var id in dir.ccd[key]){
            if(dir.icd[key] === undefined){
                array.push([{type:key,id:id},dir.ccd[key][id]["_nor"]]);
            }
            else if(dir.icd[key][id] === undefined){
                array.push([{type:key,id:id},dir.ccd[key][id]["_nor"]]);
            }
        }
    }
    array.sort(function(a,b){return (b[1] - a[1]);});

    for(var i=0;i<array.length;i++){
        //msg.push(array[i][0]);
        //获取最大元素
        var relationElem = {
            type: array[i][0].type,
            id:array[i][0].id
        }
        var getShowValue = generateMaxRelationType(dir.ccd[relationElem.type],relationElem);
        msg.push({type:relationElem.type,id:relationElem.id,title:getShowValue.title})
    }
    return msg;
}

saAttribute = function(attributeid){
    //好像没用了。。因为根本就没有_value这个东西
    statusArray['attribute']["id"] = attributeid;
    var attributeNameDir = icd['class'][statusArray.class.id]['attribute'][attributeid]["name"];
    for(var key in attributeNameDir){
        statusArray['attribute']["value"] = attributeNameDir[key]["_value"];
    }
}