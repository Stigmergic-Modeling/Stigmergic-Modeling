var EventProxy = require('eventproxy');
var Icd = require('../models/icd.js');

module.exports = function(){
    var obj = new EventProxy();
    var queue = [];

    obj.bind("event", function() {
        if(queue.length === 0) return;



        Icd.create(collection,cd_create,function(err,doc){
            console.log("----------123");
            obj.trigger("event2");
        });
    });

    this.enqueue = function(type,func,data){
        var newEvent = {
            type : type,
            func : func,
            data : data
        };
        queue.push(newEvent);
    }
};