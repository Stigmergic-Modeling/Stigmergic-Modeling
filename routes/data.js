var Icd = require('../models/icd.js');
var Ccd = require('../models/ccd.js');
var icdIndex = require('../models/icdIndex.js');
var ccdIndex = require('../models/ccdIndex.js');
var operationMeasure = require('../models/operationMeasure.js');
var ObjectID = require("mongodb").ObjectID;
var generate = require('../models/generate.js');

var IcdAttributeSort = require('../models/icdAttributeSort.js');
//var logger = require('../models/logger.js').getLogger('INFO');
//icd
exports.icd = function(req, res) {
    console.log("dataIcd");
    //console.log(req.body.user);
    //console.log(req.body.id)
    //logger.info("hahhahahhahhahaahah");
    var filter = {};
    filter["user"] = req.body.user;
    filter["ccd_id"] = ObjectID(req.body.id);
    Icd.get(filter,function(err,doc){
        console.log(doc);
        res.send({icd:doc});
    });
};

exports.icdElement = function(req, res) {
    console.log("icdElem")
    switch(req.body['process']){
        case 'add':
            icdAdd(req,res);
            break;
        case 'cite':
            icdCite(req,res);
            break;
        case 'remove':
            icdRemove(req,res);
            break;
        case 'revise':
            icdRevise(req,res);
            break;
        case 'multiCite':
            icdMultiCite(req,res);
            break;
        case 'multiRevise':           //multi指的是单个元素就是多重的需要进行层次遍历才能完成添加，故与sub分离的revise方法不同
            icdMultiRevise(req,res);
            break;
    }
};

icdAdd = function(req,res){
    console.log("Icd add");
    //更合理的应当Check一下数据库，此处先简略操作，同时因为我前台每次点击都会更新CCD信息，所以基本能够保持一致。
    var info = Icd.getInfo(req.body['type'],req.body['statusArray']);
    var id = Ccd.generateID(req.body['type'],req.body['data']['new']['value'],info.dir);
    //建立查询元素
    var filter = [{_id:info.id},{}];
    //class&relation
    filter[1][info.dir+ '.'+id+'._nor'] = 1;
    filter[1][info.dir+ '.'+id+'.'+info.subType+'.'+req.body['data']['new']['value']+'._nor'] = 1;
    //添加
    var citeNum = 1;
    if(req.body['type'] === 'attribute'){
        for(var key in req.body['data']['sub']){
            filter[1][info.dir+ '.'+id+'.'+key+'.'+req.body['data']['sub'][key]+'._nor'] = 1;
            citeNum++;
        }
    }
    console.log("filter&&&&&&&&&&&&&")
    console.log(filter);
    console.log(info);
    console.log(id)
    Icd.add(filter,function(err,count){
        Icd.get(filter[0],function(err,doc){
            res.send({count:count,icd:doc});
            operationMeasure.operationNew(info.id,function(err,number){
            });
            //filter[0] = {'_id':ObjectID(req.body['statusArray']['ccd_id'])};
            //Ccd.add(filter,function(err,count){});
            Ccd.ref( {'_id':ObjectID(req.body['statusArray']['ccd_id'])},filter[1],function(err,number){
            });
        });
    });
};


icdCite = function(req,res){
    console.log("Icd cite");
    //更合理的应当Check一下数据库，此处先简略操作，同时因为我前台每次点击都会更新CCD信息，所以基本能够保持一致。
    var info = Icd.getInfo(req.body['type'],req.body['statusArray']);
    //建立查询元素
    var filter = [{_id:info.id},{}];
    var citeNum = 1;
    switch(req.body['type']){
        case 'class':
        case 'attribute':
        case 'relation':
            filter[1][info.dir+ '.'+req.body['data']['new']['id']+'._nor'] = 1;
            filter[1][info.dir+ '.'+req.body['data']['new']['id']+'.'+info.subType+'.'+req.body['data']['new']['value']+'._nor'] = 1;
            break;
        default :
            filter[1][info.dir+ '.'+req.body['data']['new']['id']+'._nor'] = 1;
            break;
    }


     if(req.body['type'] === 'attribute'){
         for(var key in req.body['data']['sub']){
             filter[1][info.dir+ '.'+req.body['data']['new']['id']+'.'+key+'.'+req.body['data']['sub'][key]+'._nor'] = 1;
             citeNum++;
         }
     }


    Ccd.get({_id:ObjectID(req.body['statusArray']['ccd_id'])},function(err,doc){
        var ccdFilter = {};
        for(var key in filter[1]){
            ccdFilter[key] = filter[1][key];
        }
        Ccd.setNor(doc,filter[1]);
        console.log(filter);
        Icd.add(filter,function(err,count){
            Icd.get(filter[0],function(err,doc){
                operationMeasure.operationCite(info.id,citeNum,function(err,number){
                });
                res.send({count:count,icd:doc});
                //filter[0] = {'_id':ObjectID(req.body['statusArray']['ccd_id'])};
                //Ccd.add(filter,function(err,count){});
                Ccd.ref( {'_id':ObjectID(req.body['statusArray']['ccd_id'])},ccdFilter,function(err,number){
                });
            });
        });
    })
}

icdRemove = function(req,res){
    console.log("Icd remove");
    console.log(req.body['statusArray']);
    var removeType = req.body['type'];
    req.body['statusArray'][removeType] = req.body['data']['new'];  //如何执行存在疑问

    var info = Icd.getInfo(req.body['type'],req.body['statusArray']);
    var filter = [{_id:info.id},{}];

    if(removeType == 'cd'){
        console.log(req.session.user.mail)
        filter[2] = {user: req.session.user.mail}
        filter[3] = {"$unset":{}};
        filter[3]["$unset"][req['body']['statusArray']["ccd_id"]] = "";
        Icd.remove(filter,function(){
            return res.send({});
        });
    }
    else{
        switch(removeType){
            case 'attributeElem' :
                filter[1][info.dir] = 1;
                break;
            default:
                filter[1][info.dir+ '.'+req.body.data.new.id] = 1;
                break
        }
        //后面的number是几都不所谓
        console.log("filter&&&&&&&&&&&&&")
        console.log(filter);
        console.log(removeType)
        Icd.delete(filter,function(err,count){
            Icd.get(filter[0],function(err,doc){
                return res.send({count:count,icd:doc});
            })
        });
    };
    //ccd的操作可以与icd同步执行
    console.log("req.body['data']['sub']");
    console.log(req.body['data']['sub']);
    //req.body['data']['sub'] 结构为dir+id+sub

    //删除之前进行计算
    Ccd.generateSubFilter(req.body['data']['sub'],function(subFilter){
        console.log("subFilter");
        console.log(subFilter);
        var ccdFilter = {};
        var preFilter = "";
        if(removeType != 'cd'){
            preFilter = info.dir+"."+req.body.data.new.id+".";
        }//else preFilter = ""
        for(var i=0;i<subFilter.length;i++){
            ccdFilter[preFilter+subFilter[i]] = -1;
        }
        operationMeasure.operationDelete(removeType,ObjectID(req.body['statusArray']._id),req.body['data']['sub'],subFilter,ObjectID(req.body['statusArray'].ccd_id),ccdFilter,function(){
            console.log("ccdRemove Filter");
            console.log(ccdFilter);
            Ccd.ref( {'_id':ObjectID(req.body['statusArray']['ccd_id'])},ccdFilter,function(err,number){
            });
        });
    });
};


icdRevise = function(req,res){
    console.log("Icd revise");
    var reviseType = req.body['type'];
    var info = Icd.getInfo(req.body['type'],req.body['statusArray']);
    var filter = [{_id:info.id},{}];

    switch(reviseType){
        case '_description':
            Icd.generateElement(req.body['type'],req.body['statusArray'],null,req.body['data']['sub'],function(id,element){
                //console.log(element);
                Icd.copy(id,element,function(err,count){
                    Icd.get(id,function(err,doc){
                        res.send({count:count,icd:doc});
                    })
                });
            });
            break;

        default://cd class relation attribute
            if(req.body['data']['old'] != ""){      //根据老的添加逻辑中的多层添加，新逻辑中可能并不需要
                filter[1][info.dir+ '.'+req.body.data.old] = 1;
                console.log("filter&&&&&&&&&&&&&")
                console.log(filter);
                Icd.delete(filter,function(err,count){
                    filter[1] = {};
                    filter[1][info.dir+ '.'+req.body.data.new+'._nor'] = 1;
                    console.log("filter&&&&&&&&&&&&&")
                    console.log(filter);
                    Icd.add(filter,function(err,count){
                        Icd.get(filter[0],function(err,doc){
                            res.send({count:count,icd:doc});
                        });
                    });
                });
                Ccd.generateSubFilter(req.body['data']['sub'],function(subFilter){
                    console.log("subFilter");
                    console.log(subFilter);
                    var ccdFilter = {};
                    var preFilterOld = "";
                    var preFilterNew = "";
                    if(reviseType != 'cd'){
                        preFilterOld = info.dir+"."+req.body.data.old+".";
                        preFilterNew = info.dir+"."+req.body.data.new+".";
                    }//else preFilter = ""
                    for(var i=0;i<subFilter.length;i++){
                        ccdFilter[preFilterOld+subFilter[i]] = -1;
                        ccdFilter[preFilterNew+subFilter[i]] = 1;
                    }

                    operationMeasure.operationReveise(reviseType,ObjectID(req.body['statusArray']._id),req.body['data']['sub'],subFilter,ObjectID(req.body['statusArray'].ccd_id),ccdFilter,function(){
                        console.log("ccdRemove Filter");
                        console.log(ccdFilter);
                        //delete的操作和xxx的操作。
                        Ccd.ref( {'_id':ObjectID(req.body['statusArray']['ccd_id'])},ccdFilter,function(err,number){
                        });
                    })
                });
            }
            //完成一次引用
            //给一个copy函数？？？ 由于copy过程中，数据数据可能丢失
            // 到时候再修改吧，当前的仅能完成单层次的修改。
    }
};

icdMultiCite = function(req,res){
    console.log("Icd multiCite");
    //更合理的应当Check一下数据库，此处先简略操作，同时因为我前台每次点击都会更新CCD信息，所以基本能够保持一致。
    var reviseType = req.body['type'];
    var info = Icd.getInfo(req.body['type'],req.body['statusArray']);
    //建立查询元素
    var filter = [{_id:info.id},{}];
    console.log("info&&&&&&&&&&&&&")
    console.log(info);

    if(req.body['data']['new']['id'] === '&default'){
        req.body['data']['new']['id'] =  Ccd.generateID(req.body['type'],req.body['data']['new']['value'],info.dir);
    }
    console.log("req.body['data']['new']&&&&&&&&&&&&&")
    console.log(req.body['data']['new']);
    console.log(req.body['data']['new']['sub']['order']);
    //it really does is change json into strings
    Ccd.generateSubFilter(req.body['data']['new']['sub'],function(subFilter){
        console.log("subFilter");
        console.log(subFilter);

        var ccdFilter = {};
        var preFilter = "";
        if(reviseType != 'cd'){
            preFilter = info.dir+"."+req.body.data.new.id+".";
        }//else preFilter = ""
        for(var i=0;i<subFilter.length;i++){
            ccdFilter[preFilter+subFilter[i]] = 1;
        }
        console.log("ccdRemove Filter");
        console.log(ccdFilter);
        Icd.add( [{'_id':info.id},ccdFilter],function(err,number){
            Icd.get(filter[0],function(err,doc){res.send({count:number,icd:doc});});
        });
        operationMeasure.operationMultiCite(ObjectID(req.body['statusArray']._id),subFilter,function(){
            Ccd.ref( {'_id':ObjectID(req.body['statusArray']['ccd_id'])},ccdFilter,function(err,number){
            });
        })
    });

};

icdMultiRevise = function(req,res){
    console.log("Icd multiRevise");
    //更合理的应当Check一下数据库，此处先简略操作，同时因为我前台每次点击都会更新CCD信息，所以基本能够保持一致。
    var reviseType = req.body['type'];
    if(reviseType = 'relationType') req.body['statusArray']['relationType'].type = req.body['data']['old'].type;
    //
    var info = Icd.getInfo(req.body['type'],req.body['statusArray']);
    //建立查询元素
    var filter = [{_id:info.id},{}];
    if(req.body['data']['new']['id'] === '&default'){
        req.body['data']['new']['id'] =  Ccd.generateID(req.body['type'],req.body['data']['new']['value'],info.dir);
    }
    console.log("info&&&&&&&&&&&&&")
    console.log(info);

    console.log("req.body['data']['old']&&&&&&&&&&&&&")
    console.log(req.body['data']['old']);

    console.log("req.body['data']['new']&&&&&&&&&&&&&")
    console.log(req.body['data']['new']);
    //it really does is change json into strings

    filter[1][info.dir+ '.'+req.body.data.old.id] = -1;
    console.log("filter&&&&&&&&&&&&&")
    console.log(filter);
    Icd.delete(filter,function(err,count){
        //引用一定要在内部，因为可能两者是一样的。。
        if(reviseType = 'relationType') req.body['statusArray']['relationType'].type = req.body['data']['new'].type;
        var info = Icd.getInfo(req.body['type'],req.body['statusArray']);
        Ccd.generateSubFilter(req.body['data']['new']['sub'],function(subFilter){
            console.log("subFilter");
            console.log(subFilter);
            var ccdFilter = {};
            var preFilter = "";
            if(reviseType != 'cd'){
                preFilter = info.dir+"."+req.body.data.new.id+".";
            }//else preFilter = ""
            for(var i=0;i<subFilter.length;i++){
                ccdFilter[preFilter+subFilter[i]] = 1;
            }
            console.log("ccdRemove Filter");
            console.log(ccdFilter);
            Icd.add( [{'_id':info.id},ccdFilter],function(err,number){
                Icd.get(filter[0],function(err,doc){res.send({count:number,icd:doc});});
            });
            operationMeasure.operationMultiCite(ObjectID(req.body['statusArray']._id),subFilter,function(){
                Ccd.ref( {'_id':ObjectID(req.body['statusArray']['ccd_id'])},ccdFilter,function(err,number){
                });
            })
        });
    });

    //去引用
    Ccd.generateSubFilter(req.body['data']['old']['sub'],function(subFilter){
        console.log("subFilter");
        console.log(subFilter);
        var ccdFilter = {};
        var preFilter = "";
        if(reviseType != 'cd'){
            preFilter = info.dir+"."+req.body.data.old.id+".";
        }//else preFilter = ""
        for(var i=0;i<subFilter.length;i++){
            ccdFilter[preFilter+subFilter[i]] = -1;
        }
        console.log("ccdRemove Filter");
        console.log(ccdFilter);
        operationMeasure.operationReveise(reviseType,ObjectID(req.body['statusArray']._id),req.body['data']['old']['sub'],subFilter,ObjectID(req.body['statusArray'].ccd_id),ccdFilter,function(){
            Ccd.ref( {'_id':ObjectID(req.body['statusArray']['ccd_id'])},ccdFilter,function(err,number){
            });
        });
    });
};

//ccd
exports.ccd = function(req, res) {
    console.log("dataCcd");
    Ccd.get({_id:ObjectID(req.body['id'])},function(err,doc){
        res.send({ccd:doc});
    });
};

exports.index = function(req,res){
    console.log("dataIndex");
    var filter = {};
    var icd_index=[];
    var ccd_index;
    filter["user"] = req.body.user;

    icdIndex.get(filter,function(err,doc){
        var exist = [];
        for(var i= 0;i<doc.length;i++){}
        for(var key in doc[0]){
            if(key != 'user' && key != '_id'){
                console.log("push key");
                exist.push(ObjectID(key));
                icd_index.push(doc[0][ObjectID(key)]);
            }
        }

        console.log(exist);
        var filter = {};
        filter["ccd_id"] ={};
        filter["ccd_id"]["$nin"] = exist;

        ccdIndex.get(filter,function(err,doc){
            ccd_index = doc;
            console.log("*************");
            console.log(icd_index);
            console.log("*************");
            console.log(ccd_index);
            //console.log(icd_index[0].last_time.toDateString());
            res.send({icd_index:icd_index,ccd_index:ccd_index});
        });
    });
};

exports.intro = function(req,res){
    console.log("dataIndex");
    var filter = {};
    var icd_index=[];
    var ccd_index;
    filter["user"] = req.body.user;

    icdIndex.get(filter,function(err,doc){
        var exist = [];
        for(var i= 0;i<doc.length;i++){}

        var key = ObjectID(req.body.ccd_id)
        exist.push(key);
        icd_index.push(doc[0][key]);

        console.log(exist);
        var filter = {};
        filter["ccd_id"] ={};
        filter["ccd_id"]["$in"] = exist;

        ccdIndex.get(filter,function(err,doc){
            ccd_index = doc;
            res.send({icd_index:icd_index,ccd_index:ccd_index});
        });
    });
};

exports.icdOperationValue = function(req, res) {
    operationMeasure.getOperationValue(ObjectID(req.body['statusArray']._id),ObjectID(req.body['statusArray'].ccd_id),function(doc){
        console.log(doc);
        res.send(doc);
    })
}


exports.icdAttributeSort = function(req, res) {
    console.log("icdAttributeSort")
    switch(req.body['process']){
        case 'add':
            icdAttributeSortAdd(req,res);
        case 'get':
            icdAttributeSortGet(req,res);
            break;
        case 'revise':
            icdAttributeSortRevise(req,res);
            break;
    }
};

icdAttributeSortAdd = function(req,res){
    console.log("icdAttributeSortAdd");
    var info = Icd.getInfo(req.body['type'],req.body['statusArray']);   //type = attributeSort
    //建立查询元素
    var filter = [{icd_id:info.id},{}];
    filter[1][info.dir] = [];
    IcdAttributeSort.add(filter,function(err,count){
        res.send({});
    });
}

icdAttributeSortGet = function(req,res){
    console.log("icdAttributeSortGet");
    var info = Icd.getInfo(req.body['type'],req.body['statusArray']);   //type = attributeSort
    //建立查询元素
    var filter = [{icd_id:info.id},{}];
    filter[1][info.dir] = [ ];
    IcdAttributeSort.get(filter,function(err,doc){
        if(err!=null || doc===null) var sortList=[];
        else var sortList = doc;

        res.send({sortList:sortList});
    });
}

icdAttributeSortRevise = function(req,res){
    console.log("icdAttributeSortRevise");
    var info = Icd.getInfo(req.body['type'],req.body['statusArray']);   //type = attributeSort
    //建立查询元素
    var filter = [{icd_id:info.id},{}];
    console.log(req.body.sortList)
    filter[1][info.dir] = req.body.sortList;
    console.log(filter);
    IcdAttributeSort.revise(filter,function(err,doc){
        res.send({});
    });
}