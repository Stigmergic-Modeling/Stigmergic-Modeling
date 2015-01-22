var Icd = require('../models/icd.js');
var ccd = require('../models/ccd.js');
var user;
var icdIndex = require('icd_index.js');
//var generate = require('../models/generate.js');
var regex = /^_/;
var ObjectID = require("mongodb").ObjectID;

exports.setUser = function(req_user){
    user = req_user;
    console.log("set User:"+user);
}
exports.test = function(res,callback){
    ccd_Demo[0].user = user;
    ccd.create(ccd_Demo[0],function(err,doc){
        if(err) return res.redirect("/reset");
        var ccdDoc = doc[0];

        var icdDoc = {
            user : user,
            ccd_id : ccdDoc._id,
            cd : ccdDoc.cd
        }
        Icd.create(icdDoc,function(err,doc){
            var icdDoc = doc[0]
            var ccdFilter = [];
            ccdFilter[0] = {_id : ccdDoc._id};
            ccdFilter[1] = ccd_Demo[1];
        });
    });
    /*原生
    ccd.remove([null,null],function(){
        console.log(ccd_Demo[0])
        ccd.create(ccd_Demo[0],function(err,doc){
            if(err) return res.redirect("/reset");
            var ccdDoc = doc[0];
            Icd.remove([null,null],function(){
                var filter={};
                filter["user"]=user;
                icdIndex.remove("",function(err,doc){
                    icdIndex.create(filter,function(err,doc){
                        //这里作为一个正常的创建引用执行
                        var icdDoc = {
                            user : user,
                            ccd_id : ccdDoc._id,
                            cd : ccdDoc.cd
                        }
                        Icd.create(icdDoc,function(err,doc){
                            var icdDoc = doc[0]
                            var ccdFilter = [];
                            ccdFilter[0] = {_id : ccdDoc._id};
                            ccdFilter[1] = ccd_Demo[1];
                            ccd.addastest(ccdFilter,function(){
                                //进行二次引用
                                var icdFilter = [];
                                icdFilter[0] = {_id : icdDoc._id};
                                icdFilter[1] = icd_Demo[0];
                                Icd.addastest(icdFilter,function(){
                                    return callback();
                                })
                            })

                        });
                    })
                });
            });
        });
    });
    //*/
}


//source
var icd_Demo =[
    {
        class: {
            '33a0cd7a3015292ace9bc': {
                _nor : 1,
                //Name Reform
                //className : {
                name : {
                    bird:{
                        _nor : 1
                    }
                },
                attribute:{
                    ida11:{
                        _nor : 1,
                        //Name Reform
                        //attributeName :{
                        name :{
                            feather:{
                                _nor: 1
                            }
                        },
                        visibility : {
                            public :{
                                _nor : 1
                            }
                        }
                    },
                    ida12:{
                        _nor: 2,
                        //Name Reform
                        //attributeName :{
                        name :{
                            teeth:{
                                _nor: 1
                            }
                        },
                        visibility : {
                            public :{
                                _nor :1
                            }
                        },
                        type:{
                            boolean :{
                                _nor :1
                            }
                        }
                    }
                }
            },
            '333c6aed1025292acee26': {
                _nor : 1,
                //Name Reform
                //className : {
                name : {
                    wing:{
                        _nor: 1
                    }
                },
                attribute:{
                    ida21:{
                        _nor: 1,
                        //Name Reform
                        //attributeName :{
                        name :{
                            size:{
                                _nor: 1
                            }
                        },
                        visibility : {
                            private :{
                                _nor : 1
                            }
                        }
                    }
                }
            }
        },
        relation: {
            '333c6aed1025292acee26-33a0cd7a3015292ace9bc':{//采用id小的在前
                _nor : 1 ,
                //Name Reform
                //relationName : {
                name : {
                    'wing-bird':{//存储顺序与id对应，显示顺序可以按照小的在前另行调换
                        _nor : 1
                    }
                },
                composition:{
                    '1' :{
                        _nor : 1,
                        name:{
                            '&default' :{ //未命名情况下给默认名称，取名规则composition&&123形式和composition&xxxx形式
                                //同名称有两种composition方式，此处统一融合不进行拆分
                                _nor:1
                            }
                        },
                        order : {
                            1:{ //此处将两种顺序进行拆分，0表示顺序输出，1代表逆序输出。
                                _nor : 1,
                                role1:{ //此处将不同标记的分开？？？其实不分开也行
                                    '&default':{
                                        _nor : 1
                                    }
                                },
                                role2:{
                                    '&default':{
                                        _nor : 1
                                    }
                                },
                                multiplicity1:{
                                    1:{
                                        _nor : 1
                                    }
                                },
                                multiplicity2:{
                                    2:{
                                        _nor : 1
                                    }
                                }
                            }
                        }
                    }
                },
                association:{
                    '&123213' :{//未命名情况下给默认名称，取名规则composition&&123形式和composition&xxxx形式
                        //同名称有两种composition方式，此处统一融合不进行拆分
                        _nor : 1,
                        name:{
                            'hakula' :{
                                _nor:1
                            }
                        },
                        order : {
                            1:{ //此处将两种顺序进行拆分，0表示顺序输出，1代表逆序输出。
                                _nor : 1,
                                role1:{ //此处将不同标记的分开？？？其实不分开也行
                                    '1':{
                                        _nor : 1
                                    }
                                },
                                role2:{
                                    '2':{
                                        _nor : 1
                                    }
                                },
                                multiplicity1:{
                                    1:{
                                        _nor : 1
                                    }
                                },
                                multiplicity2:{
                                    2:{
                                        _nor : 1
                                    }
                                },
                                subsets1:{
                                    1:{
                                        _nor : 1
                                    }
                                },
                                subsets2:{
                                    2:{
                                        _nor : 1
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        _preOperationValue : 0
    }
];

var ccd_Demo =[
    {
        user : user,
        cd: "poultry",
        description : "Demo of a Concept-Diagram about poultries."
    },
    {
        class: {
            '33a0cd7a3015292ace9bc': {
                _nor : 12,
                //Name Reform
                //className : {
                name : {
                    bird:{
                        _nor : 8
                    },
                    brid:{
                        _nor : 1
                    },
                    fowl:{
                        _nor:3
                    }
                },
                attribute:{
                    ida11:{
                        _nor : 12,
                        //Name Reform
                        //attributeName :{
                        name :{
                            feather:{
                                _nor: 6
                            },
                            flume:{
                                _nor:6
                            }
                        },
                        visibility : {
                            public :{
                                _nor : 8
                            },
                            private :{
                                _nor : 3
                            }
                        },
                        multiplicity:{
                            n :{
                                _nor : 4
                            },
                            1 :{
                                _nor : 2
                            }
                        }
                    },
                    ida12:{
                        _nor: 2,
                        //Name Reform
                        //attributeName :{
                        name :{
                            teeth:{
                                _nor: 1
                            }
                        },
                        visibility : {
                            public :{
                                _nor :1
                            }
                        },
                        type:{
                            boolean :{
                                _nor :1
                            }
                        }
                    },
                    ida13:{
                        _nor: 2,
                        //Name Reform
                        //attributeName :{
                        name :{
                            floria:{
                                _nor: 1
                            }
                        }
                    }
                }
            },
            '333c6aed1025292acee26': {
                _nor : 1,
                //Name Reform
                //className : {
                name : {
                    wing:{
                        _nor: 1
                    }
                },
                attribute:{
                    ida21:{
                        _nor: 1,
                        //Name Reform
                        //attributeName :{
                        name :{
                            size:{
                                _nor: 1
                            }
                        },
                        visibility : {
                            private :{
                                _nor : 1
                            }
                        }
                    }
                }
            },
            '333c6aed1025292efds26': {
                _nor : 1,
                name : {
                    geese:{
                        _nor: 1
                    }
                },
                attribute:{
                    ida21:{
                        _nor: 1,
                        //Name Reform
                        //attributeName :{
                        name :{
                            fly:{
                                _nor: 1
                            }
                        },
                        visibility : {
                            private :{
                                _nor : 1
                            }
                        }
                    }
                }
            }
        },
        relation: {
            '333c6aed1025292acee26-33a0cd7a3015292ace9bc':{//采用id小的在前
                _nor : 1 ,
                //Name Reform
                //relationName : {
                name : {
                    'wing-bird':{//存储顺序与id对应，显示顺序可以按照小的在前另行调换
                        _nor : 1
                    }
                },
                composition:{
                    '1' :{
                        _nor : 1,
                        name:{
                            '&default' :{ //未命名情况下给默认名称，取名规则composition&&123形式和composition&xxxx形式
                                //同名称有两种composition方式，此处统一融合不进行拆分
                                _nor:1
                            }
                        },
                        order : {
                            1:{ //此处将两种顺序进行拆分，0表示顺序输出，1代表逆序输出。
                                _nor : 1,
                                role1:{ //此处将不同标记的分开？？？其实不分开也行
                                    '&default':{
                                        _nor : 1
                                    }
                                },
                                role2:{
                                    '&default':{
                                        _nor : 1
                                    }
                                },
                                multiplicity1:{
                                    1:{
                                        _nor : 1
                                    }
                                },
                                multiplicity2:{
                                    2:{
                                        _nor : 1
                                    }
                                }
                            }
                        }
                    }
                },
                association:{
                    '&123213' :{//未命名情况下给默认名称，取名规则composition&&123形式和composition&xxxx形式
                        //同名称有两种composition方式，此处统一融合不进行拆分
                        _nor : 1,
                        name:{
                            'hakula' :{
                                _nor:1
                            }
                        },
                        order : {
                            1:{ //此处将两种顺序进行拆分，0表示顺序输出，1代表逆序输出。
                                _nor : 1,
                                role1:{ //此处将不同标记的分开？？？其实不分开也行
                                    '1':{
                                        _nor : 1
                                    }
                                },
                                role2:{
                                    '2':{
                                        _nor : 1
                                    }
                                },
                                multiplicity1:{
                                    1:{
                                        _nor : 1
                                    }
                                },
                                multiplicity2:{
                                    2:{
                                        _nor : 1
                                    }
                                },
                                subsets1:{
                                    1:{
                                        _nor : 1
                                    }
                                },
                                subsets2:{
                                    2:{
                                        _nor : 1
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '333c6aed1025292acee26-333c6aed1025292efds26':{//采用id小的在前
                _nor : 1 ,
                //Name Reform
                //relationName : {
                name : {
                    'wing-geese':{//存储顺序与id对应，显示顺序可以按照小的在前另行调换
                        _nor : 1
                    }
                },
                composition:{
                    '1' :{
                        _nor : 1,
                        name:{
                            '&default' :{ //未命名情况下给默认名称，取名规则composition&&123形式和composition&xxxx形式
                                //同名称有两种composition方式，此处统一融合不进行拆分
                                _nor:1
                            }
                        },
                        order : {
                            1:{ //此处将两种顺序进行拆分，0表示顺序输出，1代表逆序输出。
                                _nor : 1,
                                role1:{ //此处将不同标记的分开？？？其实不分开也行
                                    '&default':{
                                        _nor : 1
                                    }
                                },
                                role2:{
                                    '&default':{
                                        _nor : 1
                                    }
                                },
                                multiplicity1:{
                                    1:{
                                        _nor : 1
                                    }
                                },
                                multiplicity2:{
                                    2:{
                                        _nor : 1
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
];