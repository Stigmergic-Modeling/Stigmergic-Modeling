var Icd = require('../models/icd.js');
var ccd = require('../models/ccd.js');
var user;
var icdIndex = require('../models/icdIndex.js');
var generate = require('../models/generate.js');
var regex = /^_/;

exports.setUser = function(req_user){
    user = req_user;
    console.log("set User:"+user);
}
exports.test = function(res,callback){
    var ccd_Demo =[
        {
            user : user,
            cd: "poultry-classDiagram",
            _description : "Demo of a Class-Diagram about poultries."
        }
    ];

    ccd.remove([null,null],function(){
        ccd.create(ccd_Demo[0],function(err,doc){
            //if(doc[0] === undefined) return res.redirect("/reset");
            if(err) return res.redirect("/reset");
            //if(err != null){
            //  if(err === "already Exist") {//进行选择}
            //  else //认定错误
            //}
            else{
                console.log("icd creator");
                var ccdDoc = doc[0];
                console.log(ccdDoc);
                Icd.remove([null,null],function(){                          //清空icd
                   icdIndex.remove({user:user},function(err,doc){        //清空icdIndex
                        icdIndex.create({user:user},function(err,doc){      //创建用户的icdIndex
                            var icdDoc = {
                                user : ccdDoc.user,
                                ccd_id : ccdDoc._id,
                                cd : {},
                                class : {},
                                relation : {}
                            }
                            Icd.create(icdDoc,function(err,doc){
                                //原始内容创建完毕
                                //知道类型，属性
                                icdDoc = doc[0]
                                for(var cdID in ccdDoc["cd"]){
                                    //if(ccdDoc["cd"][cdID]._nor != undefined){
                                        var icdFilter = [];
                                        icdFilter[0] = {_id:icdDoc._id};
                                        icdFilter[1] = {};
                                        icdFilter[1]["cd."+cdID] = {
                                            _value: ccdDoc["cd"][cdID]["_value"],
                                            description: {}
                                        };

                                        var cdDescription = ccdDoc["cd"][cdID]["description"];
                                        for(var descriptionID in cdDescription){
                                            icdFilter[1]["cd."+cdID]["description"][descriptionID] = {_value:cdDescription[descriptionID]["_value"]}
                                        }

                                        var ccdFilter = [];
                                        ccdFilter[0] = {_id:ccdDoc._id};
                                        ccdFilter[1] = "cd."+cdID+"._nor";

                                        Icd.add(icdFilter,function(err,number){
                                            ccd.add(ccdFilter,function(){});
                                            Icd.get({_id:icdDoc._id},function(err,doc){
                                                icdIndex.changeCD(doc,function(){});
                                            });
                                        });

                                        for(var cdDescription in ccdDoc["cd"][cdID]["description"]){
                                            //if(ccdDoc["cd"][cdID]["description"][cdDescription]._nor != undefined){
                                                icdFilter[1] = {};
                                                icdFilter[1]["cd."+cdID+".description."+cdDescription] =  {_value: ccdDoc["cd"][cdID]["description"][cdDescription]["_value"]};
                                                Icd.add(icdFilter,function(){
                                                    ccdFilter[1] = "cd."+cdID+".description."+cdDescription+"._nor";
                                                    ccd.add(ccdFilter,function(){});
                                                    var k = icdDoc._id;
                                                    generate.generateItem(icd_Demo[0],null,null,ccdDoc._id,icdDoc._id,function(){
                                                        generate.generateRelationElem(icd_Demo[1]["relation"],ccdDoc._id,icdDoc._id,function(){
                                                            return callback();
                                                        });
                                                    });
                                                });
                                        }
                                    }
                            });
                        });
                    });
                });
            }
        });
    });
}



//source
var icd_Demo =[
    {
        class: {
            idc1: {
                _value : "123",
                className : {
                    idcn1:{
                        _value: "bird"
                    }
                },
                attribute:{
                    ida11:{
                        _value: "123",
                        attributeName :{
                            idan11:{
                                _value: "feather"
                            }
                        },
                        visibility : {
                            idanv1 :{
                                _value :"public"
                            }
                        },
                        multiplicity:{
                            idanv2 :{
                                _value :"n"
                            }
                        }
                    },
                    ida12:{
                        _value: "123",
                        attributeName :{
                            idxxx:{
                                _value: "teeth"
                            }
                        },
                        visibility : {
                            idav1 :{
                                _value :"public"
                            }
                        },
                        type:{
                            idat1 :{
                                _value :"boolean"
                            }
                        }
                    }
                }
            },
            idc2: {
                _value : "123",
                className : {
                    idcn2:{
                        _value: "wing"
                    }
                },
                attribute:{
                    ida21:{
                        _value: "123",
                        attributeName :{
                            idan22:{
                                _value: "size"
                            }
                        },
                        visibility : {
                            idav2 :{
                                _value :"private"
                            }
                        }
                    }
                }
            }//,
            /*
            idc3: {
                _value : "123",
                className : {
                    idcn3:{
                        _value: "demo_3"
                    }
                }
            },
            idc5: {
                _value : "123",
                className : {
                    idcn5:{
                        _value: "demo_4"
                    }
                }
            },
            idc6: {
                _value : "123",
                className : {
                    idcn6:{
                        _value: "demo_5"
                    }
                }
            },
            idc7: {
                _value : "123",
                className : {
                    idcn7:{
                        _value: "demo_6"
                    }
                }
            },
            idc8: {
                _value : "123",
                className : {
                    idcn8:{
                        _value: "demo_7"
                    }
                }
            },
            idc9: {
                _value : "123",
                className : {
                    idcn9:{
                        _value: "demo_8"
                    }
                }
            } */
        }
    },

    {
        relation: {
            idr1: {
                _value : "composition",
                class1 : "bird",
                multiplicity1: "1",
                class2 : "wing",
                multiplicity2: "2"
            }
        }
    }
];

var ccd_Demo =[
    {
        user : user,

        cd: "poultry-classDiagram",
        _description : "Demo of a Class-Diagram about poultries."
    }
];