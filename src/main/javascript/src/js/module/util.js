define(function (require, exports, module) {

    /**
     * 无冗余操作的链式继承
     * @param subType
     * @param superType
     */
    exports.extend = function (subType, superType) {
        var F = function () {};
        F.prototype = superType.prototype;
        subType.prototype = new F();
        subType.prototype.constructor = subType;
    };

    /**
     * 使某对象具备收发自定义事件的能力 （learned from JavaScript Patterns）
     * @param o
     */
    exports.makePublisher = function (o) {

        /**
         * 监听、发射自定义事件的功能函数
         * @type {{subscribers: {any: Array}, on: Function, off: Function, fire: Function, visitSubscribers: Function}}
         */
        var publisher = {
            subscribers: {
                any: []
            },
            on: function (type, fn, context) {  // 被监听（当前对象的某个行为被某个函数所订阅）
                type = type || 'any';
                fn = typeof fn === 'function' ? fn : context[fn];

                if (typeof this.subscribers[type] === 'undefined') {
                    this.subscribers[type] = [];
                }
                this.subscribers[type].push({fn: fn, context: context || this});
            },
            off: function (type, fn, context) {  // 取消监听
                this.visitSubscribers('unsubscribe', type, fn, context);
            },
            fire: function (type, publication) {  // 发射  ！注意，若希望传递单数组参数，则需要额外包裹一层[]
                this.visitSubscribers('publish', type, publication);
            },
            visitSubscribers: function (action, type, arg, context) {  // 辅助函数
                var pubtype = type || 'any',
                        subscribers = this.subscribers[pubtype],
                        i,
                        max = subscribers ? subscribers.length : 0;
                for (i = 0;  i < max; i++) {
                    if (action === 'publish') {
                        if (!Array.isArray(arg)) {  // 若参数不是数组，则将参数放入数组
                            arg = [arg];
                        }
                        subscribers[i].fn.apply(subscribers[i].context, arg);  // 用apply可以传递任意多参数，但需要额外包裹一层[]
                    } else {
                        if (subscribers[i].fn === arg && subscribers[i].context === context) {
                            subscribers.splice(i, 1);
                        }
                    }
                }
            }
        };

        var key;
        for (key in publisher) {
            if (publisher.hasOwnProperty(key) && typeof publisher[key] === 'function') {
                o[key] = publisher[key];
            }
        }
        o.subscribers = {any: []};
    };

});

