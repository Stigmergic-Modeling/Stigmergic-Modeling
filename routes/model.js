var host = require('../settings').host;
var util = require('../models/util.js');
var fs = require('fs');
var ObjectID = require('mongodb').ObjectID;
var ModelInfo = require('../models/model_info.js');
var Model = require('../models/model.js');

/**
 * workspace 页面 get 方法
 */
exports.enterWorkspace = function(req, res){

    console.log("GET PAGE: Workspace");
    console.log(req.session.user);
    console.log(req.params.model);

    ModelInfo.getByUser(req.params.user, function(err, modelInfo) {
        if (!modelInfo) {
            req.flash('error', 'No model exists');

            return res.redirect('/u/'+ req.session.user.mail);
        }

        var templateData = [];

        //console.log(modelInfo);
        //console.log('modelInfo done');

        modelInfo.forEach(function(info) {
            var modelInfoShow = {};
            modelInfoShow.name = info.name;

            //console.log(modelInfoShow);
            templateData.push(modelInfoShow);
        });

        //console.log(templateData);
        //console.log('templateData done');

        ModelInfo.getOneByUserAndName(req.params.user, req.params.model, function(err, modelInfo) {
            if (!modelInfo) {
                req.flash('error', 'Model does not exist');

                return res.redirect('/u/'+ req.session.user.mail);
            }

            Model.modelGet(modelInfo.ccm_id, req.params.user, function(err, model) {  // 注意这里是CCM的ID
                //console.log('modelInfo._id', modelInfo._id);

                if (!model) {
                    req.flash('error', 'Model entity does not exist' + err);

                    return res.redirect('/u/'+ req.session.user.mail);
                }

                var data = {};

                data.user = req.params.user;
                data.modelID = modelInfo.ccm_id;  // 注意这里是CCM的ID
                data.modelName = modelInfo.name;
                data.model = model;

                //console.log('typeof modelInfo._id', typeof modelInfo._id);
                //console.log('modelInfo._id', modelInfo._id);

                res.render('workspace', {
                    host: host,
                    title: 'Workspace - ' + req.params.model,
                    user : req.session.user,
                    model: req.params.model,  // 该用户当前 model 的 name
                    modelInfo: templateData,  // 该用户所有的 model 信息集合（仅包含 name）
                    data: data,  // 传给前端 js 的数据
                    success : '',  // 为不破坏页面结构，workspace 页面不使用 flash 作为消息显示机制
                    error : ''  // 为不破坏页面结构，workspace 页面不使用 flash 作为消息显示机制
                });
            });
        });
    });
};

/**
 * workspace 页面 post 方法
 */
exports.updateModel = function(req, res) {

    console.log("POST DATA: Workspace");
    console.log(req.session.user);
    //console.log(req.params.user);
    console.log(req.params.model);

    var modelID = new ObjectID(req.body.modelID);  // 重要，从前端传回的ID都是字符串，需要恢复成ObjectID

    console.log('req.body in routes: ', req.body);
    console.log('req.body.orderChanges in routes: ', req.body.orderChanges);
    Model.modelOperation(modelID, req.body.user, req.body.log, req.body.orderChanges, function(err){
        if (err) {
            console.log('ModelOperation Error: ', err);
        }
        return res.send(err);
    });

    /*
    setTimeout(function() {
        res.send('hello world');  // 测试前端载入动画用
    }, 2000);
    */
};

/**
 * model info 页面 get 方法
 */
exports.getInfo = function(req, res){

    console.log("GET PAGE: Model info");
    console.log(req.session.user);
    console.log(req.params.model);

    ModelInfo.getByUser(req.params.user, function(err, modelInfo) {
        var modelNames = [];

        //console.log(modelInfo);
        //console.log('modelInfo done');

        modelInfo.forEach(function(info) {
            var modelInfoShow = {};
            modelInfoShow.name = info.name;

            //console.log(modelInfoShow);
            modelNames.push(modelInfoShow);
        });

        //console.log(templateData);
        //console.log('templateData done');

        ModelInfo.getOneByUserAndName(req.params.user, req.params.model, function(err, icmInfo) {
            if (!icmInfo) {
                req.flash('error', 'Model does not exist');

                return res.redirect('/u/'+ req.session.user.mail);
            }

            var ccmID = icmInfo.ccm_id;

            ModelInfo.getOneByID(ccmID, function(err, ccmInfo) {
                if (!ccmInfo) {
                    req.flash('error', 'Model does not exist');

                    return res.redirect('/u/'+ req.session.user.mail);
                }

                // 构造将传入模板的模型信息
                var modelInfo = {};

                modelInfo.icm = {
                    name: icmInfo.name,
                    description: icmInfo.description,
                    creationDate: util.toHumanDate(icmInfo.creation_date),
                    updateDate: util.toHumanDate(icmInfo.update_date),
                    classNum: icmInfo.class_num,
                    relationNum: icmInfo.relation_num
                };
                modelInfo.ccm = {
                    name: ccmInfo.name,
                    description: ccmInfo.description,
                    creationDate: util.toHumanDate(ccmInfo.creation_date),
                    updateDate: util.toHumanDate(ccmInfo.update_date),
                    classNum: ccmInfo.class_num,
                    relationNum: ccmInfo.relation_num,
                };

                res.render('model_info', {
                    host: host,
                    title: 'Model Info - ' + req.params.model,
                    user : req.session.user,
                    model: req.params.model,  // 该用户当前 model 的 name
                    modelNames: modelNames,  // 该用户所有的 model 信息集合（仅包含 name）
                    modelInfo: modelInfo, // 构造传入后端 ejs 模板的数据
                    success : '',  // 为不破坏页面结构，workspace 页面不使用 flash 作为消息显示机制
                    error : ''  // 为不破坏页面结构，workspace 页面不使用 flash 作为消息显示机制
                });
            });
        });
    });
};

/**
 * new model 页面 get 方法
 */
exports.createModel = function(req, res) {

    console.log("GET PAGE: New Model");
    console.log(req.session.user);

    // 获取所有的 CCM    TODO：此为临时方案，省略了搜索
    ModelInfo.getByUser('@', function(err, modelInfo) {
        var ccmInfo = {};

        //console.log(modelInfo);
        //console.log('modelInfo done');

        modelInfo.forEach(function(info) {
            ccmInfo[info.name] = info.description;
        });

        //console.log(templateData);
        //console.log('templateData done');

        res.render('new_model', {
            host: host,
            title: 'New Model',
            user : req.session.user,
            data: {ccmInfo: ccmInfo},  // 传给前端JS
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
};

/**
 * new model 页面 post 方法 (clean creation)
 */
exports.doCleanCreateModel = function(req, res) {

    console.log("POST DATA: doCleanCreateModel");
    console.log(req.session.user);

    var date = new Date();
    var newID = new ObjectID();

    // 创建 CCM
    var newCCM = new ModelInfo({
        _id: newID,
        ccm_id: newID,
        user: '@',  // @ 表示是 CCM
        name: req.body.name,
        description: req.body.description,
        creation_date: date,
        update_date: date,
        class_num: 0,
        relation_num: 0
    });

    newCCM.save(function(err) {
        if (err) {
            if (err.toString().indexOf('duplicate key') !== -1) {

                req.flash('error', 'Model name collision with an exiting CCM');
                return res.redirect('/newmodel');
            }

            req.flash('error', err.toString());
            return res.redirect('/newmodel');
        }

        // 创建 ICM
        var newID_icm = new ObjectID();

        var newICM = new ModelInfo({
            _id: newID_icm,
            ccm_id: newID,  // 此 id 与刚刚创建的 ccm id 相同
            user: req.session.user.mail,
            name: req.body.name,
            description: req.body.description,
            creation_date: date,
            update_date: date,
            class_num: 0,
            relation_num: 0
        });

        newICM.save(function(err) {
            if (err) {
                console.log('err', err);

                if (err.toString().indexOf('duplicate key') !== -1) {
                    req.flash('error', 'Model name collision with one ICM you already possessed');
                    return res.redirect('/newmodel');
                }

                req.flash('error', err.toString());
                return res.redirect('/newmodel');
            }

            req.flash('success', 'Create model successfully');
            res.redirect('/' + req.session.user.mail + '/' + req.body.name + '/workspace');
        });
    });
};

/**
 * new model 页面 post 方法 (inherited creation)
 */
exports.doInheritedCreateModel = function(req, res) {

    console.log("POST DATA: doInheritedCreateModel");
    console.log(req.session.user);

    var date = new Date();
    var newID = new ObjectID();

    ModelInfo.getOneByUserAndName('@', req.body.ccm, function(err, ccmInfo) {
        if (!ccmInfo) {
            req.flash('error', 'Model does not exist');

            return res.redirect('/newmodel');
        }

        var ccmID = ccmInfo._id;
        var newICM = new ModelInfo({
            _id: newID,
            ccm_id: ccmID,
            user: req.session.user.mail,
            name: req.body.name,
            description: req.body.description,
            creation_date: date,
            update_date: date,
            class_num: 0,
            relation_num: 0
        });

        newICM.save(function(err) {
            if (err) {
                if (err.toString().indexOf('duplicate key') !== -1) {

                    req.flash('error', 'Model name collision with one ICM you already possessed');
                    return res.redirect('/newmodel');
                }

                req.flash('error', err.toString());
                return res.redirect('/newmodel');
            }

            req.flash('success', 'Create model successfully');
            res.redirect('/' + req.session.user.mail + '/' + req.body.name + '/workspace');
        });
    });
};

///**
// * 构造 workspace 页面的前端 js 需要用到的数据
// */
//function makeDataForWorkspace(user, modelID, modelName) {
//    var data = {};
//
//    data.user = user;
//    data.modelID = modelID;
//    data.modelName = modelName;
//
//
//    //var data = {};
//    //
//    //data.user = user;
//    //data.modelID = modelID;
//    //data.modelName = modelName;
//    //
//    //data.model =
//    //
//    //        // 测试数据。
//    //
//    //        [
//    //            {
//    //                "Course": [
//    //                    {
//    //                        "code": [
//    //                            {
//    //                                "name": "code",
//    //                                "type": "string",
//    //                                "visibility": "public"
//    //                            }
//    //                        ],
//    //                        "credit": [
//    //                            {
//    //                                "name": "credit",
//    //                                "type": "float",
//    //                                "visibility": "private"
//    //                            }
//    //                        ],
//    //                        "availability": [
//    //                            {
//    //                                "name": "availability",
//    //                                "type": "CourseAvailability",
//    //                                "visibility": "protected",
//    //                                "readOnly": "True"
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["code", "credit", "availability"]
//    //                    }
//    //                ],
//    //                "CourseActivity": [
//    //                    {
//    //                        "startTime": [
//    //                            {
//    //                                "name": "startTime",
//    //                                "type": "Time"
//    //                            }
//    //                        ],
//    //                        "endTime": [
//    //                            {
//    //                                "name": "endTime",
//    //                                "type": "Time"
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["startTime", "endTime"]
//    //                    }
//    //                ],
//    //                "Student": [
//    //                    {
//    //                        "code": [
//    //                            {
//    //                                "name": "code",
//    //                                "type": "string"
//    //                            }
//    //                        ],
//    //                        "enrollmentDate": [
//    //                            {
//    //                                "name": "enrollmentDate",
//    //                                "type": "Date"
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["code", "enrollmentDate"]
//    //                    }
//    //                ],
//    //                "Teacher": [
//    //                    {
//    //                        "facultyCode": [
//    //                            {
//    //                                "name": "facultyCode",
//    //                                "type": "string"
//    //                            }
//    //                        ],
//    //                        "title": [
//    //                            {
//    //                                "name": "title",
//    //                                "type": "Title"
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["facultyCode", "title"]
//    //                    }
//    //                ],
//    //                "User": [
//    //                    {
//    //                        "email": [
//    //                            {
//    //                                "name": "email",
//    //                                "type": "string"
//    //                            }
//    //                        ],
//    //                        "username": [
//    //                            {
//    //                                "name": "username",
//    //                                "type": "string"
//    //                            }
//    //                        ],
//    //                        "photo": [
//    //                            {
//    //                                "name": "photo",
//    //                                "type": "Image"
//    //                            }
//    //                        ],
//    //                        "password": [
//    //                            {
//    //                                "name": "password",
//    //                                "type": "string"
//    //                            }
//    //                        ],
//    //                        "birthDate": [
//    //                            {
//    //                                "name": "birthDate",
//    //                                "type": "Date"
//    //                            }
//    //                        ],
//    //                        "name": [
//    //                            {
//    //                                "name": "name",
//    //                                "type": "string"
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["username", "password", "name", "birthDate", "email", "photo"]
//    //                    }
//    //                ],
//    //                "Department": [
//    //                    {
//    //                        "name": [
//    //                            {
//    //                                "name": "name",
//    //                                "type": "string"
//    //                            }
//    //                        ],
//    //                        "code": [
//    //                            {
//    //                                "name": "code",
//    //                                "type": "string"
//    //                            }
//    //                        ],
//    //                        "requiredCreditOfM": [
//    //                            {
//    //                                "name": "requiredCreditOfM",
//    //                                "type": "RequiredCredit"
//    //                            }
//    //                        ],
//    //                        "requiredCreditOfB": [
//    //                            {
//    //                                "name": "requiredCreditOfB",
//    //                                "type": "RequiredCredit"
//    //                            }
//    //                        ],
//    //                        "requiredCreditOfD": [
//    //                            {
//    //                                "name": "requiredCreditOfD",
//    //                                "type": "RequiredCredit"
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["name", "code", "requiredCreditOfB", "requiredCreditOfM", "requiredCreditOfD"]
//    //                    }
//    //                ]
//    //            },
//    //            {
//    //                "Course-CourseActivity": [
//    //                    {
//    //                        "tempid1419265720151": [
//    //                            {
//    //                                "type": [
//    //                                    "Composition",
//    //                                    "possess"
//    //                                ],
//    //                                "role": [
//    //                                    "whole",
//    //                                    "part"
//    //                                ],
//    //                                "class": [
//    //                                    "Course",
//    //                                    "CourseActivity"
//    //                                ],
//    //                                "multiplicity": [
//    //                                    "1",
//    //                                    "*"
//    //                                ]
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["tempid1419265720151"]
//    //                    }
//    //                ],
//    //                "Course-Student": [
//    //                    {
//    //                        "tempid1419597303227": [
//    //                            {
//    //                                "type": [
//    //                                    "Association",
//    //                                    ""
//    //                                ],
//    //                                "class": [
//    //                                    "Course",
//    //                                    "Student"
//    //                                ],
//    //                                "multiplicity": [
//    //                                    "0..*",
//    //                                    "*"
//    //                                ]
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["tempid1419597303227"]
//    //                    }
//    //                ],
//    //                "Course-Teacher": [
//    //                    {
//    //                        "tempid1419597378206": [
//    //                            {
//    //                                "type": [
//    //                                    "Association",
//    //                                    ""
//    //                                ],
//    //                                "class": [
//    //                                    "Course",
//    //                                    "Teacher"
//    //                                ],
//    //                                "multiplicity": [
//    //                                    "0..*",
//    //                                    "1..*"
//    //                                ]
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["tempid1419597378206"]
//    //                    }
//    //                ],
//    //                "Student-User": [
//    //                    {
//    //                        "tempid1419597406622": [
//    //                            {
//    //                                "type": [
//    //                                    "Generalization",
//    //                                    ""
//    //                                ],
//    //                                "role": [
//    //                                    "father",
//    //                                    "child"
//    //                                ],
//    //                                "class": [
//    //                                    "User",
//    //                                    "Student"
//    //                                ],
//    //                                "multiplicity": [
//    //                                    "1",
//    //                                    "1"
//    //                                ]
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["tempid1419597406622"]
//    //                    }
//    //                ],
//    //                "Teacher-User": [
//    //                    {
//    //                        "tempid1419597442832": [
//    //                            {
//    //                                "type": [
//    //                                    "Generalization",
//    //                                    ""
//    //                                ],
//    //                                "role": [
//    //                                    "father",
//    //                                    "child"
//    //                                ],
//    //                                "class": [
//    //                                    "User",
//    //                                    "Teacher"
//    //                                ],
//    //                                "multiplicity": [
//    //                                    "1",
//    //                                    "1"
//    //                                ]
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["tempid1419597442832"]
//    //                    }
//    //                ],
//    //                "Course-Department": [
//    //                    {
//    //                        "tempid1419597640012": [
//    //                            {
//    //                                "type": [
//    //                                    "Association",
//    //                                    ""
//    //                                ],
//    //                                "class": [
//    //                                    "Course",
//    //                                    "Department"
//    //                                ],
//    //                                "multiplicity": [
//    //                                    "*",
//    //                                    "1"
//    //                                ]
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["tempid1419597640012"]
//    //                    }
//    //                ],
//    //                "Department-Student": [
//    //                    {
//    //                        "tempid1419597702615": [
//    //                            {
//    //                                "type": [
//    //                                    "Association",
//    //                                    ""
//    //                                ],
//    //                                "class": [
//    //                                    "Department",
//    //                                    "Student"
//    //                                ],
//    //                                "multiplicity": [
//    //                                    "1..*",
//    //                                    "*"
//    //                                ]
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["tempid1419597702615"]
//    //                    }
//    //                ],
//    //                "Department-Teacher": [
//    //                    {
//    //                        "tempid1419597718239": [
//    //                            {
//    //                                "type": [
//    //                                    "Association",
//    //                                    ""
//    //                                ],
//    //                                "class": [
//    //                                    "Department",
//    //                                    "Teacher"
//    //                                ],
//    //                                "multiplicity": [
//    //                                    "1..*",
//    //                                    "*"
//    //                                ]
//    //                            }
//    //                        ]
//    //                    },
//    //                    {
//    //                        "order": ["tempid1419597718239"]
//    //                    }
//    //                ]
//    //            }
//    //        ];
//    //
//    //return data;
//}


