var modalStack = [];
var popMutex;
var modalStackControl = {
    pop : function(){
        var element = modalStack.pop();
        //回复点击状态和暂存数据,Class相关
        var list = $(".nav-classdiagram").children("ul").children("li")
        var item_val =  element.statusArray.class.value;
        var item =null;
        var length = list.length;
        for(var i=0;i<length;i++){
            if(item_val.toLowerCase() === $(list).eq(i).text().toLowerCase()){
                item = $(list).eq(i);
                break;
            }
        }
        if($(item).length == 1) {
            clickOnNavItem(item);
        }
        statusArray = element.statusArray;

        chooseList = element.chooseList;
        //处理显示逻辑
        $(element.item).modal('show');
        $(element.item).html(element.html);

        return element;
    },
    push : function(item,html){
        var newStatusArray = jQuery.extend(true, {}, statusArray);
        var newChooseList =  jQuery.extend(true, {}, chooseList);
        return modalStack.push({item:item,html:html,statusArray:newStatusArray,chooseList:newChooseList});

    },
    notEmpty : function(){
        return modalStack.length
    }
}


$("#modal-single-select").on("hide",function(){
    if(modalStackControl.notEmpty()){
        popMutex = true;
    }else{
        popMutex = false;
    }
});

$("#modal-single-select").on("hidden",function(){
    if(popMutex){
        alert("Continue creating the attribute");
        modalStackControl.pop();
    }
});

$("#modal-create-class").on("hidden",function(){
    if($("#modal-single-select").is(":hidden")){
        if(modalStackControl.notEmpty()){
            alert("Continue creating the attribute");
            modalStackControl.pop();
        }
    }
});