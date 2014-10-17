var zoom = 1;

zoomWindow = function(){
    var widthTmp = document.body.clientWidth;
    zoom = widthTmp/(1280/zoom);
    document.body.style.zoom = zoom;

    //zoom = window.outerWidth/1280
    //window.innerWidth = window.outerWidth/zoom;
    //alert(window.innerWidth)
    //alert(window.outerWidth)
    //window.innerWidth = 1280;
    //window.outerWidth = 1280;
    //alert(window.innerWidth)
    //alert(window.outerWidth)
    //document.body.width = 1280;
    //window.innerWidth = 600;
    //document.documentElement.clientWidth = 600;
    //document.documentElement.offsetWidth = 600;
};
