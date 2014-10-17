var icd;
var ccd;
var statusArray = {
    _id :{},
    ccd_id : {},
    cd:{},
    description:{},
    class:{},
    attribute:{},
    attributeElem:{},
    relation:{},
    relationType:{}
};
var source_nav = [];
/*
var enToCh ={
    "attribute": "属性",
    "name": "名称",
    "type": "类型",
    "multiplicity":"多重性",
    "visibility":"可见性",
    "default":"默认值",
    "constraint":"约束",

    'ordering':'顺序性',
    'uniqueness':"唯一性",
    'readOnly':"只读性",
    'union':"集合",
    'subsets':"子集",
    'redefines':"重定义",
    'composite':"组成",

    'generalization':'泛化关系',
    'association':'关联关系',
    'composition':'组成关系',
    'aggregation':'聚合关系'
}
var chToEn ={
    "属性":   "attribute",
    "名称":   "name",
    //"名称":   "attributeName",

    '顺序性':'ordering',
    "唯一性":'uniqueness',
    "只读性":'readOnly',
    "集合":'union',
    "子集":'subsets',
    "重定义":'redefines',
    "组成":'composite',

    "类型":   "type",
    "多重性": "multiplicity",
    "可见性": "visibility",
    "默认值": "default",
    "约束"   :"constraint",
    '泛化关系':'generalization',
    '关联关系':'association',
    '组成关系':'composition',
    '聚合关系':'aggregation'
}
*/
var enToCh ={
    "attribute": "attribute",
    "name": "name",
    "type": "type",
    "multiplicity":"multiplicity",
    "visibility":"visibility",
    "default":"default",
    "constraint":"constraint",

    'ordering':'ordering',
    'uniqueness':'uniqueness',
    'readOnly':'readOnly',
    'union':'union',
    'subsets':'subsets',
    'redefines':'redefines',
    'composite':'composite',

    'generalization':'generalization',
    'association':'association',
    'composition':'composition',
    'aggregation':'aggregation'
}
var chToEn ={
    "attribute": "attribute",
    "name": "name",
    "type": "type",
    "multiplicity":"multiplicity",
    "visibility":"visibility",
    "default":"default",
    "constraint":"constraint",

    'ordering':'ordering',
    'uniqueness':'uniqueness',
    'readOnly':'readOnly',
    'union':'union',
    'subsets':'subsets',
    'redefines':'redefines',
    'composite':'composite',

    'generalization':'generalization',
    'association':'association',
    'composition':'composition',
    'aggregation':'aggregation'
}

var chooseList = {
    array : {},
    dir : {}
}
var regex = /^_/;
//var regexAssociation = /^关联关系/;
var regexAssociation = /^association/;
var m_attributeElem = ['type','multiplicity','visibility','default','constraint','ordering','uniqueness','readOnly','union','subsets','redefines','composite'];
var m_relationTypeSub1 = ['order','name'];
var m_relationTypeSub2 = ['role1','role2','multiplicity1','multiplicity2'];
var m_relationTypeAdditional = ['ordering','uniqueness','readOnly','union','subsets','redefines','composite'];

var m_relationTypeIcon = {
    'generalization':'<img src="/img/icons/2-3.png">',
    'composition'   :'<img src="/img/icons/3-3.png">',
    'aggregation'   :'<img src="/img/icons/4-3.png">',
    'association'   :'<img src="/img/icons/1-3.png">'
}

var m_attribute = {
    type : ['byte','char','short','int','long','float','double','boolean','string','vector','date','enum'],
    visibility :['private','protected','public','package'],
    property : ['readOnly','union','subsets','redefines','composite']
}

var m_recommendAdd = false;
var m_relationTypeAddHoldOn = false;
var m_relationTypeRevise = false;
var m_relationTypeGroup;

icd_nav_classdiagram_show = function(doc){
    icd = doc;
    statusArray["_id"] = doc["_id"];
    statusArray["ccd_id"] = doc["ccd_id"];
    //source_nav = [];

    var that = $(".nav.nav-list.bs-docs-sidenav");
    var header_cd = $(that).children(".nav-header-class");
    var header_class = $(that).children(".nav-header-relation");
    var header_relation = $(that);
    //在插入前可以根据已有元素进行排序
    for(var a in doc.cd){
        var html = getHtml.navLi(a,'cd',a);
        $(header_cd).before(html);
        statusArray["cd"] = {value : a};
    };

    var classArray = [];
    for(var b in doc.class){
        //Name Reform
        //for(var b_n in doc.class[b].className){
        for(var b_n in doc.class[b].name){
            classArray.push([b,b_n]);
        }
    };
    classArray.sort(function(a,b){return(a[1].toLowerCase().localeCompare(b[1].toLowerCase()))}); //从小到大
    /*
    classArray.sort(function(a,b){
        if(a[1].localeCompare(b[1])>0) return 1;
        else return 0;
    }); //从小到大 */
    for(var i=0;i<classArray.length;i++){
        var html = getHtml.navLi(classArray[i][0],'class',classArray[i][1]);
        $(header_class).before(html);
    }

    var relationArray = [];
    for(var c in doc.relation){
        for(var relationName in doc.relation[c].name) break;
        relationName = relationName.split("-");
        var showName=getShowName(relationName);
        relationArray.push([c,showName]);
    };
    relationArray.sort(function(a,b){return(a[1].toLowerCase().localeCompare(b[1].toLowerCase()))}); //从小到大
    for(var i=0;i<relationArray.length;i++){
        var html = getHtml.navLi(relationArray[i][0],'relation',relationArray[i][1]);
        $(header_relation).append(html);
    }
    getSourceNav();
    $(header_cd).prev().trigger("click");
}

getShowName = function(relationName){
    relationName.sort(function(a,b){return (a >= b);});
    return relationName[0]+'-'+relationName[1];
}

getSourceNav = function(){
    source_nav = [];
    for(var a in icd.cd){
        source_nav.push(a);
    };
    for(var b in icd.class){
        //Name Reform
        //for(var b_n in icd.class[b].className){
        for(var b_n in icd.class[b].name){
            source_nav.push(b_n);
        }
    };
    for(var c in icd.relation){
        //for(var c_n in icd.relation[c].relationName){
        for(var c_n in icd.relation[c].name){
            c_n = c_n.split("-");
            c_n=getShowName(c_n);
            source_nav.push(c_n);
        }
    };
}

icd_content_show = function(type,item){
    switch(type[0]){
        case 'cd': icd_content_cd_show(item);
            break;
        case 'class':icd_content_class_show(item);
            break;
        case 'relation': icd_content_relation_show(item);
            break;
    };
}

icd_content_cd_show = function(item){
    statusArray['cd'] = {value : item.value};

    var root = $(".span6-compact.content-detail");
    var list_name = $(root).find(".recommend-element.type_cdName");
    //cdName
    $(list_name).children(".span4").children("p").text(item.value);
    $(list_name).parent().children(".control-sub").find("input[type='text']").val(item.value);

    //description
    var list_description = $(root).find(".recommend-element.type_cdDescription");
    var description = icd['cd'][item.value]['_description'];
    statusArray['description'] = {value : description};
    $(list_description).children("p").text(description);
    $(list_description).children(".controls-small").children("textarea").text(description);
}

icd_content_class_show = function(item){
    statusArray['class'] = {
        id : item.key,
        value : item.value
    };
    $("#icd-class-name").find(".recommend-element p").text(item.value);
    $("#icd-class-name").find(".control-sub input[type='text']").val(item.value);


    //
    ajax_attributeSort({
        statusArray:statusArray
        ,type : 'attributeSort'
        ,process : 'get'
    });
}

icd_element_attribute_sort = function(sortList){
    var existList = {};
    var changeNum = 0;

    var list = $("#icd-class-name").parent().children(".accordion");
    for(var i=0;i<sortList.length;i++){
        attributeID = sortList[i];
        existList[attributeID] = 1;
        $.ajax({
            url: '/post/html/icd-element-attribute',
            type: 'post',
            data: {},
            async: false,   //这样很蛋疼饿
            success: function(html){
                $(list).append(html);
                icd_element_attribute_show($(list).children().last(),attributeID,icd['class'][statusArray.class.id]["attribute"][attributeID]);
            }
        });
    }
    for(var attributeID in icd['class'][statusArray.class.id]["attribute"]){
        if(existList[attributeID] === undefined){
            existList[attributeID] = 1;
            sortList.push(attributeID);
            changeNum++;
            $.ajax({
                url: '/post/html/icd-element-attribute',
                type: 'post',
                data: {},
                async: false,   //这样很蛋疼饿
                success: function(html){
                    $(list).append(html);
                    icd_element_attribute_show($(list).children().last(),attributeID,icd['class'][statusArray.class.id]["attribute"][attributeID]);
                }
            });
        }
    }
    if(changeNum != 0){
        ajax_attributeSort({
            statusArray:statusArray
            ,type : 'attributeSort'
            ,process : 'revise'
            ,sortList : sortList
        });
    }
}

var timer=null;
icd_element_attribute_order_get = function(){
    var list = $("#icd-class-name").parent().children(".accordion").children(".accordion-group").children("input[type='hidden']");
    var sortList = [];
    for(var i=0;i<list.length;i++){
        sortList.push($(list).eq(i).val());
    }
    var ajaxData = {
        statusArray:{
            _id:statusArray._id
            ,class:{
                id: statusArray.class.id
            }
        }
        ,type : 'attributeSort'
        ,process : 'revise'
        ,sortList : sortList
    };
    timer && clearTimeout(timer);
    timer = setTimeout(function(){
        ajax_attributeSort(ajaxData);
    },1000);
}

icd_element_attribute_show = function(handle,id,dir){
    //添加Attribute和他的Name
    $(handle).children("input[type='hidden']").val(id);  //有什么用？？
    var title= $(handle).find(".accordion-inner").children().eq(0);
    //Name Reform
    //for(var attributeName in dir["attributeName"]){
    for(var attributeName in dir["name"]){
        $(title).find(".recommend-element p").text(attributeName);
        $(title).parent().find(".control-sub input[type='text']").val(attributeName);
        break;
    }

    var list = $(title).parent();
    //UML2.0显示方式
    var summary= {};
    summary["name"] = attributeName;
    for(var i=0;i<m_attributeElem.length;i++){
        type = m_attributeElem[i];
        if(dir[type]!=undefined){
            $.ajax({
                url: '/post/html/icd-element',
                type: 'post',
                data: {name:type},
                async: false,               //同步执行影响执行效率
                success: function(html){
                    $(list).append(html);
                    icd_element_attributeElem_show($(list).children().last(),type,dir[type]);
                }
            });
        }
    }
    /*
    for(var name in dir){
        //if(name != '_nor'){
        //Name Reform
        //if(regex.test(name) === false && name!="attributeName"){
        //alert("user-involved-function: "+name);
        if(regex.test(name) === false && name!="name"){
            $.ajax({
                url: '/post/html/icd-element',
                type: 'post',
                data: {name:name},
                async: false,               //同步执行影响执行效率
                success: function(html){
                    $(list).append(html);
                    icd_element_attributeElem_show($(list).children().last(),name,dir[name]);
                }
            });
        }
    }
    */
    summaryIntoString($(list).parent().parent());
}

icd_element_attributeElem_show = function(handle,item,dir){
    //中文标签
    var itemCh = enToCh[item];
    $(handle).find("label").eq(0).text(itemCh);
    $(handle).find("label").eq(1).text(itemCh);
    for(var value in dir){
        //if(regex.test(name) === false){
        itemCh = chToEn[itemCh];
        switch(itemCh){
            case 'multiplicity':
                var tmp;
                tmp = value.split("-");
                if(tmp.length === 1) {value = tmp[0]}
                else{value = tmp[0] +".."+tmp[1] }
                break;
            case 'ordering': case 'uniqueness':case 'readOnly':case 'union':case'composite':
                if(value === 'True'){
                    $(handle).find(".control-sub input[type='radio']").eq(0).attr('checked','checked');
                }else if(value == 'False'){
                    $(handle).find(".control-sub input[type='radio']").eq(1).attr('checked','checked');
                }
                $(handle).find(".controls-small.icd-element-input").children("input[type='text']").hide();
                $(handle).find(".controls-small.icd-element-input").children(".control-sub").show();
                break;
        }
        $(handle).find(".recommend-element p").text(value);
        $(handle).find(".control-sub input[type='text']").val(value);

        return value;//因为这里只有一个值
        //}
    }
}

summaryIntoString = function(that){
    //function(summary,list){
    var inner = $(that).find(".accordion-inner");
    var label = $(inner).find(".row label");
    var p=$(inner).find(".row p");

    var summary={};
    for(var i= 0;i<label.length;i++){
        summary[$(label[i]).text()] = $(p[i]).text();
    }

    var text = "";
    switch(summary[enToCh['visibility']]){
        case 'private': text +='- ';  break;
        case 'public': text +='+ ';  break;
        case 'protected': text +='# ';  break;
        case 'package': text +='~ '; break;
    };

    text += summary[enToCh['name']];
    var colon = 1;

    if(summary[enToCh['type']]!=undefined){
        if(colon>0){colon--;text += " : ";}
        text+=summary[enToCh['type']];
    }

    if(summary[enToCh['multiplicity']]!=undefined){
        if(colon>0){colon--;text += " : ";}
        text+='['+summary[enToCh['multiplicity']]+']';
    }

    var string = "";
    if(summary[enToCh['readOnly']]==="True"){
        if(string.length>0){string += ", ";}
        string+='readOnly';
    }
    if(summary[enToCh['ordering']]==="True"){
        if(string.length>0){string += ", ";}
        string+='ordered';
    }
    if(summary[enToCh['uniqueness']]==="True"){
        if(string.length>0){string += ", ";}
        string+='unique';
    }
    if(string.length>0){
        text += '{'+string+'}';
    }

    $(that).find(".accordion-heading p").text(text);
}

icd_content_relation_show = function(item){
    //Name Reform
    //for(var relationName in icd["relation"][item.key]["relationName"]){break;}
    for(var relationName in icd["relation"][item.key]["name"]){break;}
    statusArray['relation'] = {
        id : item.key,
        value : relationName    //因为顺序是不一样的
    };
    //name
    $("#icd-relation-name").find(".recommend-relation p").text(item.value);

    var relationType = ['generalization','composition','aggregation','association'];
    var relationElem = {dir : icd["relation"][item.key]};
    var list = $("#icd-relation-name").parent().children(".accordion");
    for(var i=0;i<relationType.length;i++){
        if(relationElem.dir[relationType[i]] != undefined){
            relationElem.type = relationType[i];
            for(var id in relationElem.dir[relationType[i]]){
                relationElem.id = id;
                relationElem.sub = relationElem.dir[relationType[i]][id];
                icd_content_relationType_show(list,relationElem);
            }
        }
    }
}
icd_content_relationType_show = function(list,relationElem){
    $.ajax({
        url: '/post/html/icd-element-relation-sub',
        type: 'post',
        data: {},
        async: false,   //这样很蛋疼饿
        success: function(html){
            if($(list).hasClass("accordion-group")){
                $(list).after(html);
                var item = $(list).next();
            }else{
                $(list).append(html);
                var item = $(list).children().last()
            }
            icd_element_relation_sub_reform(item);
            icd_element_relation_sub_show(item,relationElem);
        }
    });
}

icd_element_relation_sub_reform = function(handle){
    var span = $(handle).find(".span-hidden");
    //$(span).eq(0).remove();     //这个功能先犹豫一下
    $(span).children("span").hide();
    $(span).eq(0).children("span").show();

    $(handle).find(".text-center.additional").hide();
}

icd_element_relation_sub_show = function(handle,relationElem){
    //整理数据信息
    var elemValue = getRelationElemValue(relationElem);
    //进行显示
    $(handle).children("input[type=hidden]").val(elemValue.id);
    $(handle).children(".accordion-heading").find("p").html(elemValue.title);
    var trs = $(handle).children(".accordion-body").find("tbody").children("tr");
    var td;
    td = $(trs).eq(0).children("td").eq(1);
    $(td).children(".show").children("p").text(elemValue.type);
    $(td).children(".control-sub").find("button").text(elemValue.type);
    if(elemValue.type == enToCh['association']){
        if(elemValue.name != ""){
            $(td).children(".control-sub").find("input[type=text]").val(elemValue.name);
            $(td).children(".show").children("p").text(elemValue.type + " ["+elemValue.name+"] ");
        }
        $(trs).eq(1).children("td").eq(1).children(".control-sub").find("input[type=text]").val(elemValue.role1);
        $(trs).eq(1).children("td").eq(2).children(".control-sub").find("input[type=text]").val(elemValue.role2);
    }
    $(trs).eq(1).children("td").eq(1).children(".show").children("p").text(elemValue.role1);
    $(trs).eq(1).children("td").eq(2).children(".show").children("p").text(elemValue.role2);

    $(trs).eq(2).children("td").eq(1).children(".show").children("p").text(elemValue.class1);
    $(trs).eq(2).children("td").eq(2).children(".show").children("p").text(elemValue.class2);

    $(trs).eq(3).children("td").eq(1).children(".show").children("p").text(elemValue.multiplicity1);
    $(trs).eq(3).children("td").eq(2).children(".show").children("p").text(elemValue.multiplicity2);
    $(trs).eq(3).children("td").eq(1).children(".control-sub").children("input[type=text]").val(elemValue.multiplicity1);
    $(trs).eq(3).children("td").eq(2).children(".control-sub").children("input[type=text]").val(elemValue.multiplicity2);

    var additionalTrs =  $(handle).children(".accordion-body").find(".additional").children("tr:hidden");
    for(var i=0;i<additionalTrs.length;i++){
        var label = $(additionalTrs).eq(i).children("td").eq(0).text();
        if(elemValue.additional[chToEn[label]] != undefined){
            var value1 = elemValue.additional[chToEn[label]]["1"];
            var value2 = elemValue.additional[chToEn[label]]["2"];
            $(additionalTrs).eq(i).show();
            $(additionalTrs).eq(i).children("td").eq(1).children(".show").children("p").text(value1);
            $(additionalTrs).eq(i).children("td").eq(2).children(".show").children("p").text(value2);

            if(chToEn[label]==='subsets' || chToEn[label]==='redefines'){
                $(additionalTrs).eq(i).children("td").eq(1).children(".control-sub").children("input[type='text']").val(value1);
                $(additionalTrs).eq(i).children("td").eq(2).children(".control-sub").children("input[type='text']").val(value2);
            }else{
                if(value1 === 'True'){
                    $(additionalTrs).eq(i).children("td").eq(1).children(".control-sub").find("input[type='radio']").eq(0).attr('checked','checked');
                }else{
                    $(additionalTrs).eq(i).children("td").eq(1).children(".control-sub").find("input[type='radio']").eq(1).attr('checked','checked');
                }
                if(value2 === 'True'){
                    $(additionalTrs).eq(i).children("td").eq(2).children(".control-sub").find("input[type='radio']").eq(0).attr('checked','checked');
                }else{
                    $(additionalTrs).eq(i).children("td").eq(2).children(".control-sub").find("input[type='radio']").eq(1).attr('checked','checked');
                }
            }
        }
    }
    return elemValue;
}

getTypeDefault = function(type){
    var typeDefault ={};
    /*
    switch(type) {
        case 'generalization':  typeDefault = {type : '泛化关系',role1 : '父',role2 : '子',
            icon:m_relationTypeIcon.generalization};break;
        case'composition':      typeDefault = {type : '组成关系',role1 : '整体',role2 : '部分',
            icon:m_relationTypeIcon.composition};break;
        case 'aggregation':     typeDefault = {type : '聚合关系',role1 : '整体',role2 : '部分',
            icon:m_relationTypeIcon.aggregation};break;
        case 'association':     typeDefault = {type : '关联关系',role1 : '',role2 : '',
            icon:m_relationTypeIcon.association};break;
        default: break;
    } */
    switch(type) {
        case 'generalization':  typeDefault = {type : enToCh['generalization'],role1 : 'father',role2 : 'child',
            icon:m_relationTypeIcon.generalization};break;
        case'composition':      typeDefault = {type : enToCh['composition'],role1 : 'whole',role2 : 'part',
            icon:m_relationTypeIcon.composition};break;
        case 'aggregation':     typeDefault = {type : enToCh['aggregation'],role1 : 'owner',role2 : 'ownee',
            icon:m_relationTypeIcon.aggregation};break;
        case 'association':     typeDefault = {type : enToCh['association'],role1 : '',role2 : '',
            icon:m_relationTypeIcon.association};break;
        default: break;
    }
    typeDefault.multiplicity1='';
    typeDefault.multiplicity2='';
    typeDefault.name = '&default';

    return  typeDefault;
}

//获取当前页面值,并整理成显示数据
getRelationElemValue = function(relationElem){
    var typeDefault = getTypeDefault(relationElem.type);
    var elemValue = {
        type : typeDefault.type,
        id : relationElem.id
    };
    for(var name in relationElem.sub.name){
        elemValue.name = changeToShowVal(name);
    }
    for(var order in relationElem.sub.order){
        order = parseInt(order);
        var name = statusArray['relation'].value.split("-");
        elemValue.class1 = name[order];
        elemValue.class2 = name[(order+1)%2];
        break;
    }
    for(var type in relationElem.sub.order[order]){
        for(var value in relationElem.sub.order[order][type]){
            if(changeToShowVal(value) === '') elemValue[type] = typeDefault[type];
            else elemValue[type] = value;
            break;
        }
    }
    //multiplicity
    var tmp;
    tmp = elemValue.multiplicity1.split("-");
    if(tmp.length === 1) {elemValue.multiplicity1 = tmp[0]}
    else{elemValue.multiplicity1 = tmp[0] +".."+tmp[1] }

    tmp = elemValue.multiplicity2.split("-");
    if(tmp.length === 1) {elemValue.multiplicity2 = tmp[0]}
    else{elemValue.multiplicity2 = tmp[0] +".."+tmp[1] }

    //生成title
    var titleName = '',titleMultiplicity1 = '',titleMultiplicity2 = '';
    if(elemValue.name != '')            titleName = elemValue.name+": ";
    if(elemValue.multiplicity1 != '')   titleMultiplicity1 = '['+elemValue.multiplicity1+']';
    if(elemValue.multiplicity2 != '')   titleMultiplicity2 = '['+elemValue.multiplicity2+']';

    elemValue.title = titleName + elemValue.class1 +' '+ titleMultiplicity1 + typeDefault.icon + titleMultiplicity2 +' '+elemValue.class2;

    //var m_relationTypeAdditional = ['ordering','uniqueness','readOnly','union','subsets','redefines','composite'];
    //获得其他信息
    elemValue.additional = {};
    var value1,value2;
    for(var i=0;i<m_relationTypeAdditional.length;i++){
        if(relationElem.sub.order[order][m_relationTypeAdditional[i]+'1'] != undefined){
            //说明存在，就可以进行
            for(var key in relationElem.sub.order[order][m_relationTypeAdditional[i]+'1']){
                value1 = key;break;
            }
            for(var key in relationElem.sub.order[order][m_relationTypeAdditional[i]+'2']){
                value2 = key;break;
            }
            elemValue.additional[m_relationTypeAdditional[i]] = {
                1:value1,
                2:value2
            };

        }
    }

    return  elemValue;
}

changeToShowVal = function(val){
    if(val === "&default") val ="";
    return val;
}
changeToPostVal = function(val){
    if(val === "") val ="&default";
    return val;
}

relationTypeRevise = function(relationElem){
    $.ajax({
        url: '/post/html/icd-element-relation-sub',
        type: 'post',
        async: false,
        success: function(html){
            $("#modal-create-relationType").children(".modal-body").children().remove();
            $("#modal-create-relationType").children(".modal-body").append(html);
            var accordionGroup = $('#modal-create-relationType').children(".modal-body").children()
            var elemValue = icd_element_relation_sub_show(accordionGroup,relationElem);
            relationSubToRevise(accordionGroup,elemValue); //基本内容初始化逻辑
            relationSubToReviseAdditional(accordionGroup,relationElem);
        }
    });
}

//relationType改为修改模式
relationSubToRevise = function(accordionGroup,elemValue){
    $(accordionGroup).children(".accordion-heading").remove();
    $(accordionGroup).children(".accordion-body").show();
    var tr = $(accordionGroup).find("tbody").children("tr");
    //进行数据段显示的改写
    //$(tr).find("span").hide();
    //第一行的数据
    var tmp = $(tr).eq(0).children("td").eq(1).children();
    $(tmp).eq(0).hide(); //show部分
    $(tmp).eq(1).show(); //control-sub部分
    $(tmp).eq(1).find("input[type=text]").hide();  //名称输入
    $(tmp).eq(1).find("p").hide(); //名称显示

    if(elemValue === undefined) return;
    //additional
    var additionalTrs =  $(accordionGroup).children(".accordion-body").find(".additional").children("tr:hidden");
    for(var i=0;i<additionalTrs.length;i++){
        var label = $(additionalTrs).eq(i).children("td").eq(0).text();
        if(elemValue.additional[chToEn[label]] != undefined){
            $(additionalTrs).eq(i).find(".show").hide();
            $(additionalTrs).eq(i).find(".control-sub").show();
        }
    }
}

relationSubToReviseAdditional = function(accordionGroup,relationElem){
    //选中对应的元素
    $(accordionGroup).find("tbody").children().eq(0).find(".control-sub").children("span").show();
    $(accordionGroup).find("tbody").children().eq(2).find("span").show();
    var liList = $(accordionGroup).find("tbody").children().eq(0).find(".btn-group").find("li");
    for(var i=0;i<liList.length;i++){
        if($(liList).eq(i).attr('name') === statusArray.relationType.type){
            $(liList).eq(i).trigger("click");
            break;
        }
    }
}

relationSubTypeReform = function(that){
    var accordionGroup = $(that).parent().parent().parent().parent().parent().parent();
    var typeDefault = getTypeDefault($(that).attr('name'));
    //变化角色类型
    var itemTableBody = $(that).parent().parent().parent().parent().parent().parent().children();
    $(itemTableBody).eq(1).children("td").eq(1).children(".show").children("p").text(typeDefault.role1);
    $(itemTableBody).eq(1).children("td").eq(2).children(".show").children("p").text(typeDefault.role2);
    //若第一次则版面大型修改
    relationSubTypeReformPre($(that).parent().parent().children("button").text(),itemTableBody);
    relationSubTypeReformNext(typeDefault.type,itemTableBody);
    //对ul进行赋值
    $(that).parent().parent().children("button").html(typeDefault.type);

}

relationSubTypeReformPre = function(type,itemTableBody){
    switch(type){
        case "Choose Type":
            //名称变换
            var name=statusArray.relation.value.split("-");
            name.sort(function(a,b){return (a >= b);});
            $(itemTableBody).eq(2).children("td").eq(1).children(".show").children("p").text(name[0]);
            $(itemTableBody).eq(2).children("td").eq(2).children(".show").children("p").text(name[1]);
            break;
        case enToCh["generalization"]:
            break;
        case enToCh["composition"]:
            break;
        case enToCh["aggregation"]:
            break;
        case enToCh["association"]:
            //title
            $(itemTableBody).eq(0).find("input[type=text]").hide();
            $(itemTableBody).eq(0).find("p").hide();
            //角色
            $(itemTableBody).eq(1).find(".show").show();
            $(itemTableBody).eq(1).find(".control-sub").hide();
            //填充
            $(itemTableBody).parent().parent().parent().parent().parent().parent().children(".optional").children().remove();
            break;
    }
    //多重性一栏 先统一显示修改
    $(itemTableBody).eq(3).find(".show").hide();
    $(itemTableBody).eq(3).find(".control-sub").show();
}
relationSubTypeReformNext = function(type,itemTableBody){
    switch(type){
        case enToCh["generalization"]:
            $(itemTableBody).eq(3).find(".show").show();
            $(itemTableBody).eq(3).find(".show").children("p").text("");
            $(itemTableBody).eq(3).find(".control-sub").hide();
            break;
        case enToCh["composition"]:
            $(itemTableBody).eq(3).find(".show").eq(0).show();
            $(itemTableBody).eq(3).find(".show").eq(0).children("p").text("1");
            $(itemTableBody).eq(3).find(".control-sub").eq(0).hide();
            break;
        case enToCh["aggregation"]:
            break;
        case enToCh["association"]:
            $(itemTableBody).eq(0).find("input[type=text]").show();
            $(itemTableBody).eq(0).find("p").show();
            $(itemTableBody).eq(1).find(".show").hide();
            $(itemTableBody).eq(1).find(".control-sub").show();
            break;

    }
    var span = $(itemTableBody).find(".span-hidden").children("span");
    $(span).eq(4).show();
    $(span).eq(5).show();
}

relationSubOptional = function(type,item){
    $(item).append('<hr style="margin: 0 0 5px 0;"/>'+"<h5>Recommend Info</h5>")
    //checkInIcd最后做检查吧
    var array = checkInCcd(icd['relation'][statusArray.relation.id],ccd['relation'][statusArray.relation.id],"",TypeAheadState.relationTYpe.type);
    setChooseList('','association',array);//当前值，类型和队列
    for(var i=0;i<array.length;i++){
        ModelOptionFrame(chooseList.dir,chooseList.array[i],item,'association');
        if(i>=3) {
            $(item).append('<div style="height:25px;text-align: center;">more...</div>');
            break;
        }
    }
}

relationNameExchange = function(tr){
    var p = $(tr).find("p");
    var name = [$(p).eq(0).text(),$(p).eq(1).text()];
    $(p).eq(0).text(name[1]);
    $(p).eq(1).text(name[0]);
}

getCreateRelationTypeValue = function(group){
    //var tr = $('#modal-create-relationType').find("tbody").children("tr");
    var trs = $(group).find("tbody").children("tr");
    var typeValue = {
        type : $(trs).eq(0).find(".control-sub").find("button").text(),
        id :   changeToPostVal($(group).children("input[type=hidden]").val()),
        name : changeToPostVal(""),
        role1: changeToPostVal($(trs).eq(1).find(".control-sub").eq(0).children("input[type=text]").val()),
        role2: changeToPostVal($(trs).eq(1).find(".control-sub").eq(1).children("input[type=text]").val()),
        class1: $(trs).eq(2).find(".show").eq(0).children("p").text(),
        class2: $(trs).eq(2).find(".show").eq(1).children("p").text(),
        multiplicity1: changeToPostVal($(trs).eq(3).find(".control-sub").eq(0).children("input[type=text]").val()),
        multiplicity2: changeToPostVal($(trs).eq(3).find(".control-sub").eq(1).children("input[type=text]").val())
    };
    if(regexAssociation.test(typeValue.type)) typeValue.type=enToCh["association"];
    if(typeValue.type===enToCh["association"]){
        if(typeValue.id==0 || typeValue.id==1) typeValue.id = "&default";

        typeValue.name = changeToPostVal($(trs).eq(0).find(".control-sub").children("input[type=text]").val());
        var id = $(group).find('input[type="radio"]:checked').parent().parent().parent().children("input[type=hidden]").val();
        if(id) typeValue.id = id;
    }
    var additional = getCreateRelationTypeAdditionalValue($(group).find(".additional").eq(0));
    if(additional === undefined) return;
    typeValue.additional = additional;

    //multiplicit的校验和转变
    if(typeValue.multiplicity1 != changeToPostVal("")){
        if(checkExist(null,'multiplicity',typeValue.multiplicity1)) {return;}
        typeValue.multiplicity1 = multiTransform.changeToShow(typeValue.multiplicity1);
    }
    if(typeValue.multiplicity2 != changeToPostVal("")){
        if(checkExist(null,'multiplicity',typeValue.multiplicity2)) {return;}
        typeValue.multiplicity2 = multiTransform.changeToShow(typeValue.multiplicity2);
    }

    return typeValue;
}

getCreateRelationTypeAdditionalValue = function(additionalItem){
    var additional = {};
    var trs = $(additionalItem).find("tr:visible");

    for(var i=0;i<trs.length;i++){
        var label = chToEn[$(trs).eq(i).children("td").eq(0).text()];
        var value1;
        var value2;
        if(label==='subsets' || label==='redefines'){
            value1 = $(trs).eq(i).children("td").eq(1).find("input[type='text']").val();
            value2 = $(trs).eq(i).children("td").eq(2).find("input[type='text']").val();
        }else{
            value1 = $(trs).eq(i).children("td").eq(1).find("input[type='radio']:checked").val();
            value2 = $(trs).eq(i).children("td").eq(2).find("input[type='radio']:checked").val();
        }
        if(value1 === undefined || value2 === undefined) {alert("Please check all item chosen！");return}
        if(value1 === '' || value2 === '') {alert("Please check all item can't be vacant！");return}

        additional[label+'1'] = {};
        additional[label+'1'][value1] = {_nor:1};
        additional[label+'2'] = {};
        additional[label+'2'][value2] = {_nor:1};
    }
    return additional;
}

getCreateRelationPostValue = function(typeValue){
    var postValue = typeValue;
    var classes = statusArray.relation.value.split('-');
    if((typeValue.class1===classes[1]) & (typeValue.class2===classes[0])) postValue.order = '1'; //逆序
    if((typeValue.class1===classes[0]) & (typeValue.class2===classes[1])) postValue.order = '0'; //顺序 避免重名时候的干扰

    postValue.type = chToEn[typeValue.type];
    switch(postValue.type){
        case 'generalization':
            postValue.id = postValue.order;
            postValue.multiplicity1 = '&default';
            postValue.multiplicity2 = '&default';
            break;
        case 'composition':
            postValue.id = postValue.order;
            postValue.multiplicity1 = '1';
            break;
        case 'aggregation':
            postValue.id = postValue.order;
            break;
        case 'association':
            break;
        default: return "Please choose a type";
            break;
    }

    statusArray.relationType = {
        type : postValue.type,
        id   : postValue.id
    }
    var sub = {_nor:1,name:{},order:{}};
    sub['name'][postValue.name]={_nor:1};
    var role1 = {}; role1[postValue.role1] ={_nor:1};
    var role2 = {}; role2[postValue.role2] ={_nor:1};
    var multiplicity1 = {}; multiplicity1[postValue.multiplicity1] ={_nor:1};
    var multiplicity2 = {}; multiplicity2[postValue.multiplicity2] ={_nor:1};
    sub['order'][postValue.order] = {_nor:1,role1:role1,role2:role2,multiplicity1:multiplicity1,multiplicity2:multiplicity2};

    for(var key in typeValue.additional){
        sub['order'][postValue.order][key] = typeValue.additional[key];
    }

    statusArray.relationType.sub = sub;
    return ;
}
//其他部分
clickOnNavItem = function(item){
    $(item).parent().children().removeClass("active");
    //$(m_old_active).removeClass("active");
    //m_old_active = item;
    $(item).addClass("active");
    var value = {
        key:$(item).attr('name'),
        value:$(item).text()
    };
    var type;
    if($(item).hasClass("cd")){
        type='cd';
        url = '/post/html/icd-content-classdiagram';
    }
    else if($(item).hasClass("class")){
        type='class'
        url = '/post/html/icd-content-class';
    }
    else if($(item).hasClass("relation")){
        type = 'relation';
        url = '/post/html/icd-content-relation';
    }
    else return;

    $.ajax({
        url: url,
        type: 'post',
        success: function(html){
            $(".content-detail").children().remove();
            $(".content-detail").append(html);
            icd_content_show([type],value);
        }
    });
};


//Once Create Or Revise Item check it in foreground first
checkInIcd = function(list,name){
    var item =null;
    var length = list.length;
    for(var i=0;i<length;i++){
        //if($(list).eq(i).attr('name') === undefined) continue;
        if(name.toLowerCase() === $(list).eq(i).text().toLowerCase()){
            item = $(list).eq(i);
            break;
        }
    }
    if($(item).length == 1) {
        clickOnNavItem(item);
        alert("Already Exist");
        return true;
    }
    else{
        return false;
    }
}

checkInCcd = function(icd_dir,ccd_dir,name,type){
    var array;
    switch(type){
        case 'class':
            array = checkClassName(icd_dir,ccd_dir,name);
            break;
        case 'attribute':
            array = checkAttributeName(icd_dir,ccd_dir,name);
            break;
        case 'association':
            array = checkRelationType(icd_dir,ccd_dir,type);
            break;
        default : array=[];break;
    }
    return array;
}

checkClassName = function(icd_dir,ccd_dir,name){
    var array = [];
    for(var classID in ccd_dir){
        //Name Reform
        //var ccd_dir2 = ccd_dir[classID]["className"];
        var ccd_dir2 = ccd_dir[classID]["name"];
        //if(ccd_dir2[name] != undefined){
        for(var key in ccd_dir2){
            if(key.toLowerCase() === name.toLowerCase()){
                if(icd_dir[classID] === undefined){
                    array.push({
                        value : name,
                        nor : ccd_dir2[key]["_nor"],
                        id : classID
                    });
                }
            }
        }

    }
    array.sort(function(a,b){return (a.nor <= b.nor);});
    array = sweepRepeat(array);
    return array;
}

checkAttributeName = function(icd_dir,ccd_dir,name){
//可与checkClassName进行合并
    var array = [];
    for(var attributeID in ccd_dir){
        //Name Reform
        //var ccd_dir2 = ccd_dir[attributeID]["attributeName"];
        var ccd_dir2 = ccd_dir[attributeID]["name"];
        for(var key in ccd_dir2){
            //if(ccd_dir2[name] != undefined){
            if(key.toLowerCase() === name.toLowerCase()){
                if(icd_dir === undefined){
                    array.push({
                        value : name,
                        nor : ccd_dir2[name]["_nor"],
                        id : attributeID
                    });
                }
                else if(icd_dir[attributeID] === undefined){
                    array.push({
                        value : name,
                        nor : ccd_dir2[key]["_nor"],
                        id : attributeID
                    });
                }
            }
        }
        //}
    }
    array.sort(function(a,b){return (a.nor <= b.nor);});
    array = sweepRepeat(array);
    return array;
}

sweepRepeat = function(array){
    var repeatList = {};
    var newArray = [];

    for(var i=0;i<array.length;i++){
        if(repeatList[array[i].id] === undefined){
            repeatList[array[i].id] = 1;
            newArray.push(array[i]);
        }
    }
    return  newArray;
}

checkRelationType = function(icd_dir,ccd_dir,type){
    var array = [];
    for(var relationTypeID in ccd_dir[type]){
        var i = 0;
        if(icd_dir[type] === undefined) i++;
        else if(icd_dir[type][relationTypeID] === undefined) i++;
        else if(statusArray.relationType.id === relationTypeID) i++;
        if(i != 0){
            var values=getRelationTypeValue(ccd_dir[type][relationTypeID]['name']);
            array.push({
                value : values[0],
                nor : ccd_dir[type][relationTypeID]["_nor"],
                id : relationTypeID
            });
        }
    }
    array.sort(function(a,b){return (a.nor <= b.nor);});
    return array;
}

getRelationTypeValue = function(dir){
    var array = [];
    for(var name in dir){
        if(name != "&default")  array.push[name,dir[name]['_nor']];
    }
    array.sort(function(a,b){return (a[1] <= b[1]);});
    return array;
}

icdGetId = function(type,dir,value){
    var subTitle;
    var id;
    switch(type){
        //Name Reform
        //case 'class' : subTitle = 'className';
        case 'class' : subTitle = 'name';
            id = getIdFromSub(dir,subTitle,value);
            break;
        //Name Reform
        //case 'attribute' : subTitle = 'attributeName';
        case 'attribute' : subTitle = 'name';
           id = getIdFromSub(dir,subTitle,value);
            break;
        case 'relationType':
            id = getIdFromRelation(dir,value);
            break;
        default :
    }
    return id;
}

getIdFromSub =function(dir,subTitle,value){
    for(var key in dir){
        if(dir[key][subTitle][value] != undefined){
            return key
        }
    }
}

getIdFromRelation = function(dir,value){
    for(var key in dir){
        if(value[key] === undefined){
            return key;
        }
    }
}

//点击选中后进行数据响应
$('.selector li').live('click',function(){
    var infoHtml = "";
    var ccd_id = $(this).attr('name');

    //info元素添加
    if($(this).text() === "无引用"){
        infoHtml =
            '<div style="padding-top: 5px;border-bottom: 1px solid #d7d7d7">' +
                '<p style="text-align: center" >提示：</p>' +
                '<p style="text-align: " >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在Collective Concept Diagram中未能找到对应元素将导致子元素创建无法的到有效提示。</p>' +
                '<p style="text-align: " >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;请慎重考虑！</p>' +
                '</div>';
        $("#modal-alter-content").children(".modal-body").find(".info").find(".body").children().remove();
        $("#modal-alter-content").children(".modal-body").find(".info").find(".body").append(infoHtml);
    }else{
    //进入队列进行查找
        for(var type in ccd['class'][ccd_id]){
            if(regex.test(type) === false){
                for(var key in ccd['class'][ccd_id][type]){
                    var value = ccd['class'][ccd_id][type][key]['_value']
                    infoHtml +=
                        '<div style="padding-top: 5px;border-bottom: 1px solid #d7d7d7">'+
                            '<p style="width:80px;display: inline-block;text-align: left;border-right: 1px solid #d7d7d7" >'+ type +'</p>' +
                            '<p style="width:120px;padding-left:30px;display: inline-block;text-align: left">'+ value +'</p>' +
                            '</div>'
                }
            }
        }
        $("#modal-alter-content").children(".modal-body").find(".info").find(".body").children().remove();
        $("#modal-alter-content").children(".modal-body").find(".info").find(".body").append(infoHtml);
    }
});

//selector的元素添加
selectLoop = function(icd_dir,ccd_dir,type,elem,dom){
    var array = checkInCcd({},ccd_dir,elem.value,type);
    var length = array.length;
    var li = "";
    //更新selector信息
    if(length === 0){
        li += '<li value=><a href="javascript:;">无引用</a></li>';
    }else{
        for(var i=0;i<length;i++){
            li += '<li name='+array[i].preId+'><a href="javascript:;">元素-'+ i +'</a></li>';
        }
    }

    var selectorHtml =
        '<div class='+ type +'>' +
            '<p style="width:70px;display: inline-block;" >' +type+ '</p>' +
            '<p name='+ elem.id +' style="width:150px;display: inline-block;">' +elem.value+ '</p>' +
            '<div class="btn-group controls-small">' +
                '<button class="btn dropdown-toggle" data-toggle="dropdown">引用元素<span class="caret"></span></button>' +
                '<ul class="dropdown-menu">' + li +'</ul>'
            '</div>' +
            '<div class="sub" style="border-top: 1px solid #d7d7d7"></div>' +
        '</div>'
    $(dom).append(selectorHtml);
}

var idToIcdDir = {};
var regex = /^_/;
//第一次revise时建立索引
generateIcdIndex = function(preDir,id,type){
    idToIcdDir[id] = preDir[id];
    switch(type){
        case 'class':
            type = 'attribute';
            for(var subId in preDir[id][type]){
                generateIcdIndex(preDir[id][type],subId,type);
            }
            break;
        case 'attribute':
            type = 'attributeElem';
            for(var label in preDir[id]){
                if(regex.test(label)=== false){
                    for(var subId in preDir[id][label]){
                        generateIcdIndex(preDir[id][label],subId,type);
                    }
                }
            }
            break;
        case 'attributeElem':
            break;
        default: break;
    }
    return ;
}

contentDetailActive = function(group,item,recommendType){
    $(".span6-compact.content-detail").find(".active").removeClass("active");
    $(".span6-compact.content-detail").find(".recommend-spot").remove();

    $(item).append(recommendLabel.html());

    $(group).addClass("active");
    $(group).find("."+recommendType).addClass("active");
}



setChooseList = function(name,type,array,sublist){
    chooseList ={
        name : name,
        array : array
    }
    switch(type){
        case 'class':
            chooseList.type = 'Class';
            chooseList.typeEn = 'class';
            chooseList.dir = ccd['class'];
            break;
        case 'attribute':
            chooseList.type = 'Attribute',
            chooseList.typeEn = 'attribute';
            chooseList.dir = ccd['class'][statusArray.class.id]['attribute'];
            break;
        case 'association':
            chooseList.type = 'Association',
            chooseList.typeEn = 'association';
            chooseList.dir = ccd['relation'][statusArray.relation.id]['association'];
            break;
        default :
            chooseList.type = '',
            chooseList.dir = {};
            break;
    }
    if(sublist!=undefined) chooseList.sub = sublist;
}

classModelOption = function(dir,elem,item){
    //框架Head
    var classHtml =
        '<div class="accordion-group" style="border: 1px solid #aaaaaa">' +
            '<input type="hidden" value='+elem.id+'>' +
            '<div class="row-fluid accordion-heading">'+
                '<div class="span1"></div>'+
                '<div class="span9" style="display: inline;color: #0088cc;">'+
                    '<label class="control-label-middle">类</label>'+
                    '<p class="controls-text-middle">ID: '+elem.id+'</p>'+
                '</div>'+
                '<div class="span2"><input type="radio"></div>'+
            '</div>'+
            '<div class="accordion-body" style="display: none;overflow: visible">'+
                '<div class="accordion-inner " style="padding: 0px 0px 0px 0px;">' +
                    //内部填充数据classElemHtml
                '</div>'+
            '</div>'+
        '</div>';
    $(item).append(classHtml);

    //框架Body
    var classElemHtml =
        '<div class="control-group form-horizontal" style="margin: 0 0 0 0;">'+
            '<div class="row row-hover" style="margin: 0">'+
                '<div style="display: inline-block"><label class="corner-label-left" >名称</label></div>'+
                '<div class="sub-option">'+
                    //填充已知名称的
                '</div>'+
            '</div>'+
            '<div class="row row-hover" style="margin: 0;border-top:1px solid #eeeeee" >'+
                '<div style="display: inline-block"><label class="corner-label-left" >属性</label></div>'+
                '<div class="sub-option">'+
                    //填充已知属性
                '</div>'+
            '</div>'+
        '</div>'
    var itemInner = $(item).children().last().find(".accordion-inner");
    $(itemInner).append(classElemHtml);

    //填充Name
    var itemInnerName = $(itemInner).find(".sub-option").eq(0);
    var nameArray = [];
    var count=0;
    //Name Reform
    //for(var name in dir[elem.id]["className"]){
    for(var name in dir[elem.id]["name"]){
        nameArray.push({
            name: name,
            nor: dir[elem.id]["name"][name]['_nor']
        });
        if(count++ >=2) break;
    }
    nameArray.sort(function(a,b){return (a.nor <= b.nor);});

    for(var i=0;i<nameArray.length;i++){
        if(i%3 === 0){
            //添加头
            $(itemInnerName).append('<div class="row-fluid"><div class="span1"></div></div>');
            var that = $(itemInnerName).children(".row-fluid").last();
        }
        //一般添加
        var j = i+1;
        $(that).append('<div class="span3"><div class="span2" style="text-align: right">'+j+'. </div><div class="span10" style="text-align: left">'+nameArray[i].name+'</div></div>');
        //添加尾
        if(i>=2) {
            $(that).append('<div class="span2"><a>more...</a></div>');
            break;
        }
    }

    //填充Attribute
    var itemInnerAttribute = $(itemInner).find(".sub-option").eq(1);
    var attributeArray = [];
    var count=0;
    for(var attribute in dir[elem.id]["attribute"]){
        attributeArray.push({
            attribute: attribute,
            dir: dir[elem.id]["attribute"][attribute],
            nor: dir[elem.id]["attribute"][attribute]['_nor']
        });
        if(count++ >=2) break;
    }
    attributeArray.sort(function(a,b){return (a.nor <= b.nor);});

    for(var i=0;i<attributeArray.length;i++){
        var j = i+1;
        var attributeString = getAttributeString(attributeArray[i]);
        var attributeHtml =
            '<div class="accordion-group"><div class="row-fluid" ><div class="span1"></div><div class="span10">'+
                '<label class="control-label-middle">'+j+'.</label>'+
                '<p class="controls-text-middle">'+attributeString+'</p>'+
            '</div></div></div>'
        $(itemInnerAttribute).append(attributeHtml);
        if(i>=2) {
            $(itemInnerAttribute).append('<div style="height:25px;text-align: center;">more...</div>');
            break;
        }
    }
}

getAttributeString = function(elem){
    //Name Reform
    //var typeArray=['visibility','attributeName','type','multiplicity'];
    var typeArray=['visibility','name','type','multiplicity'];
    var summary={
        visibility:{_nor: -1},
        //Name Reform
        //attributeName : {_nor: -1},
        name : {_nor: -1},
        type : {_nor: -1},
        multiplicity : {_nor: -1}
    }

    for(i=0;i<typeArray.length;i++){
        for(var value in elem.dir[typeArray[i]]){
            if(elem.dir[typeArray[i]][value]['_nor'] > summary[typeArray[i]]['_nor']){
                summary[typeArray[i]]={
                    _value : value,
                    _nor : elem.dir[typeArray[i]][value]['_nor']
                }
            }
        }
    }

    var text = "";
    switch(summary['visibility']['_value']){
        case 'private': text +='- ';  break;
        case 'public': text +='+ ';  break;
        case 'protected': text +='# ';  break;
        case 'package': text +='~ '; break;
    };
    //Name Reform
    //text += summary['attributeName']['_value']+" : "
    text += summary['name']['_value']+" : "
    if(summary['type']['_value']!=undefined) text+=summary['type']['_value'];
    if(summary['multiplicity']['_value']!=undefined) text+='[ '+summary['multiplicity']['_value']+' ]';

    return text;
}

ModelOptionFrame = function(dir,elem,item,type){
//框架Head
    var headHtml =
        '<div class="accordion-group" style="border: 1px solid #aaaaaa">' +
            '<input type="hidden" value='+elem.id+'>' +
            '<div class="row-fluid accordion-heading">'+
            '<div class="span1"></div>'+
            '<div class="span9" style="display: inline;color: #0088cc;">'+
            '<label class="control-label-middle">'+chooseList.type+'</label>'+
            '<p class="controls-text-middle">ID: '+elem.id+'</p>'+
            '</div>'+
            '<div class="span2"><input type="radio"></div>'+
            '</div>'+
            '<div class="accordion-body" style="display: none;overflow: visible">'+
            '<div class="accordion-inner " style="padding: 0px 0px 0px 0px;">' +
            //内部填充数据classElemHtml
            '</div>'+
            '</div>'+
            '</div>';
    $(item).append(headHtml);
    //框架Body
    var bodyHtml =
        '<div class="control-group form-horizontal" style="margin: 0 0 0 0;">'+
            '<div class="row row-hover" style="margin: 0">'+
            '<div style="display: inline-block"><label class="corner-label-left" >Name</label></div>'+
            '<div class="sub-option">'+
            //填充已知名称的
            '</div>'+
            '</div>'+
            '<div class="row row-hover" style="margin: 0;border-top:1px solid #eeeeee" >'+
            '<div style="display: inline-block"><label class="corner-label-left" >Attribute</label></div>'+
            '<div class="sub-option">'+
            //填充已知属性
            '</div>'+
            '</div>'+
            '</div>'
    var itemInner = $(item).children().last().find(".accordion-inner");
    $(itemInner).append(bodyHtml);
    //至此两者没有什么差别

    //填充Name
    var itemInnerName = $(itemInner).find(".sub-option").eq(0);
    //Name Reform
    //var nameArray = getTopElem(dir[elem.id][type+"Name"],3);
    var nameArray = getTopElem(dir[elem.id]["name"],3);
    //添加名称
    for(var i=0;i<nameArray.length;i++){
        if(i%3 === 0){
            //添加头
            $(itemInnerName).append('<div class="row-fluid"><div class="span1"></div></div>');
            var that = $(itemInnerName).children(".row-fluid").last();
        }
        //一般添加
        var j = i+1;
        $(that).append('<div class="span3"><input type="checkbox" name="readOnly" value="ordering">' +
            nameArray[i].name+'</div>');
        //添加尾
        if(i>=2) {
            $(that).append('<div class="span2"><a>more...</a></div>');
            break;
        }
    }
    //
    //至此两者依旧没什么差别
    switch(type){
        case 'class':
            modalOptionSubElemClass(dir,elem,item);
            break;
        case 'attribute':
            modalOptionSubElemAttribute(dir,elem,item);
            break;
        case 'association' :
            modalOptionSubElemRelationType(dir,elem,item);
            break;
    }

}

modalOptionSubElemClass = function(dir,elem,item){
    var itemInnerAttribute = $(item).children().last().find(".accordion-inner").find(".sub-option").eq(1);
    var attributeArray = [];
    var count=0;
    for(var attribute in dir[elem.id]["attribute"]){
        attributeArray.push({
            attribute: attribute,
            dir: dir[elem.id]["attribute"][attribute],
            nor: dir[elem.id]["attribute"][attribute]['_nor']
        });
        if(count++ >=2) break;
    }
    attributeArray.sort(function(a,b){return (a.nor <= b.nor);});

    for(var i=0;i<attributeArray.length;i++){
        var j = i+1;
        var attributeString = getAttributeString(attributeArray[i]);
        var attributeHtml =
            '<div class="accordion-group"><div class="row-fluid" ><div class="span1"></div><div class="span10">'+
                '<label class="control-label-middle">'+j+'.</label>'+
                '<p class="controls-text-middle">'+attributeString+'</p>'+
                '</div></div></div>'
        $(itemInnerAttribute).append(attributeHtml);
        if(i>=2) {
            $(itemInnerAttribute).append('<div style="height:25px;text-align: center;">more...</div>');
            break;
        }
    }
}

modalOptionSubElemAttribute = function(dir,elem,item){
    var itemInnerAttribute = $(item).children().last().find(".accordion-inner").find(".sub-option").eq(1);
    var attributeArray = [];
    var count=0;
    var subDir = dir[elem.id];
    var j = 0;

    for(var i=0;i<m_attributeElem.length;i++){
        if(subDir[m_attributeElem[i]] != undefined){
            var attributeHtml =
                '<div class="accordion-group"><div class="row-fluid" ><div class="span1"></div><div class="span10">'+
                    '<label class="control-label-middle">'+enToCh[m_attributeElem[i]]+'</label>'+
                    '<div class="controls-text-middle">' +
                    '</div>'
                    '</div></div></div>'
            $(itemInnerAttribute).append(attributeHtml);
            var itemInnerAttributeName = $(itemInnerAttribute).find(".controls-text-middle").last();
            var nameArray = getTopElem(subDir[m_attributeElem[i]],3);
            if(m_attributeElem[i] === enToCh['multiplicity']) for(var k=0;k<nameArray.length;k++){
                nameArray[k].name = multiTransform.changeToPost(nameArray[k].name);
            }
            var str = "";
            for(var j=0;j<nameArray.length;j++){
                $(itemInnerAttributeName).append('<div class="span4" style="min-height: 25px"><input type="checkbox" name="readOnly" value="ordering">'+nameArray[j].name+'</div>');
                if(j>=2) break;
            }
        }
    }
    //*/
}

$("#modal-single-select input[type='checkbox']").live('click',function(){
    //标记当前状态 ckeckbox本身就会相应一次变换
    var label = $(this).parent().parent().parent().children("label").text();
    if(label === 'type'){
        var attributeElemValue = $(this).parent().text();
        if(checkExist(null,enToCh['type'],attributeElemValue)) {
            var selection = confirm("This attribute type is not existed in your diagram.\n Do you want to create it now?")
            if(selection){
                $("#modal-single-select").modal('hide');

                var html = $("#modal-single-select").html();
                modalStackControl.push($("#modal-single-select"),html);

                $("#modal-create-class").modal('show');
                $("#modal-create-class").children(".modal-body").children("input").val(attributeElemValue);

                return;
            }else{
                $(this).attr("checked",false);
                return;
            }
        }
    }

    var state = $(this).attr("checked");
    $(this).parent().parent().find("input[type='checkbox']").attr("checked",false);
    $(this).attr("checked",state);
});

modalOptionSubElemRelationType = function(dir,elem,item){
    //item为optional那一层
    //获取最大元素
    var relationElem = {
        type: chooseList.typeEn,
        id:elem.id
    }
    var getShowValue = generateMaxRelationType(dir,relationElem);
    //首行信息的显示
    $(item).children().last().children(".accordion-heading").children(".span9").append('<label class="control-label-middle" style="margin-top: -10px">Brief Info</label>'+
        '<p class="controls-text-middle" style="margin-top: -10px">'+getShowValue.title+'</p>')
    //属性信息的显示添加
    var itemInnerRelationType = $(item).children().last().find(".accordion-inner").find(".sub-option").eq(1);
    //数据的重新整理
    icd_content_relationType_show(itemInnerRelationType,getShowValue);
    //页面简单处理
    $(itemInnerRelationType).find(".accordion-heading").remove();
    $(itemInnerRelationType).find(".accordion-body").show();
    $(itemInnerRelationType).find(".accordion-body").find("span").remove();
}


modalOptionSubElemRelationType2 = function(dir,elem,item){
    //获取最大元素
    var relationElem = {
        type: chooseList.typeEn,
        id:elem.id
    }
    var getShowValue = generateMaxRelationType(dir,relationElem);
    //显示
    var itemInnerRelationType = $(item).children().last().find(".accordion-inner").find(".sub-option").eq(1);

    for(var i=0;i<8;i++){
        var attributeHtml =
            '<div class="accordion-group"><div class="row-fluid" ><div class="span1"></div><div class="span10">'+
                '<label class="control-label-middle">'+enToCh[m_attributeElem[i]]+'</label>'+
                '<div class="controls-text-middle">' +
                '</div>'
        '</div></div></div>'
        $(itemInnerRelationType).append(attributeHtml);
    }
}

generateMaxRelationType = function(dir,relationElem){
    var subValue = {};
    var titleValue = {}
    //var subDir1 = dir[elem.id];
    var subDir1 = dir[relationElem.id];
    for(var i=0;i<m_relationTypeSub1.length;i++){
        if(subDir1[m_relationTypeSub1[i]] != undefined){
            var nameArray = getTopElem(subDir1[m_relationTypeSub1[i]],1);
            titleValue[m_relationTypeSub1[i]] = nameArray[0].name;
        }
    }
    //var subDir2 = dir[elem.id]['order'][subValue.order];
    var subDir2 = dir[relationElem.id]['order'][titleValue.order];
    for(var i=0;i<m_relationTypeSub2.length;i++){
        if(subDir2[m_relationTypeSub2[i]] != undefined){
            var nameArray = getTopElem(subDir2[m_relationTypeSub2[i]],1);
            subValue[m_relationTypeSub2[i]] = nameArray[0].name;
        }
    }
    for(var i=0;i<m_relationTypeAdditional.length;i++){
        if(subDir2[m_relationTypeAdditional[i]+'1'] != undefined){
            var nameArray = getTopElem(subDir2[m_relationTypeAdditional[i]+"1"],1);
            subValue[m_relationTypeAdditional[i]+"1"] = nameArray[0].name;

            var nameArray = getTopElem(subDir2[m_relationTypeAdditional[i]+"2"],1);
            subValue[m_relationTypeAdditional[i]+"2"] = nameArray[0].name;
        }
    }

    //整理形式
    var sub = {_nor:1,name:{},order:{}};
    sub['name'][titleValue.name]={_nor:1};
    sub['order'][titleValue.order] = {_nor:1};

    for(var key in subValue){
        sub['order'][titleValue.order][key] = {};
        sub['order'][titleValue.order][key][subValue[key]] = {_nor:1};
    }
    relationElem.sub = sub;
    var getTitle = getRelationElemValue(relationElem);
    relationElem.title = getTitle.title;

    return relationElem;
}

getTopElem = function(dir,max){
    //max = max -1;
    //暂时max这一项还没用
    var nameArray=[];
    var count = 0;
    for(var name in dir){
        nameArray.push({
            name: name,
            nor: dir[name]['_nor']
        });
        //if(count++ >=max) break;
    }
    nameArray.sort(function(a,b){return (a.nor <= b.nor);});
    return nameArray;
}

splitRelationTypeTitle = function(title){
    var selectedType={};
    var tmp = title.split(" ");
    var shift=0;
    if(tmp.length === 5){
        selectedType.name = tmp[shift].split(":");
        selectedType.name = selectedType.name[0];
        shift++;
    }
    selectedType.class1 = tmp[shift];
    selectedType.class2 = tmp[shift+3];

    //姑且这么写吧。。。不会正则表达式
    selectedType.multiplicity1 = tmp[shift+1].replace("[", "").replace("]", "");
    selectedType.multiplicity2 = tmp[shift+2].replace("[", "").replace("]", "");

    //没有显示role
    return selectedType;
}


selectShow = function(itemGroup,selectedType){
    //进行显示
    $(itemGroup).children("input[type=hidden]").val(selectedType.id);
    var trs = $(itemGroup).children(".accordion-body").find("tbody").children("tr");

    $(trs).eq(0).children("td").children(".control-sub").find("input[type=text]").val(selectedType.name);

    //$(trs).eq(1).children("td").eq(1).children(".control-sub").find("input[type=text]").val(selectedType.role1);
    //$(trs).eq(1).children("td").eq(2).children(".control-sub").find("input[type=text]").val(selectedType.role2);

    $(trs).eq(2).children("td").eq(1).children(".show").children("p").text(selectedType.class1);
    $(trs).eq(2).children("td").eq(2).children(".show").children("p").text(selectedType.class2);

    $(trs).eq(3).children("td").eq(1).children(".control-sub").children("input[type=text]").val(selectedType.multiplicity1);
    $(trs).eq(3).children("td").eq(2).children(".control-sub").children("input[type=text]").val(selectedType.multiplicity2);
}

selectDetailShow = function(itemGroup,typeValue){
    var trs = $(itemGroup).children(".accordion-body").find("tbody").children("tr");
    $(trs).eq(1).children("td").eq(1).children(".control-sub").find("input[type=text]").val(typeValue.role1);
    $(trs).eq(1).children("td").eq(2).children(".control-sub").find("input[type=text]").val(typeValue.role2);

    var additionalTrs =  $(itemGroup).children(".accordion-body").find(".additional").children("tr:visible");
    for(var i=0;i<additionalTrs.length;i++){
        var label = $(additionalTrs).eq(i).children("td").eq(0).text();
        if(typeValue.additional[chToEn[label]+'1'] != undefined){
            for(var key in typeValue.additional[chToEn[label]+'1']){
                var value1 = key;
            }
            for(var key in typeValue.additional[chToEn[label]+'2']){
                var value2 = key;
            }
            if(chToEn[label]==='subsets' || chToEn[label]==='redefines'){
                $(additionalTrs).eq(i).children("td").eq(1).children(".control-sub").children("input[type='text']").val(value1);
                $(additionalTrs).eq(i).children("td").eq(2).children(".control-sub").children("input[type='text']").val(value2);
            }else{
                if(value1 === 'True'){
                    $(additionalTrs).eq(i).children("td").eq(1).children(".control-sub").find("input[type='radio']").eq(0).attr('checked','checked');
                }else{
                    $(additionalTrs).eq(i).children("td").eq(1).children(".control-sub").find("input[type='radio']").eq(1).attr('checked','checked');
                }
                if(value2 === 'True'){
                    $(additionalTrs).eq(i).children("td").eq(2).children(".control-sub").find("input[type='radio']").eq(0).attr('checked','checked');
                }else{
                    $(additionalTrs).eq(i).children("td").eq(2).children(".control-sub").find("input[type='radio']").eq(1).attr('checked','checked');
                }
            }
        }
    }
}

var oldRelationTypeImg ;

$(".accordion-group").live("click",function(){
    var img = $(this).find(".relationTypeTitle").find("img");
    if(img.length === 0) return;    //不然容易出现问题
    if(oldRelationTypeImg != undefined){
        var oldImgScr = $(oldRelationTypeImg).attr("src");
        oldImgScr = oldImgScr.split("-");
        $(oldRelationTypeImg).attr("src",oldImgScr[0]+"-3.png");
    }

    var img = $(this).find(".relationTypeTitle").find("img");
    var imgScr = $(img).attr("src");
    imgScr = imgScr.split("-");
    $(img).attr("src",imgScr[0]+"-2.png");

    oldRelationTypeImg = $(img);
})

var multiTransform = {
    changeToShow :function(multiplicity){
        var tmp;
        tmp = multiplicity.split("..");
        if(tmp.length === 1) {multiplicity = tmp[0]}
        else{
            if(tmp[1] === "*"){
            }else if(tmp[0] === "*" || parseInt(tmp[0])>parseInt(tmp[1])){
                var t =tmp[1];
                tmp[1] = tmp[0];
                tmp[0] = t;
            }
            multiplicity = tmp[0] +"-"+tmp[1];
        }
        return multiplicity;
    },
    changeToPost :function(multiplicity){
        var tmp;
        tmp = multiplicity.split("-");
        if(tmp.length != 1) multiplicity = tmp[0] +".."+tmp[1];
        return multiplicity;
    }
}

operationValue = function(){
    $.ajax({
        url: '/post/data/icd-operationValue',
        type: 'post',
        data: {
            statusArray:statusArray,
            process : 'getOperationValue',
            data: {
                new: {
                    value : chooseList.name,
                    id : 'id'
                }
            }
        },
        dataType: 'json',
        async: true,
        success: function(doc){
            $(".breadcrumb p").eq(0).html("<strong>Type1 - Operation Score:</strong> "+doc.value);
            $(".breadcrumb p").eq(1).html("<strong>Rank:</strong> "+doc.rank);
            $(".breadcrumb p").eq(2).html("<strong>Type2 - Operation Score:</strong> "+doc.value2);
            $(".breadcrumb p").eq(3).html("<strong>Rank:</strong> "+doc.rank2);
        }
    });
}


getModalNewSingleElementAttrProp = function(itemGroup){
    var ItemList = $(itemGroup).find("input[type='checkbox']:checked");
    var list = {};
    if(chooseList.sub != undefined) list = chooseList.sub;
    for(var i=0;i<$(ItemList).length;i++){
        var value = $(ItemList).eq(i).parent().text();
        var label = $(ItemList).eq(i).parent().parent().parent().children("label").text();
        if(label === '') label = 'name';
        if(label === "multiplicity"){
            value = multiTransform.changeToShow(value);
        }
        list[label] = value;
    }
    return list;
}