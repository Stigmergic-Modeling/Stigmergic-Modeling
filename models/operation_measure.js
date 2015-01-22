var db = require('./db');
var mongodb = new db();
var ObjectID = require("mongodb").ObjectID;
var Icd = require('./icd.js');
var Ccd = require('./ccd.js');

var logger = require('./logger.js');

//当前插入方式举例：插入前为3，插入后为4
//则，插入时位置信息为4，删除时位置信息为4
var m_weight = {
    NEW : -2,
    SELECT : -1,
    CITED : 2
}

//inc函数
revise= function(filter,callback){
    console.log(filter[1])
    mongodb.getCollection('icd',function(collection){
        collection.update(filter[0],{"$inc":filter[1]},{safe:true},function(err,number) {
            logger.generateLogData('INFO','icd','valueRevise',[filter[0],{"$inc":filter[1]}]);
            if (err) console.warn(err.message);
            else console.log('icd value successfully valueRevised');
            callback(err,number);
        });
    });
};

//NEW
exports.operationNew = function operationNew(id,callback){
    var filter = [
        {_id : id},
        {_preOperationValue: m_weight.NEW}
    ];

    revise(filter,function(err,number){
        return callback(err,number);
    })
}


//SELECT,暂时没有记录操作次数
exports.operationCite = function operationCite(id,num,callback){
    if(num === undefined) num=1;
    var filter = [
        {_id : id},
        {_preOperationValue: m_weight.SELECT*num}
    ];

    revise(filter,function(err,number){
        return callback(err,number);
    })
}

exports.operationMultiCite = function operationMultiCite(icd_id,icd_sub,callback){
    var filter = [
        {_id : icd_id},
        {_preOperationValue: icd_sub.length * m_weight.SELECT}
    ];

    revise(filter,function(err,number){
        return callback(err,number);
    })
}

//CITED
//No action

//DELETE
exports.operationDelete = function operationDelete(removeType,icd_id,icd_dir,icd_sub,ccd_id,ccd_sub,callback){
    if(removeType === 'cd') return callback(null,0);
    var value = 0;
    var data = {};

    Ccd.get({_id:ccd_id},function(err,doc){
        data.icd = icd_dir;
        for(var i=0;i<icd_sub.length;i++){
            icd_sub[i] = icd_sub[i].split(".");
            var base = data.icd;
            for(var j=0;j<icd_sub[i].length;j++){
                base = base[icd_sub[i][j]];
            }
            console.log("BASE :"+base);
            value = value - base;
        }

        data.ccd = doc;
        for(var key in ccd_sub){
            key = key.split(".");
            var top = data.ccd;
            for(var j=0;j<key.length;j++){
                top = top[key[j]];
            }
            console.log("Top :"+top);
            value = value + top;
        }

        var filter = [
            {_id : icd_id},
            {_preOperationValue: value * m_weight.CITED}
        ];
        console.log("Value :"+value);
        revise(filter,function(err,number){
            return callback(err,number);
        })
    });
}



exports.operationReveise = function operationDelete(reviseType,icd_id,icd_dir,icd_sub,ccd_id,ccd_sub,callback){
    //只能为Name之类的东西
    if(reviseType === 'cd' || reviseType === 'relationName') return callback(null,0); //不可能的

    var value = 0;   //添加成本
    var data = {};

    Ccd.get({_id:ccd_id},function(err,doc){
        data.icd = icd_dir;
        Ccd.generateSubFilter(icd_dir,function(icd_sub){
            for(var i=0;i<icd_sub.length;i++){
                icd_sub[i] = icd_sub[i].split(".");
                var base = data.icd;
                for(var j=0;j<icd_sub[i].length;j++){
                    base = base[icd_sub[i][j]];
                }
                value = value - base;
            }

            data.ccd = doc;
            var newItem = 0;
            for(var key in ccd_sub){
                if(ccd_sub[key] != -1) {
                    newItem++;
                    continue;
                }
                key = key.split(".");
                var top = data.ccd;
                for(var j=0;j<key.length;j++){
                    top = top[key[j]];
                }
                console.log("Top :"+top);
                value = value + top;
                /* 判断不存在的话作为create，但是高嵌套时容易出现问题
                 if(ccd_sub[key] === 1){
                 if(top === undefined)   value = value + (m_weight.NEW - m_weight.SELECT);
                 }
                 if(ccd_sub[key] === -1)  value = value + top;
                 */
            }
            console.log("123123123")
            console.log(value);
            console.log(icd_sub.length)
            console.log(icd_sub)
            var filter = [
                {_id : icd_id},
                {_preOperationValue: value * m_weight.CITED + newItem * m_weight.SELECT}
            ];
            console.log("Value :"+filter[1]._preOperationValue);
            revise(filter,function(err,number){
                return callback(err,number);
            })
        })
    });
}

//GET
exports.getOperationValue = function getOperationValue(icd_id,ccd_id,callback){
    //函数解析
    var data = {};
    Icd.get({_id : icd_id},function(err,doc){
        data.icd = doc;
        Ccd.get({_id:ccd_id},function(err,doc){
            data.ccd = doc;
            //遍历生成
            Ccd.generateSubFilter(data.icd,function(subFilter){
                //console.log("subFilter");
                //console.log(subFilter);

                var value = 0;     //Type1的得分规则
                var value2 = 0;    //Type2的得分规则
                if(data.icd._preOperationValue != undefined){
                    value = data.icd._preOperationValue/m_weight.CITED;
                    value2 = data.icd._preOperationValue/m_weight.CITED;
                }
                var initValue = value;
                //console.log("initvalue:"+value);
                //console.log(subFilter.length)

                var sum = 0;
                var sum_bar = 0;
                for(var i=0;i<subFilter.length;i++){
                    subFilter[i] = subFilter[i].split(".");
                    var base = data.icd;
                    var top = data.ccd;
                    for(var j=0;j<subFilter[i].length;j++){
                        if(top===undefined) {
                            console.log("AAAAAAAAAAAAA:"+data.icd.user+","+subFilter[i])
                            continue;
                        }
                        base = base[subFilter[i][j]];
                        top = top[subFilter[i][j]];
                    }
                    //console.log("top:"+top);
                    //console.log("base:"+base);
                    //if(top<base) console.log("lllllllllllllllllllllllll");
                    if(isNaN(top)) console.log(subFilter[i])
                    //console.log(value);
                    //console.log(top);
                    value = value - base + top;
                    value2 = value2 - 1 + top;
                    sum = sum+top;
                    sum_bar = sum_bar+base;
                }
                value = value * m_weight.CITED;
                value2 = value2 * m_weight.CITED;
                //if(data.icd.user === 'zhaotianqi_2004@163.com')
                /*
                console.log(value)
                console.log(value2)
                console.log(value-initValue * m_weight.CITED)
                console.log(value2-initValue * m_weight.CITED)
                */
                //console.log(value+","+value2+","+(value-initValue * m_weight.CITED)+","+(value2-initValue * m_weight.CITED));
                return callback([data.icd.user,value,value2,value-initValue * m_weight.CITED,value2-initValue * m_weight.CITED,initValue*m_weight.CITED]);
                /*
                var returnList = {};
                getOperationRank(icd_id,ccd_id,value,'operationScore',function(rank){
                    returnList.value = value;
                    returnList.rank = rank;
                    getOperationRank(icd_id,ccd_id,value2,'operationScore2',function(rank){
                        returnList.value2 = value2;
                        returnList.rank2 = rank;
                        /*
                        console.log(data.icd.user)
                        console.log(value)
                        console.log(value2)
                        console.log(value-initValue * m_weight.CITED)
                        console.log(value2-initValue * m_weight.CITED)
                        console.log(value+","+value2+","+value-initValue * m_weight.CITED+","+value2-initValue * m_weight.CITED);

                        //return callback([data.icd.user,value,value2,value-initValue*m_weight.CITED,value2-initValue*m_weight.CITED]);
                        //return callback(returnList);
                    });
                });
                */
            });
        });
    });
}

getOperationRank = function(icd_id,ccd_id,value,collection,callback){
    var rank = 1;
    var length = 0;
    var filter = [{ccd_id:ccd_id},{}];
    var str = "score." + icd_id;
    filter[1][str] = value;
    mongodb.getCollection(collection,function(collection){
        collection.findOne(filter[0], function(err, doc) {
            if(err != null) {
                rank = "N/A"
                return callback(rank);
            };
            if(doc === null){
                //err = "not Exist";
                collection.insert({ccd_id:ccd_id,score:{}}, {safe: true}, function(err, doc) {
                    collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {});
                    rank = "100%";
                    return callback(rank);
                });
            }
            else{
                collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {
                    collection.findOne(filter[0], function(err, doc) {
                        for(var key in doc.score){
                            //console.log(key);
                            if(doc.score[key] > value) rank++;
                            length++;
                        }

                        //rank =  rank +"/"+ length;
                        rank = "top "+(rank/length*100).toFixed(2)+'%';
                        return callback(rank);
                    })
                });
            }
        });
    });
}
/*
getOperationRank = function(icd_id,ccd_id,value,callback){
    var rank = 1;
    var length = 0;
    var filter = [{ccd_id:ccd_id},{}];
    var str = "score." + icd_id;
    filter[1][str] = value;
    mongodb.getCollection('operationScore',function(collection){
        collection.findOne(filter[0], function(err, doc) {
            if(err != null) {
                rank = "N/A"
                return callback(rank);
            };
            if(doc === null){
                //err = "not Exist";
                collection.insert({ccd_id:ccd_id,score:{}}, {safe: true}, function(err, doc) {
                    collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {});
                    rank = "1/1";
                    return callback(rank);
                });
            }
            else{
                collection.update(filter[0],{"$set" : filter[1]}, {safe: true}, function(err, doc) {
                    collection.findOne(filter[0], function(err, doc) {
                        for(var key in doc.score){
                            console.log(key);
                            if(doc.score[key] > value) rank++;
                            length++;
                        }

                        //rank =  rank +"/"+ length;
                        rank = "top "+(rank/length*100).toFixed(2)+'%';
                        return callback(rank);
                    })
                });
            }
        });
    });
}
*/




