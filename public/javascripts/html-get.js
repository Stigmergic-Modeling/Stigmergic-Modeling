modalAlterHtml = {
    getSelector : function(type,item){
        //传入什么再说
        var li;
        for(var i=0; i<item.length;i++){
            li += '<li value='+item.id+'><a href="javascript:;">'+item.value+'</a></li>';
        }
        var html =
            '<div class="selector">' +
                '<p class="help-inline" style="width:70px;padding-top:10px;text-align: right;">'+ type +'：</p>' +
                '<div class="btn-group controls-small"  >' +
                '<button class="btn dropdown-toggle" data-toggle="dropdown">Select... <span class="caret"></span></button>' +
                '<ul class="dropdown-menu">' +li+ '</ul>' +
                '</div>' +
                '</div>'
        return html;
    },
    getInfo : function(type,id,value){
        var html = "";
        for(var i=0; i<item.length;i++){
            html +=
                '<div class="info">' +
                    '<p style="width:70px;padding-top:10px;display: inline-block;">'+type+'：</p>' +
                    '<p style="padding-top:10px;display: inline-block;">'+ value +'</p>' +
                    '</div>';
        }
    }
}

recommendLabel = {
    html : function(){
        var html = '<div class="recommend-spot" style="text-align:right;padding-right: 20px">'+
            '<div class="round" data-toggle="tooltip" title="Item Recommending">●</div>'+
            '</div>'
        return html;
    }
}

getHtml = {
    navLi : function(name,type,text){
        var html = '<li name='+name+ ' class='+type+'><a href="javascript:;"><i class="icon-chevron-right"></i><i></i><i class="icon-remove-sign-right" title="click to remove" style="display: none"></i>'+ text +'</a></li>';
        return html;
    }
}


modalRelationTypeAdd = {
    checkbox : function(value,text){
        var html = '<label class="checkbox inline" style="width: 80px">' +
        '<input type="checkbox" name="readOnly" value='+value+'>' +
        text +'</label>';
        return html;
    },
    note : function(){
        var html = '<p class="help-block" style="padding-top: 50px"><strong>Note:</strong> Attributes users usually not concerned are listed here.<br\>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select and add what you want.</p>';
        return html;
    },
    trAdditional : function(title){
        var html = '<tr>' +
            '<td>'+title+'</td>'+
            '<td><div class="control-sub" style="display:inline;">'+
            '<input type="text" class="miniInput search-'+chToEn[title]+'1" data-provide="typeahead" data-items="10" autocomplete="off">'+
            '</div></td>'+
            '<td><div class="control-sub" style="display:inline;">'+
            '<input type="text" class="miniInput search-'+chToEn[title]+'2"  data-provide="typeahead" data-items="10" autocomplete="off">'+
            '</div></td>'+
            +'</tr>';
        return html;
    }
}