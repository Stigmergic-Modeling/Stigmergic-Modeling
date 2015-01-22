var Icd = require('./icd.js');
var ccd = require('./ccd.js');
var regex = /^_/;

var count = 0;
exports.generateItem = function(source,dir,type,ccdID,icdID,callback){
    console.log("generateItem")
    generateItem(source,dir,type,ccdID,icdID,function(){
        console.log("generateItem over");
        return callback();
    })
}

generateItem = function(source,dir,type,ccdID,icdID,callback){
    //return callback();
    //count用于记录value的个数，当可能存在value则进行递归，否则回调
    count++;    //程序进行中所以阻塞
    console.log("generateItem_psps");
    console.log(source);
    console.log(dir);
    console.log(type);
    console.log(ccdID);
    console.log(icdID);
    if( source["_value"]!= undefined) {
        console.log("generateItem_1");
        var ccdFilter = {
            _id     : ccdID,
            dir     : dir,
            type    : type,
            value   : source["_value"]
        };
        ccd.newElement(ccdFilter,function(err,p_dir){
            var icdFilter = [];
            icdFilter[0] = {_id:icdID};
            icdFilter[1] = {};
            icdFilter[1][p_dir] = {_value:source["_value"]};
            console.log("[[[[[[[[[[[[[[[[[");
            console.log(icdFilter);
            Icd.add(icdFilter,function(err,number){
                count--; //存在
                console.log("count="+count);
                if(count === 0) {return callback();}
            });
            //getType(source,p_dir,type,ccdID,icdID);
            for(var key in source){
                if(regex.test(key) === false){
                    //新的一层type
                    var tmp_dir;
                    if(p_dir != null)  tmp_dir = p_dir+"."+key;
                    else tmp_dir = key;
                    for(var keyID in source[key]){
                        count++;
                        generateItem(source[key][keyID],tmp_dir,key,ccdID,icdID,function(){
                            return callback();
                        });
                    }
                }
            }
            console.log("count="+count);
        });
    }else{
        //getType(source,dir,type,ccdID,icdID);
        console.log("generateItem_2");
        for(var key in source){
            if(regex.test(key) === false){
                //新的一层type
                var tmp_dir;
                if(dir != null)  tmp_dir = dir+"."+key;
                else tmp_dir = key;
                for(var keyID in source[key]){
                    count++;
                    generateItem(source[key][keyID],tmp_dir,key,ccdID,icdID,function(){
                        return callback();
                    });
                }
            }
        }
        console.log("count="+count);
    };
    count--;  //完成解阻塞

};

getType = function(source,dir,type,ccdID,icdID){
    for(var key in source){
        if(regex.test(key) === false){
            //新的一层type
            if(dir != null)  var p_dir = dir+"."+key;
            else p_dir = key;
            for(var keyID in source[key]){
                count++;
                generateItem(source[key][keyID],p_dir,key,ccdID,icdID,function(){
                    return callback();
                });
            }
        }
    }
}
exports.generateRelationElem = function(source,ccdID,icdID,callback){
    generateRelationElem(source,ccdID,icdID,function(){
        return callback();
    })
}
generateRelationElem = function(source,ccdID,icdID,callback){
    Icd.get({_id:icdID},function(err,doc){ //莫名其妙
        //Icd.get({user:user},function(err,doc){
        //获取元素进行查找
        var icdDoc = doc;
        for(var relationID in source){
            var ccdFilter = {
                _id     : ccdID,
                dir     : "relation",
                type    : source[relationID]["_value"],
                value   : source[relationID]["class1"] + source[relationID]["class2"],
                value1   : source[relationID]["class1"],
                value2   : source[relationID]["class2"]
            };
            var multiplicity = {
                m1 : source[relationID]["multiplicity1"],
                m2 : source[relationID]["multiplicity2"]
            }
            console.log(ccdFilter);
            console.log(multiplicity);

            for(var classID in icdDoc["class"]){
                for(var classNameID in icdDoc["class"][classID]["className"]){
                    console.log("classID="+classID+"  classNameID="+classNameID);
                    if(icdDoc["class"][classID]["className"][classNameID]["_value"] === ccdFilter.value1){
                        ccdFilter.classID1 = classNameID;
                    }else if(icdDoc["class"][classID]["className"][classNameID]["_value"] === ccdFilter.value2){
                        ccdFilter.classID2 = classNameID;
                    }
                }
            }
            console.log(ccdFilter);
            ccd.newElement(ccdFilter,function(err,p_dir){
                //icd的引用
                var icdFilter = [];
                icdFilter[0] = {_id:icdID};
                icdFilter[1] = {};
                icdFilter[1][p_dir] = {
                    _value:source[relationID]["_value"],
                    class1 : {},
                    class2 : {}
                };
                icdFilter[1][p_dir]["class1"][ccdFilter.classID1] = {_value:ccdFilter.value1};
                icdFilter[1][p_dir]["class2"][ccdFilter.classID2] = {_value:ccdFilter.value2};

                Icd.add(icdFilter,function(err,number){
                });

                var ccdFilter1 = {
                    _id     : ccdID,
                    dir     : p_dir+".multiplicity1",
                    type    : "multiplicity1",
                    value   : multiplicity.m1
                };
                var ccdFilter2 = {
                    _id     : ccdID,
                    dir     : p_dir+".multiplicity2",
                    type    : "multiplicity2",
                    value   : multiplicity.m2
                };
                var count = 2;
                ccd.newElement(ccdFilter1,function(err,p_dir){
                    var icdFilter = [];
                    icdFilter[0] = {_id:icdID};
                    icdFilter[1] = {};
                    icdFilter[1][p_dir] = {_value:multiplicity.m1};
                    Icd.add(icdFilter,function(err,number){
                        count-- ;
                        if(count === 0  )return callback();
                    });
                });
                ccd.newElement(ccdFilter2,function(err,p_dir){
                    var icdFilter = [];
                    icdFilter[0] = {_id:icdID};
                    icdFilter[1] = {};
                    icdFilter[1][p_dir] = {_value:multiplicity.m2};
                    Icd.add(icdFilter,function(err,number){
                        count-- ;
                        if(count === 0  )return callback();
                    });
                });

            });
        }
    });
};