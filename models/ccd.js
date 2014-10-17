var db = require('./db');
var mongodb = new db();
var ObjectID = require("mongodb").ObjectID;
var ccdIndex = require('../models/ccdIndex.js');
var increment = 0x1;
var regex = /^_/;
var logger = require('../models/logger.js');

//基本实现
exports.create= function createCD(data,callback){
    mongodb.getCollection('ccd',function(collection){
        //首先查找同名元素
        checkCDExistence(data.cd,collection,function(err,doc){
            if(err != null){
                return callback(err,doc);
            }
            else if(doc.length != 0){
                err = "already Exist";
                return callback(err,doc);
            }
            else{
                var ccdData = {
                    user: data.user,
                    cd : {}
                }
                ccdData["cd"][data.cd] = {
                    _description : data.description
                }

                collection.insert(ccdData, {safe: true}, function(err, doc) {
                    logger.generateLogData('INFO','ccd','insert',ccdData);
                    ccdIndex.create(doc[0],function(err2,doc2){
                        return callback(err, doc);
                    });
                });
            }
        });
    });
};

exports.addastest = function addastest(filter,callback){
    mongodb.getCollection('ccd',function(collection){
        collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {
            logger.generateLogData('INFO','ccd','update',[filter[0],{"$set" : filter[1]}]);
            return callback();
        });
    });
}

exports.remove = function removeCcd(filter,callback){
    mongodb.getCollection('ccd',function(collection){
        collection.remove(filter[0],function(err){
            if (err) {
                console.warn(err.message);
                return callback();
            }
            else {
                logger.generateLogData('INFO','ccd','remove',filter[0]);
                console.log('ccd successfully removed');
                ccdIndex.remove(filter[0],function(){
                    return callback();
                });
            }
        });
    });
};

exports.get = function getCD(filter,callback){
    mongodb.getCollection('ccd',function(collection){
        collection.findOne(filter, function(err, doc) {
            if(err != null){
                return callback(err, doc);
            }
            if(doc === null){
                err = "not Exist";
                return callback(err, doc);
            }
            return callback(err, doc);
        });
    });
};

exports.newElement = function newElement(filter,callback){
    mongodb.getCollection('ccd',function(collection){
        var elemID = generateID(filter.type,filter.value);
        //进行添加
        var newElement = {};
        newElement[filter.dir+"."+elemID] = generateElem(filter,1);

        collection.update({_id:filter._id},{"$set":newElement},{safe:true},function(err,count) {
            logger.generateLogData('INFO','ccd','update',[{_id:filter._id},{"$set":newElement}]);
            if (err) console.warn(err.message);
            else console.log('ccd successfully get newElement');
            return callback(err,filter.dir+"."+elemID);
        });
    });
}

exports.add= function addElem(filter,callback){
    mongodb.getCollection('ccd',function(collection){
        collection.update( filter[0],{"$inc":filter[1]},{safe:true},function(err,number) {
            logger.generateLogData('INFO','ccd','update',[filter[0],{"$inc":filter[1]}]);
            if (err) console.warn(err.message);
            else console.log('ccd successfully updated');
            callback(err,number);
        });
    });
};

exports.add2= function addElem2(filter,callback){
//用于同时添加两个元素的，针对那些名称加数据同时添加的情况
    var x = filter[0];
    var y ={};
    y[filter[1]]=1;
    y[filter[2]]=1;
    mongodb.getCollection('ccd',function(collection){
        collection.update( x,{"$inc":y},{safe:true},function(err,number) {
            logger.generateLogData('INFO','ccd','update',[x,{"$inc":y}]);
            if (err) console.warn(err.message);
            else console.log('ccd successfully updated');
            //console.log(number); //多个添加仍为1
            callback(err,number);
        });
    });
};

exports.ref= function refElem(filter,subFilter,callback){
//去引用，包括底层元素的自动去除
    console.log("==================================");
    mongodb.getCollection('ccd',function(collection){
        collection.update(filter,{"$inc":subFilter},{safe:true},function(err,number) {
            logger.generateLogData('INFO','ccd','update',[filter,{"$inc":subFilter}]);
            if (err) console.warn(err.message);
            else console.log('ccd successfully deleted');
            console.log(number)
            return callback(err,number);
        });
    });
};

exports.generateSubFilter = function generateSubFilter(sub,callback){
    var subFilter=[];
    //var preFilter=".";
    var preFilter="";
    generateFilter(sub,preFilter,subFilter);
    callback(subFilter);
    return subFilter;
};

generateFilter = function(sub,preFilter,subFilter){
    if(typeof sub === 'string') return;
    for(var key in sub){
        if(key === '_nor'){
            subFilter[subFilter.length] = preFilter+key
        }
        else{
            generateFilter(sub[key],preFilter+key+".",subFilter);
        }
    }
}
//New One
checkCDExistence = function(_cdName,collection,callback){
    return callback(null,[]);
    //验证通过
    /*
    collection.find({"$where":function(){
        for(var cdName in this.cd){
            if(_cdName === cdName) {
                return true;
            }
        };
        return false;
    }}).toArray(function(err,doc){
        return callback(err,doc);
    });
    */
};

exports.generateID = function(type,typeValue,dir){
    return generateID(type,typeValue,dir);
    //要对generate的id进行处理
    //    var id = generateID(type,typeValue,dir);
    //logger.generateLogData('INFO','icd','update',[id,{"$set":element}]);
}

generateID = function generateID(type,typeValue,dir){
    //typeID+time+increment //projecetHash本来就是属于ccdID所以不再需要
    //time+increment属于内部ID，当为RelationShip时，采用合并的方式
    //十六位
    var time = parseInt(new Date().getTime()/1000).toString(16);
    //两位
    var typeID = getTypeID(type);
    //八位
    if(!typeValue) typeValue = time;
    var md5 = require('crypto').createHash('md5');
    var typeValueID = md5.update(typeValue).digest('hex').substring(0,7);
    //两位
    var incrementString = increment.toString(16);
    for(var length=2 - incrementString.length;length>0;length--){
        incrementString = "0"+incrementString;
    }
    //三位
    var ran = (Math.ceil(Math.random()*256)%256).toString(16);
    for(var length=2 - ran.length;length>0;length--){
        ran = "0"+ran;
    }
    var elemID = typeID + typeValueID + incrementString + time + ran;
    increment = (increment+1) % 0x256;

    return elemID;
};

generateElem = function generateElem(filter,nor){
    if(filter.dir === "relation") return generateRelation(filter,nor);
    var elem = {};
    elem[filter.value] ={_nor:nor};

    generateSubType(filter.type,elem);
    return elem;
};

generateRelation = function generateRelation(filter,nor){
    var elem = {
        _value  : filter.type,
        _nor    : 1,
        class1 : {},
        class2 : {},
        multiplicity1 : {},
        multiplicity2 : {}
    }
    elem["class1"][filter.classID1] = {_value : filter.value1};
    elem["class2"][filter.classID2] = {_value : filter.value2};
    return elem;
}

generateSubType = function generateSubType(type,elem){
    switch(type){
        case 'cd': elem['description']={};
            break;
        case 'description': ;
            break;
        case 'class':
            elem['className']={};
            elem['attribute']={};
            break;
        case 'className': ;
            break;
        case 'attribute':
            elem['attributeName']={};
            elem['type']={};
            elem['multiplicity']={};
            elem['visibility']={};
            elem['default']={};
            elem['propertyStrings']={};
            elem['constraint']={};
            break;
        case 'relation':
            elem['class1']={};
            elem['class2']={};
            elem['multiplicity1']={};
            elem['multiplicity2']={};
            break;
        case 'generalization': ;
            break;
        case 'association': ;
            break;
        case 'aggregation': ;
            break;
        case 'composition': ;
            break;
        default: ;
            break;
    }
    return elem;
}

getTypeID = function getTypeID(name){
    //only classs and relation are useful
    var type;
    switch(name){
        case 'cd': type = 0x11;
            break;
        case 'description': type = 0x12;
            break;
        case 'cd': type = 0x11;
            break;
        case 'class': type = 0x21;
            break;
        case 'className': type = 0x22;
            break;
        case 'attribute': type = 0x31;
            break;
        case 'attributeName': type = 0x32;
            break;
        case 'attributeElem': type = 0x31;
            break;
        case 'type':
        case 'multiplicity':
        case 'visibility':
        case 'default':
        case 'propertyStrings':
        case 'constraint':
            type = 0x33;
            break;
        case 'generalization': type = 0x41;
            break;
        case 'association': type = 0x42;
            break;
        case 'aggregation': type = 0x43;
            break;
        case 'composition': type = 0x44;
            break;
        case 'relationType': type = 0x61;
        default: type = 0x00;
            break;
    };
    return type;
}

//用于标记当前插入值的引用次数
exports.setNor = function(ccd,dir){
    for(var key in dir){
        var splitedKey = key.split(".");
        var root = ccd;
        for(var j=0;j<splitedKey.length;j++){
            root = root[splitedKey[j]];
            if(root === undefined) break;
        }
        if(root === undefined) {
            dir[key] = 1;
        }else{
            dir[key] = root+1;//以为之后ccd要添加
        }

    }
}