var icd_index,ccd_index,user;
var regex = /^_/;
$(function(){
    $(".nav-list-1").bind("click",function(){
        navActive(this);
        append_involved();
        append_uninvolved();
        append_own();
    });

    $(".nav-list-2").bind("click",function(){
        navActive(this);
        append_involved();
    });

    $(".nav-list-3").bind("click",function(){
        navActive(this);
        append_uninvolved();
    });
    /*
    $(".nav-list-4").bind("click",function(){
        navActive(this);
        ajax_invite0();
    });

    $(".nav-list-5").bind("click",function(){
        navActive(this);
        ajax_invite1();
    });
    */
    $(".nav-list-6").bind("click",function(){
        navActive(this);
        append_own();
    });
});

append_involved = function(){
    $("#involved-content").append('<hr/><h3><font color="6B4226">Project Involved</font></h3>');
    var that ;
    for(var i=0;i<icd_index.length;i++){
        if(i%2 === 0){
            $("#involved-content").append('<div class="row-fluid" style="padding-top: 15px"></div>');
            that = $("#involved-content").children(".row-fluid").last()
        }
        $(that).append(getInvolved(icd_index[i]));
    }
}

append_uninvolved = function(){
    $("#uninvolved-content").append('<hr/><h3><font color="6B4226">Project Uninvolved</font></h3>');
    var that ;
    for(var i=0;i<ccd_index.length;i++){
        if(i%2 === 0){
            $("#uninvolved-content").append('<div class="row-fluid" style="padding-top: 15px"></div>');
            that = $("#uninvolved-content").children(".row-fluid").last()
        }
        $(that).append(getUninvolved(ccd_index[i]));
    }
}

append_own =function(){
    $("#created-content").append('<hr/><h3><font color="6B4226">Projected Owned</font></h3><div class="row-fluid"></div>');
    var that = $("#created-content").children(".row-fluid");
    $(that).append('<div class="span6"><div class="hero-unit"><h4 style="text-align: center"><a href="/'+user+'/own">Create a new Project</a></h4></div></div>');
    //未写
}

navActive = function(that){
    var _that = that;
    if(($(that).hasClass("nav-list-4")||$(that).hasClass("nav-list-5"))){
        _that = $(that).parent();
    }
    homeContentClean();

    $(_that).parent().children().removeClass("active");
    $(_that).parent().children().children().removeClass("active");
    $(that).addClass("active");
};

homeContentClean =function(){
    $("#home-content").children().remove();
    $("#home-content").append('<div id="involved-content"></div>'+'<div id="uninvolved-content"></div>'+'<div id="created-content"></div>');
};

getInvolved = function(item){
    var title,description;
    for(var title in item.cd){
        description = item["cd"][title]["_description"];
        if(description.length>140) description = description.substring(0,140) + "...";
        break
    };

    var html = '<div class="span6">';
    //html+='<h4><a href="/'+user+'/involved/'+item.ccd_id+'">'+"Project: "+title+'</a></h3>';
    html+='<h4><a href="/'+user+'/intro/'+item.ccd_id+'">'+"Project: "+title+'</a></h3>';
    html+='<p >Info: '+description+'</p>';
    html+='<p style="margin: 0 0 0 0"><small>Creator: '+user+'</small></p>';
    html+='<p style="margin: 0 0 0 0"><small>CreateTime: '+item.create_time.replace(/T/, " ").replace(/\..+/, "")+'</small></p>';
    html+='<p style="margin: 0 0 0 0"><small>ReviseTime: '+item.last_time.replace(/T/, " ").replace(/\..+/, "")+'</small></p></div>';

    return html;
};

getUninvolved = function(item){
    var title,description;
    for(var title in item.cd){
        description = item["cd"][title]["_description"];
        if(description.length>140) description = description.substring(0,140) + "...";
        break
    };

    var html = '<div class="span6">';
    //html+='<h4><a href="/'+user+'/uninvolved/'+item.ccd_id+'">'+"Project:"+title+'</a></h3>';
    html+='<h4><a href="/'+user+'/intro/'+item.ccd_id+'">'+"Project:"+title+'</a></h3>';
    html+='<p>Info: '+description+'</p>';
    html+='<p style="margin: 0 0 0 0"><small>Creator: '+item.ccd_creator+'</small></p>';
    html+='<p style="margin: 0 0 0 0"><small>CreateTime: '+item.create_time.replace(/T/, " ").replace(/\..+/, "")+'</small></p>';
    html+='<p style="margin: 0 0 0 0"><small>ReviseTime: '+item.last_time.replace(/T/, " ").replace(/\..+/, "")+'</small></p></div>';

    //html+='<h4><a href="/'+user+'/uninvolved/'+item.ccd_id+'">'+"Project:"+title+'</a></h3>';
    //html+='<p>Info: '+description+'</p>';
    //html+='<p style="margin: 0 0 0 0"><small>Creator: '+item.ccd_creator+'</small></p>';
    //html+='<p style="margin: 0 0 0 0"><small>CreateTime: '+item.create_time.replace(/T/, " ").replace(/\..+/, "")+'</small></p>';
    //html+='<p style="margin: 0 0 0 0"><small>ReviseTime: '+item.last_time.replace(/T/, " ").replace(/\..+/, "")+'</small></p></div>';

    return html;
}
