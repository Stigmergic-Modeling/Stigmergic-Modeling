$(function(){
    $("#testTree .element").live("click",function(){
        $("#testTree").find(".active").removeClass("active");
        $(this).addClass("active");
    });

    $("#testTree .element").live({
        mouseenter: function(){
            $(this).children("span").show();
        },
        mouseleave: function(){
            $(this).children("span").hide();
        }
    });

    $("#testTree a.icon").live("click",function(){
        if($(this).hasClass("plus")){
            $(this).removeClass("plus");
            $(this).addClass("minus");
            $(this).parent().children("ul").show();
        }
        else if($(this).hasClass("minus")){
            $(this).removeClass("minus");
            $(this).addClass("plus");
            $(this).parent().children("ul").hide();
        }
    });

    $("#testTree span .icon-zoom-in").live("click",function(){
        var trigger = $(this).parent().parent().parent().children("a").eq(0);
        if($(trigger).hasClass("plus")){
            $(trigger).trigger("click");
        }
    });

    $("#testTree span .icon-plus").live("click",function(){
        var name = window.prompt("Please write the node's name")
        if(name != null && name != "")
        {
            var html = getHtml.addNode(name);
            $(this).parent().parent().parent().children("ul").append(html);
            $(this).parent().parent().parent().children("a").addClass("plus")
            $(this).parent().children(".icon-zoom-in").trigger("click");
        }
    });

    $("#testTree span .icon-trash").live("click",function(){
        if(window.confirm("Do you really what to delete it")){
            $(this).parent().parent().parent().remove();
        }
    });

    var getHtml = {
        addNode : function(name){
            var html = '<li><a class="icon" ></a>' +
                '<div class="element">'+name
                + '<span><i class="icon-zoom-in" title="Expend"></i><i class="icon-plus" title="Add Child"></i><i class="icon-trash" title="Remove"></i></span>'
                + '</div>' +
                '<ul style="display: none"></ul>'
            return html;
        }
    }
});

