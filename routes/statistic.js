var Icd = require('../models/icd.js');
var Ccd = require('../models/ccd.js');
var icdIndex = require('../models/icdIndex.js');
var ccdIndex = require('../models/ccdIndex.js');
var operationMeasure = require('../models/operationMeasure.js');

var ObjectID = require("mongodb").ObjectID;
var generate = require('../models/generate.js');

var db = require('../models/db');
var mongodb = new db();
var fs = require('fs');


var icdNormalize = require('../models/icdNormalize');

exports.on = function(req,res) {
    var filter = {};
    filter["_id"] = ObjectID(req.params.id);
    console.log(filter);

    Ccd.get(filter,function(err,doc){
        console.log("+++++++");
        console.log(doc);

        var ccd = doc;

        res.render('ccd-statistic', {
            title: 'CCD STATISTIC',
            user : req.session.user,
            ccd  : ccd,
            success : "",
            error : ""
        });
    });
};

exports.show = function(req,res) {
    var filter = {};
    filter["_id"] = ObjectID(req.params.id);
    ///* real
    Ccd.get(filter,function(err,doc){
        var statistic = getStatistics(doc,doc);
        console.log("+++++++");
        console.log(statistic);
        var string = "\n";
        for(var class_id in doc.class){
            for(var class_name in doc.class[class_id].name){
                string = string + class_id + " " + doc.class[class_id]._nor + " " + class_name + " " + doc.class[class_id].name[class_name]._nor+"\n";
            }
        }
        console.log(string);
        res.send(statistic);
    });
    //*/
    //for test
    /*
    var doc = getTestSet();
    var statistic = getStatistics(doc,doc);
    //console.log("+++++++");
    //console.log(statistic);

    var string = "\n";
    for(var class_id in doc.class){
        for(var class_name in doc.class[class_id].name){
            string = string + class_id + " " + doc.class[class_id]._nor + " " + class_name + " " + doc.class[class_id].name[class_name]._nor+"\n";
        }
    }
    console.log(string);
    res.send(statistic);
    //*/
};

getStatistics = function(icd,ccd){
    var statitics = {};
    var preFilter = "";
    var recordCount = 0; //=1时计数
    console.log(icd);
    sum=0;
    generateFilling(icd,ccd,preFilter,statitics,recordCount);
    console.log("EEEE:"+sum);
    return statitics;
}
var sum;
generateFilling = function(icdsub,ccdsub,preFilter,statitics,recordCount){
    if(typeof icdsub === 'string') return;
    recordCount = (recordCount+1)%2;

    for(var key in icdsub){
        if(ccdsub[key] === undefined) continue;

        if(key === '_nor'){
            if(statitics[preFilter] === undefined ) statitics[preFilter] = {};
            var norKey =  ccdsub[key];      //表示ccd中已经存在几个了
            var nor = statitics[preFilter][norKey];
            sum = sum+norKey;
            if(nor === undefined) nor = 0;
            statitics[preFilter][norKey] = nor+1;

        }
        else{
            if(recordCount===1) generateFilling(icdsub[key],ccdsub[key],preFilter+key+".",statitics,recordCount);
            else generateFilling(icdsub[key],ccdsub[key],preFilter,statitics,recordCount);
        }
    }
}

exports.statisticIcdGet = function(req,res){
    var filter = {};
    filter["_id"] = ObjectID(req.params.id);
    console.log(filter);
    Ccd.get(filter,function(err,doc){
        var ccd = doc;
        res.render('icd-statistic', {
            title: 'ICD STATISTIC',
            user : req.session.user,
            ccd  : ccd,
            success : "",
            error : ""
        });
    });
}

exports.statisticIcdPost = function(req,res){
    var ccdFilter = {};
    ccdFilter["_id"] = ObjectID(req.params.id);
    var user = req.session.user.mail;
    Ccd.get(ccdFilter,function(err,doc){
        var ccd = doc;
        var icdFilter = {};
        icdFilter["user"] = req.session.user.mail;
        icdFilter["ccd_id"] = ObjectID(req.params.id);
        Icd.get(icdFilter,function(err,doc){
            var icd = doc;
            //console.log(icd);
            var statistic = getStatistics(icd,ccd);
            //console.log("+++++++");
            //console.log(statistic);
            res.send(statistic);

        })
    });
}


exports.operationScoreGet = function(req,res){
    res.render('statistic-operationScore', {
        title: 'STATISTIC',
        user : req.session.user,
        success : "",
        error : ""
    });
}

exports.operationScorePost = function(req,res){
    mongodb.getCollection('icd',function(collection){
        collection.find().toArray(function(err, doc) {
            var icdList = [];
            console.log(doc.length);
            for(var i=0;i<doc.length;i++){
                for(var name in doc[i].cd)  {break;}
                icdList[i] = {
                    project:name
                    ,icd:doc[i]._id
                    ,ccd:doc[i].ccd_id
                    ,user:doc[i].user
                    ,score:{}
                    ,rank:{}
                }
            }
            //console.log(icdList);
            getRank("operationScore",icdList,function(icdList){
                getRank("operationScore2",icdList,function(icdList){
                    //console.log(icdList[0].score)
                    //console.log()
                    var stringList = [];
                    var string = "project,ccd,icd,user,score1,rank1,score2,rank2";
                    stringList.push(string);

                    for(var i=0;i<icdList.length;i++){
                        var string = icdList[i].project+","+icdList[i].ccd+","+icdList[i].icd+","+icdList[i].user+","+icdList[i].score["operationScore"]+","+icdList[i].rank["operationScore"]+","
                            +icdList[i].score["operationScore2"]+","+icdList[i].rank["operationScore2"];
                        console.log(string);
                        stringList.push(string);
                    }
                    res.send({stringList:stringList});
                });
            });
        });
    });

}


getRank = function(collection,icdList,callback){
    var collectionName = collection;
    mongodb.getCollection(collectionName,function(collection){
        collection.find().toArray(function(err, doc) {
            for(var i=0;i<doc.length;i++){
                //同一个ccd的score排序
                var ccd_id = doc[i].ccd_id;
                var scorelist = [];
                for(var key in doc[i].score){
                    var tmpScore =  doc[i].score[key];
                    //排序
                    if(scorelist.length === 0) {
                        scorelist.push({id:key,score:tmpScore});
                        continue;
                    }
                    for(var j=0;j<scorelist.length;j++){
                        if(tmpScore > scorelist[j].score){
                            scorelist.splice(j,0,{id:key,score:tmpScore});
                            break;
                        }
                    }
                    if(j===scorelist.length){
                        scorelist.splice(j,0,{id:key,score:tmpScore})
                    }
                }
                //console.log(scorelist);
                //更新icdList的score和rank
                for(var j=0;j<scorelist.length;j++){
                    for(var k=0;k<icdList.length;k++){
                        if(((icdList[k].ccd).toString() === (ccd_id).toString()) && ((icdList[k].icd).toString() === (scorelist[j].id).toString())){
                            icdList[k].score[collectionName] = scorelist[j].score;
                            icdList[k].rank[collectionName] = j+1;
                        }
                    }
                }
                ///console.log(icdList);
            }
            return callback(icdList);
        });
    });
}


exports.citedOrderGet = function(req,res){
    var ccd_id = ObjectID(req.params.id);
    mongodb.getCollection('users',function(collection){
        collection.find().toArray(function(err, doc) {
            var mailList = [];
            var idList = {};
            /*
            for(var i=0;i<doc.length;i++){
                mailList.push(doc[i].mail);
            }
            console.log(mailList);
            return;
            */
            //mailList = ['yuwj10@sei.pku.edu.cn','fanghao12@sei.pku.edu.cn','zhaotianqi_2004@163.com','fkai1993@gmail.com','404024250@qq.com','tofy1993@163.com'];//'445150108@qq.com'老数据 //实验1
            //mailList =  [ 'yuwj10@sei.pku.edu.cn','404024250@qq.com','fkai1993@gmail.com','fanghao12@sei.pku.edu.cn','zhaotianqi_2004@163.com','445150108@qq.com' ]; //实验2 太少了，没法用
            //mailList =  [ 'yuwj10@sei.pku.edu.cn','404024250@qq.com','fkai1993@gmail.com','fanghao12@sei.pku.edu.cn','zhaotianqi_2004@163.com','445150108@qq.com' ]; //实验3
            mailList =  ['yuwj10@sei.pku.edu.cn','fanghao12@sei.pku.edu.cn','zhaotianqi_2004@163.com','fkai1993@gmail.com','404024250@qq.com','445150108@qq.com',
                'zhangw@sei.pku.edu.cn','zhhy@sei.pku.edu.cn',
                'jiangsfls@163.com','wangjingyi@nuaa.edu.cn','152106619@qq.com','chenyirui0607@126.com','cassiue@163.com','hagase@yeah.net','qrhao24@sohu.com'];
            mongodb.getCollection('icd',function(collection){
                collection.find({ccd_id:ccd_id}).toArray(function(err, doc) {

                    var projectList = [];
                    var count = 0;
                    for(var i=0;i<doc.length;i++){
                        for(var j=0;j<mailList.length;j++){
                            if(doc[i].user === mailList[j]){
                                projectList[count] = doc[i];
                                count++;
                                idList[doc[i]._id.toString()] = 0;
                            }
                        }
                    }
                    //console.log(projectList.length)
                    //getScoreList(doc,mailList,ccd_id);        //获取得分情况
                    //permArr = [],
                    //usedChars = [];
                    //getCiteNumber(permute(projectList));      //获取引用次数，全分布
                    //getCiteNumber([projectList]);             //获取引用次数，指定分布
                    //getFsInfo(ccd_id,idList);                 //获取日志信息
                    //getCiteInfoInCCD([projectList],{_id:ccd_id});
                    //getCreateCiteInfoInCCD({_id:ccd_id},[projectList]);
                    //getCCDTreeIntoPair({_id:ccd_id});
                    for(var i=0;i<projectList.length;i++){
                        //console.log(i);
                        //icdNormalize.icdInfoNormalize(projectList[i]);
                        icdNormalize.test(projectList[i]);
                        return;
                    }
                });
            });
        });
    });
}

getCCDTreeIntoPair = function(filter){
    fs.writeFile('./nodeXL/vertex.csv',"",'utf-8',function(){})
    fs.writeFile('./nodeXL/edge.csv',"",'utf-8',function(){})
    Ccd.get(filter,function(err,doc){
        var vec = "";
        var edge = "";
        for(var id in doc["class"]){
            var vec = "";
            var edge = "";
            var sub = doc["class"][id];
            var opaque = 25 + sub["_nor"]*5;
            //插入id

            vec += id+","+"red"+",,,"+opaque+"\r\n";
            //插入name
            var id_subtype = id+"-name";
            vec += id_subtype+","+"gray"+","+"square"+",,"+opaque+",,,"+""+","+"gray"+"\r\n";
            //插入id和name
            edge += id+","+id_subtype+",,,,"+opaque+"\r\n";

            //下一层
            for(var name in sub['name']){
                var sub2 = sub['name'][name];
                var opaque = 25 + sub2["_nor"]*5;
                var printName = id + "-" + name;
                vec += printName+","+"blue"+",,,"+opaque+",,,"+name+","+"blue"+"\r\n";
                edge += id_subtype+","+printName+",,,,"+opaque+"\r\n";
            }
            fs.appendFile('./nodeXL/vertex.csv',vec,'utf-8',function(){})
            fs.appendFile('./nodeXL/edge.csv',edge,'utf-8',function(){})
        }
        var count="";
        for(var relation in doc['relation']){
            var vec = "";
            var edge = "";
            var sub = doc["relation"][relation];
            var relations = relation.split("-");
            edge += relations[0]+","+relations[1]+"\r\n";

            fs.appendFile('./nodeXL/edge.csv',edge,'utf-8',function(){})

            //对数据直接输出
            count += relation+","+doc["relation"][relation]["_nor"]+"\r\n";
        }
        console.log(count);
        //fs.writeFile('./nodeXL/vertex.csv',vec,'utf-8',function(){})
        //fs.writeFile('./nodeXL/edge.csv',edge,'utf-8',function(){})

    });
}

getCreateCiteInfoInCCD = function(filter,projectList){
    Ccd.get(filter,function(err,doc){
        var ccd = doc

        var collective = []; //记录群体数据
        var outputList = []; //记录输出数据
        var goalList = [];   //记录goal数据
        //console.log(projectList.length)

        for(var i=0;i<projectList.length;i++){
            collective[i] = [];
            outputList[i] = [];
            var tempList = [];
            var nameList = [];
            /*
            for(var j=0;j<projectList[i].length;j++){
                var citeInfo = getBuiltInfo(projectList[i][j],ccd);
            }
            */
            ccd = [];
            for(var j=0;j<projectList[i].length;j++){
                var mergeInfo = merge(projectList[i][j],ccd);
            }
            console.log(ccd)

            for(var j=0;j<projectList[i].length;j++){
                var existList = {};
                var citeInfo = getBuiltInfo2(projectList[i][j],ccd,existList);
            }
        }
        //console.log(outputList);
        //console.log(goalList)
    });
}

getBuiltInfo = function(individual,colloctive,callback){
    var count = {
        name: individual.user,
        create:0,
        cite:0,
        referenced:0
    };

    var subFilter = Ccd.generateSubFilter(individual,function(s){});
    for(var i=0;i<subFilter.length;i++){
        subFilter[i] = subFilter[i].split(".");
        var base = individual;
        //var top = colloctive;
        for(var j=0;j<subFilter[i].length;j++){
            if(top===undefined) {
                console.log("AAAAAAAAAAAAA:"+individual.user+","+subFilter[i])
                continue;
            }
            base = base[subFilter[i][j]];
            top = top[subFilter[i][j]];
        }

        if(isNaN(top)) console.log(subFilter[i])
        if(base === 1){
            count.create++;
            count.referenced += top-1;
        }
        else{
            count.cite++;
        }
    }

    console.log(count.name+","+count.create+","+count.cite+","+count.referenced);
    return count;
}



getBuiltInfo2 = function(individual,colloctive,existList,callback){
    var count = {
        name: individual.user,
        create:0,
        cite:0,
        referenced:0
    };

    var subFilter = Ccd.generateSubFilter(individual,function(s){});
    for(var i=0;i<subFilter.length;i++){
        var tmp = subFilter[i];
        for(var l=0;l<colloctive.length;l++){
            if(colloctive[l].element === subFilter[i]){
                var top = colloctive[l].nor;
            }
        }

        subFilter[i] = subFilter[i].split(".");
        var base = individual;
        for(var j=0;j<subFilter[i].length;j++){
            base = base[subFilter[i][j]];
        }

        if(base === 1){
            if(existList[tmp]===undefined) existList[tmp] = 1;
            else("alert:"+existList[tmp]);
            count.create++;
            count.referenced += top-base;
        }
        else{
            count.cite++;
        }
    }

    console.log(count.name+","+count.create+","+count.cite+","+count.referenced);
    return count;
}

getScoreList = function(doc,mailList,ccd_id){
    var projectList = [];
    var scoreList = [];
    var idList = {};
    var count = 0;
    for(var i=0;i<doc.length;i++){
        for(var j=0;j<mailList.length;j++){
            if(doc[i].user === mailList[j]){
                projectList[count] = doc[i];
                count++;
                idList[doc[i]._id.toString()] = 0;

                operationMeasure.getOperationValue(doc[i]._id,ccd_id,function(doc){
                    switch(doc[0]){
                        case 'yuwj10@sei.pku.edu.cn':
                            doc[0]="于文静";
                            break;
                        case '404024250@qq.com':
                            doc[0]="王诗君";
                            break;
                        case 'fkai1993@gmail.com':
                            doc[0]="付凯";
                            break;
                        case 'fanghao12@sei.pku.edu.cn':
                            doc[0]="方浩";
                            break;
                        case 'zhaotianqi_2004@163.com':
                            doc[0]="赵天琪";
                            break;
                        case '445150108@qq.com':
                            doc[0]="齐荣嵘";
                            break;
                    }
                    scoreList.push(doc);
                    if(scoreList.length === mailList.length){
                        for(var k=1;k<5;k++){
                            console.log(k);
                            scoreList.sort(function(a,b){return(a[k]<b[k])}); //从大到小
                            var string = "";
                            var string2 = "";
                            var string3 = "";
                            for(var j=0;j<scoreList.length;j++){
                                string += scoreList[j][0]+", ";
                                string2 += scoreList[j][k]+", ";
                                string3 += scoreList[j][5]+", ";
                            }
                            console.log(string);
                            console.log(string2);
                            console.log(string3);
                        }
                    }
                })
            }
        }
    }
}

getCiteNumber = function(projectList){
    var collective = []; //记录群体数据
    var outputList = []; //记录输出数据
    var goalList = [];   //记录goal数据
    console.log(projectList.length)
    for(var i=0;i<projectList.length;i++){
    //for(var i=0;i<1;i++){
        collective[i] = [];
        outputList[i] = [];
        var tempList = [];
        var nameList = [];
        for(var j=0;j<projectList[i].length;j++){
            //console.log(projectList[i][j])
            //var mergeInfo = {};
            var mergeInfo = merge(projectList[i][j],collective[i]);
            outputList[i].push(mergeInfo);
            tempList.push(mergeInfo.cite/(mergeInfo.cite+mergeInfo.create));
            nameList.push(mergeInfo.name);
        }
        var legal = true;
        for(var k=0;k<(tempList.length-1);k++){
            if(tempList[k]>tempList[k+1]) {legal=false;break;}
        }
        if(legal) goalList.push([nameList,tempList]);

        var norList ={};
        for(k=0;k<collective[i].length;k++){
            if(norList[collective[i][k].nor] === undefined) norList[collective[i][k].nor]=1;
            else norList[collective[i][k].nor] = norList[collective[i][k].nor]+1;
        }
        console.log(norList);

        var classList =[];
        var tmp;
        for(k=0;k<collective[i].length;k++){
            tmp = collective[i][k].element.split(".");
            if(tmp[0] === 'class' && tmp[2] === 'name'){
                classList.push({element:tmp[3],nor:collective[i][k].nor});
            }
        }
        console.log(classList);
        console.log(collective[i])

        var filterList = []; //在collective[i]的基础上，输出引用次数大于一定规模的
        for(var l=0;l<collective[i].length;l++){
            console.log(collective[i][l].nor);
            if(collective[i][l].nor > 4) filterList.push(collective[i][l]);
        }
        fs.writeFile('./collecvtiveInfo.txt',JSON.stringify(filterList),'utf-8',function(){})

    }
    //console.log(outputList);
    //console.log(goalList)
}

getCiteInfoInCCD = function(projectList,filter){
    var collectiveInfo = []; //记录群体数据
    console.log(projectList.length)
    for(var i=0;i<projectList.length;i++){
        for(var j=0;j<projectList[i].length;j++){
            collectiveInfo[j] = [];
            var mergeInfo = merge(projectList[i][j],collectiveInfo[j]);
        }
    }
    console.log(mergeInfo)
    /*
    Ccd.get(filter,function(err,doc){
        var tmp;
        var classList=[];
        for(var i=0;i<projectList.length;i++){
            for(var j=0;j<projectList[i].length;j++){
                classList[j] =[];
                for(var k=0;k<collectiveInfo[j].length;k++){
                    tmp = collectiveInfo[j][k].element.split(".");
                    if(tmp[0] === 'class' && tmp[2] === 'name'){
                        //classList.push({element:tmp[3],nor:collectiveInfo[i][k].nor});
                        //在ccd中查找
                        doc[tmp[0]][tmp[1]][tmp[2]][tmp[3]]['_nor'];
                        classList[j].push({element:tmp[3],nor1:doc[tmp[0]][tmp[1]]['_nor'],nor2:doc[tmp[0]][tmp[1]][tmp[2]][tmp[3]]['_nor']});
                    }
                }
                console.log(projectList[i][j].user);
                console.log(classList[j]);

            }
        };
    });
    */
}


var permArr = [],
    usedChars = [];

permute = function(input) {
    var i, ch;
    for (i = 0; i < input.length; i++) {
        ch = input.splice(i, 1)[0];
        usedChars.push(ch);
        if (input.length == 0) {
            permArr.push(usedChars.slice());
        }
        permute(input);
        input.splice(i, 0, ch);
        usedChars.pop();
    }
    return permArr
};

merge = function(individual,colloctive,callback){
    var count = {
        name: individual.user,
        cite:0,
        create:0
    };
    var subFilter = Ccd.generateSubFilter(individual,function(s){})
    //console.log("subFilter");
    //console.log(subFilter);
    for(var i=0;i<subFilter.length;i++){
        /*//去除attribute property 和relation 下层的
        var tmp = subFilter[i].split(".");
        if(tmp[5] != undefined && tmp[5] != '_nor'){
            continue;
        }
        */

        for(var j=0;j<colloctive.length;j++){
            if(colloctive[j].element === subFilter[i]){
                break;
            }
        }
        if(j<colloctive.length){
            colloctive[j].nor = colloctive[j].nor+1;
            count.cite = count.cite+1;
        }else{
            colloctive.push({element:subFilter[i],nor:1});
            count.create = count.create + 1;
        }
    }
    return count;
}

getFsInfo = function(ccd_id,icdList){
    //第一次实验数据
    //mailList =  [ 'yuwj10@sei.pku.edu.cn','404024250@qq.com','fkai1993@gmail.com','fanghao12@sei.pku.edu.cn','zhaotianqi_2004@163.com','445150108@qq.com' ];
    /*
    var icdList = {'52ca6d2e5c60ad58d1000008':1
        ,'52cd6eb28f3c9b0000000004':1
        ,'52d3bd781225350000000003':1
        ,'52cb8da3a3d7b910e9000003':1
        ,'52cd02438f3c9b0000000002':1
        ,'53020a9dc90cc5d028000002':1};
    */
    //fs.readFile('./logs_1/sumLog.log','utf-8',function(err,data){
    //第三次实验数据
    fs.readFile('./logs_6/sumLog.log','utf-8',function(err,data){
        if(err) throw err;
        data = data.split('\r\n');

        var operationList = {};
        var operationRecord = [];
        var length = 0;
        var unsetCount = {};
        var operationString = "";
        for(var i=0;i<(data.length-1);i++){
            data[i] = data[i].split(' - ')[1];
            //console.log(data[i]);
            data[i] = JSON.parse(data[i]);
            //console.log(data[i])
            if(data[i].collection != 'icd') continue;
            if(data[i].func != 'update') continue;
            if(icdList[data[i].doc[0]._id] === undefined) continue;
            else  icdList[data[i].doc[0]._id] = icdList[data[i].doc[0]._id]+1;

            //分为$inc和$unset
            var operationLength=0;
            if(data[i].doc[1]['$inc']){
                //var length = 0;
                for(var key in data[i].doc[1]['$inc']){
                    operationLength++;//单条的操作数
                    length++;//总操作数

                    operationString = operationString + data[i].doc[0]._id +',';
                    if(operationList[key] === undefined) {
                        operationList[key]=1;
                        operationString = operationString + '0\r\n';
                        operationRecord.push([data[i].doc[0]._id,0]);
                    }
                    else {
                        operationList[key]= operationList[key]+1;
                        operationString = operationString + '1\r\n';
                        operationRecord.push([data[i].doc[0]._id,1]);
                    }

                }
            }
            if(data[i].doc[1]['$unset']){
                if(unsetCount[data[i].doc[0]._id] === undefined) unsetCount[data[i].doc[0]._id] =1;
                else unsetCount[data[i].doc[0]._id]++;
                //console.log('$unset')
            }
        }
        console.log("getFsInfo");
        console.log(unsetCount);
        //console.log(operationList);
        //console.log(operationRecord.length);
        //console.log(operationRecord);
        //console.log(length);
        /*
        fs.writeFile('./logs_2/operationString.log',operationString,'utf-8',function(){})
        console.log(operationString)
        console.log(icdList)

        var aggregrateList = {};
        var icdAggregrateList = {};
        var count = 0;
        var devider = 100;

        for(var i=0;i<operationRecord.length;i++){
            if(Math.floor(i/devider) === (i/devider)){
                count ++;
                aggregrateList[count] = {0:0,1:0};
                icdAggregrateList[count] = {};
                for(var id in icdList){
                    icdAggregrateList[count] [id]={0:0,1:0};
                }
            }
            aggregrateList[count][operationRecord[i][1]] = aggregrateList[count][operationRecord[i][1]] +1;
            //console.log(icdAggregrateList)
            //console.log(operationRecord[i][0])
            icdAggregrateList[count][operationRecord[i][0]][operationRecord[i][1]] = icdAggregrateList[count][operationRecord[i][0]][operationRecord[i][1]]  +1;

        }
        console.log(aggregrateList);

        var aggregrateString = "";
        var icdAggregrateString = "";
        var luluList = {};
        for(var key in aggregrateList){
            //aggregrateString = aggregrateString + key + ',0,' + aggregrateList[key]['0'] +  ',1,' + aggregrateList[key]['1'] + '\r\n';
            aggregrateString = aggregrateString + key + ',' + aggregrateList[key]['0'] +  ',' + aggregrateList[key]['1'] + '\r\n';
            for(var id in icdAggregrateList[key]){
                icdAggregrateString = icdAggregrateString + key + ',' + id + ',' + icdAggregrateList[key][id]['1'] +  ',' + icdAggregrateList[key][id]['0'] + '\r\n';
                if(key==='1')  luluList[id] = {0:0,1:0};
                luluList[id]['0']=luluList[id]['0']+icdAggregrateList[key][id]['0']
                luluList[id]['1']=luluList[id]['1']+icdAggregrateList[key][id]['1']
            }
        }
        //console.log(aggregrateString)
        //console.log(icdAggregrateString)
        //console.log(luluList);
        */
    })
}

generateMerge = function(icdsub,ccdsub,preFilter,statitics,recordCount){
    if(typeof icdsub === 'string') return;
    recordCount = (recordCount+1)%2;

    for(var key in icdsub){
        if(ccdsub[key] === undefined) continue;

        if(key === '_nor'){
            if(statitics[preFilter] === undefined ) statitics[preFilter] = {};
            var norKey =  ccdsub[key];      //表示ccd中已经存在几个了
            var nor = statitics[preFilter][norKey];
            sum = sum+norKey;
            if(nor === undefined) nor = 0;
            statitics[preFilter][norKey] = nor+1;

        }
        else{
            if(recordCount===1) generateFilling(icdsub[key],ccdsub[key],preFilter+key+".",statitics,recordCount);
            else generateFilling(icdsub[key],ccdsub[key],preFilter,statitics,recordCount);
        }
    }
}
