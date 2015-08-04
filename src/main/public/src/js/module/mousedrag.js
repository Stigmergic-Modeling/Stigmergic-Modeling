define(function(require, exports, module) {

    module.exports = startDrag;

    /**
     * 鼠标点击拖拽 (based on a method from http://www.zhangxinxu.com/)
     */

    var params = {
        left: 0,
        top: 0,
        currentX: 0,
        currentY: 0,
        flag: false
    };

    // 获取相关 CSS 属性
    function getCss(elem, key) {
        return elem.currentStyle ? elem.currentStyle[key] : window.getComputedStyle(elem)[key];
    }

    // 拖拽的实现
    function startDrag(bar, target) {
        if (getCss(target, "left") !== "auto") {
            params.left = getCss(target, "left");
        }
        if (getCss(target, "top") !== "auto") {
            params.top = getCss(target, "top");
        }

        bar.onmousedown = function(event) {
            params.flag = true;
            if (!event) {
                event = window.event;

                //防止IE文字选中
                bar.onselectstart = function() {
                    return false;
                }
            }
            var e = event;
            params.currentX = e.clientX;
            params.currentY = e.clientY;
        };

        bar.onmouseup = function() {
            params.flag = false;
            if (getCss(target, "left") !== "auto") {
                params.left = getCss(target, "left");
            }
            if (getCss(target, "top") !== "auto") {
                params.top = getCss(target, "top");
            }
            //console.log(params);
        };

        document.onmousemove = function(event) {  // 这里如果把监听器写在 bar 上的话，拖拽速度快时容易“跟丢”（但这里用 DOM0 方式在 document 上加监听器的方式不可取）
            var e = event ? event: window.event;
            if (params.flag) {
                var nowX = e.clientX, nowY = e.clientY;
                var disX = nowX - params.currentX, disY = nowY - params.currentY;
                target.style.left = parseInt(params.left) + disX + "px";
                target.style.top = parseInt(params.top) + disY + "px";
                //console.log('we are moving')
            }
        }
    }

});

