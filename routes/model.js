var settings = require('../settings');
var util = require('../models/util.js');
var fs = require('fs');
var ObjectID = require('mongodb').ObjectID;
var ModelInfo = require('../models/model_info.js');
var Model = require('../models/model.js');
var CCM = require('../models/collective_model.js');

/**
 * workspace 页面 get 方法
 */
exports.enterWorkspace = function(req, res){

    console.log("GET PAGE: Workspace");
    console.log(req.session.user);
    console.log(req.params.model);

    ModelInfo.getByUser(req.session.user.mail, function(err, modelInfo) {
        if (!modelInfo) {
            req.flash('error', 'No model exists');

            return res.redirect('/u');
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

        ModelInfo.getOneByUserAndName(req.session.user.mail, req.params.model, function(err, modelInfo) {
            if (!modelInfo) {
                req.flash('error', 'Model does not exist');

                return res.redirect('/u');
            }

            Model.modelGet(modelInfo.ccm_id, req.session.user.mail, function(err, model) {  // 注意这里是CCM的ID
                //console.log('modelInfo._id', modelInfo._id);

                if (!model) {
                    req.flash('error', 'Model entity does not exist' + err);

                    return res.redirect('/u');
                }

                var data = {};

                data.user = req.session.user.mail;
                data.modelID = modelInfo.ccm_id;  // 注意这里是CCM的ID
                data.modelName = modelInfo.name;
                data.model = model;

                //console.log('typeof modelInfo._id', typeof modelInfo._id);
                //console.log('modelInfo._id', modelInfo._id);

                res.render('workspace', {
                    host: settings.host,
                    port: settings.port,
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
    console.log(req.params.model);

    var modelID = new ObjectID(req.body.modelID);  // 重要，从前端传回的ID都是字符串，需要恢复成ObjectID

    //console.log('req.body in routes: ', req.body);
    //console.log('req.body.orderChanges in routes: ', req.body.orderChanges);

    // modelID 是 ccm 的 ID，modelName 是 icm 的 name
    Model.modelOperation(modelID, req.body.modelName, req.body.user, req.body.log, req.body.orderChanges, function(err){
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
 * workspace 页面获取最新 ccm 方法
 */
exports.getCCM = function(req, res) {

    console.log("GET CCM: Workspace");
    console.log(req.session.user);
    console.log(req.params.model);

    ModelInfo.getOneByUserAndName(req.session.user.mail, req.params.model, function(err, modelInfo) {
        if (!modelInfo) {
            req.flash('error', 'No model exists');

            return res.redirect('/u');
        }

        //console.log(modelInfo);
        //console.log('modelInfo done');

        CCM.getCollectiveModel(modelInfo.ccm_id, function(err, ccm) {
            console.log(ccm);
            res.send(ccm);
        });
    });
};

/**
 * workspace demo 页面 get 方法
 */
exports.enterWorkspaceDemo = function(req, res){

    console.log("GET PAGE: Workspace Demo");
    //console.log(req.session.user);
    //console.log(req.params.model);

    var user = {mail: 'tryitnow@stigmod.net'};
    var modelName = 'CourseManagementSystemDemo';
    var templateData = [{name: modelName}];
    var model = [{"Course":[{"code":[{"name":"code","type":"string"}],"credit":[{"name":"credit","type":"float"}],"description":[{"name":"description","type":"Text"}],"capacity":[{"name":"capacity","type":"int"}],"character":[{"name":"character","type":"CourseCharacter"}],"name":[{"name":"name","type":"string"}],"availability":[{"name":"availability","type":"CourseAvailability"}]},{"order":["name","code","credit","description","capacity","character","availability"]}],"CourseActivity":[{"startTime":[{"name":"startTime","type":"Time"}],"endTime":[{"name":"endTime","type":"Time"}],"place":[{"name":"place","type":"string"}],"date":[{"name":"date","type":"SchoolDate"}],"weekNum":[{"name":"weekNum","type":"int"}]},{"order":["startTime","endTime","place","date","weekNum"]}],"CourseAvailability":[{"undergraduateAvailable":[{"name":"undergraduateAvailable","type":"boolean"}],"masterStudentAvailable":[{"name":"masterStudentAvailable","type":"boolean"}],"phDStudentAvailable":[{"name":"phDStudentAvailable","type":"boolean"}]},{"order":["undergraduateAvailable","masterStudentAvailable","phDStudentAvailable"]}],"CourseCharacter":[{"compulsory":[{"name":"compulsory"}],"elective":[{"name":"elective"}],"limited":[{"name":"limited"}]},{"order":["compulsory","elective","limited"]}],"Date":[{"day":[{"name":"day"}],"month":[{"name":"month"}],"year":[{"name":"year"}]},{"order":["day","month","year"]}],"DayOfWeek":[{"sunday":[{"name":"sunday"}],"monday":[{"name":"monday"}],"tuesday":[{"name":"tuesday"}],"wednsday":[{"name":"wednsday"}],"thursday":[{"name":"thursday"}],"friday":[{"name":"friday"}],"saturday":[{"name":"saturday"}]},{"order":["sunday","monday","tuesday","wednsday","thursday","friday","saturday"]}],"Department":[{"requiredCreditOfM":[{"name":"requiredCreditOfM","type":"RequiredCredit"}],"requiredCreditOfB":[{"name":"requiredCreditOfB","type":"RequiredCredit"}],"requiredCreditOfD":[{"name":"requiredCreditOfD","type":"RequiredCredit"}],"name":[{"name":"name","type":"string"}],"code":[{"name":"code","type":"string"}]},{"order":["name","code","requiredCreditOfM","requiredCreditOfB","requiredCreditOfD"]}],"Examination":[{"supervisor":[{"name":"supervisor","type":"string"}]},{"order":["supervisor"]}],"ExerciseLesson":[{"teachingAssistant":[{"name":"teachingAssistant","type":"string"}]},{"order":["teachingAssistant"]}],"Image":[{"height":[{"name":"height","type":"int"}],"width":[{"name":"width","type":"int"}],"imageURL":[{"name":"imageURL","type":"string"}]},{"order":["height","width","imageURL"]}],"Lecture":[{"lecturer":[{"name":"lecturer","type":"string"}]},{"order":["lecturer"]}],"MasterStudent":[{},{"order":[]}],"PhDStudent":[{},{"order":[]}],"RequiredCredit":[{"limitedCredit":[{"name":"limitedCredit","type":"float"}],"electiveCredit":[{"name":"electiveCredit","type":"float"}],"compulsoryCredit":[{"name":"compulsoryCredit","type":"float"}]},{"order":["limitedCredit","electiveCredit","compulsoryCredit"]}],"SchoolCalender":[{},{"order":[]}],"SchoolDate":[{"week":[{"name":"week","type":"Week"}],"semester":[{"name":"semester","type":"Semester"}],"schoolYear":[{"name":"schoolYear","type":"SchoolYear"}],"dayOfWeek":[{"name":"dayOfWeek","type":"DayOfWeek"}]},{"order":["week","semester","schoolYear","dayOfWeek"]}],"SchoolYear":[{"startYear":[{"name":"startYear","type":"Year"}],"endYear":[{"name":"endYear","type":"Year"}]},{"order":["startYear","endYear"]}],"Semester":[{"spring":[{"name":"spring"}],"fall":[{"name":"fall"}],"summer":[{"name":"summer"}]},{"order":["spring","fall","summer"]}],"Student":[{"code":[{"name":"code","type":"string"}],"enrollmentDate":[{"name":"enrollmentDate","type":"Date"}]},{"order":["code","enrollmentDate"]}],"StudentAssessment":[{"paperScore":[{"name":"paperScore","type":"float"}],"attendenceScore":[{"name":"attendenceScore","type":"float"}],"projectScore":[{"name":"projectScore","type":"float"}],"midtermExamScore":[{"name":"midtermExamScore","type":"float"}],"finalExamScore":[{"name":"finalExamScore","type":"float"}],"finalAssessment":[{"name":"finalAssessment","type":"float"}]},{"order":["paperScore","attendenceScore","projectScore","midtermExamScore","finalExamScore","finalAssessment"]}],"Teacher":[{"facultyCode":[{"name":"facultyCode","type":"string"}],"title":[{"name":"title","type":"Title"}]},{"order":["facultyCode","title"]}],"Text":[{"str":[{"name":"str","type":"string","multiplicity":"*","ordering":"True"}]},{"order":["str"]}],"Time":[{"minute":[{"name":"minute"}],"hour":[{"name":"hour"}],"second":[{"name":"second"}]},{"order":["hour","minute","second"]}],"Title":[{"professor":[{"name":"professor"}],"associateProfessor":[{"name":"associateProfessor"}],"assistantProfessor":[{"name":"assistantProfessor"}],"lecturer":[{"name":"lecturer"}]},{"order":["professor","associateProfessor","assistantProfessor","lecturer"]}],"Undergraduate":[{"email":[{"name":"email","type":"string"}],"username":[{"name":"username","type":"string"}],"photo":[{"name":"photo","type":"Image"}],"password":[{"name":"password","type":"string"}],"birthDate":[{"name":"birthDate","type":"Date"}],"name":[{"name":"name","type":"string"}]},{"order":["name","birthDate","username","password","email","photo"]}],"User":[{},{"order":[]}],"Week":[{"weekOne":[{"name":"weekOne"}],"weekTwo":[{"name":"weekTwo"}],"weekThree":[{"name":"weekThree"}]},{"order":["weekOne","weekTwo","weekThree"]}],"Year":[{},{"order":[]}]},{"PhDStudent-Student":[{"550ad58d004b148de2988710":[{"role":["father","child"],"class":["Student","PhDStudent"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad58d004b148de2988710"]}],"Course-CourseActivity":[{"550ad3f9004b1404070f6798":[{"type":["Composition",""],"role":["whole","part"],"class":["Course","CourseActivity"],"multiplicity":["1","*"]}]},{"order":["550ad3f9004b1404070f6798"]}],"Course-Department":[{"550ad444004b14d17ab88919":[{"type":["Association",""],"role":["a","a"],"class":["Course","Department"],"multiplicity":["*","1"]}]},{"order":["550ad444004b14d17ab88919"]}],"Course-Student":[{"550ad49a004b14d17ab8891a":[{"type":["Association",""],"role":["a","a"],"class":["Course","Student"],"multiplicity":["0..*","*"]}]},{"order":["550ad49a004b14d17ab8891a"]}],"Course-Teacher":[{"550ad4c3004b14d17ab8891b":[{"type":["Association",""],"role":["a","a"],"class":["Course","Teacher"],"multiplicity":["0..*","1..*"]}]},{"order":["550ad4c3004b14d17ab8891b"]}],"CourseActivity-Examination":[{"550ad4d6004b14d17ab8891c":[{"role":["father","child"],"class":["CourseActivity","Examination"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad4d6004b14d17ab8891c"]}],"CourseActivity-ExerciseLesson":[{"550ad4fb004b148de298870a":[{"role":["father","child"],"class":["CourseActivity","ExerciseLesson"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad4fb004b148de298870a"]}],"CourseActivity-Lecture":[{"550ad506004b148de298870b":[{"role":["father","child"],"class":["CourseActivity","Lecture"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad506004b148de298870b"]}],"Date-SchoolCalender":[{"550ad51a004b148de298870c":[{"type":["Aggregation",""],"role":["owner","ownee"],"class":["Date","SchoolCalender"],"multiplicity":["1","*"]}]},{"order":["550ad51a004b148de298870c"]}],"Teacher-User":[{"550ad5e3004b1407c7fd8718":[{"role":["father","child"],"class":["User","Teacher"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad5e3004b1407c7fd8718"]}],"Student-User":[{"550ad5dc004b1407c7fd8717":[{"role":["father","child"],"class":["User","Student"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad5dc004b1407c7fd8717"]}],"Department-Student":[{"550ad530004b148de298870d":[{"type":["Association",""],"role":["a","a"],"class":["Department","Student"],"multiplicity":["1..*","*"]}]},{"order":["550ad530004b148de298870d"]}],"Department-Teacher":[{"550ad55f004b148de298870e":[{"type":["Association",""],"role":["a","a"],"class":["Department","Teacher"],"multiplicity":["1..*","*"]}]},{"order":["550ad55f004b148de298870e"]}],"RequiredCredit-Student":[{"550ad56c004b148de298870f":[{"role":["father","child"],"class":["Student","RequiredCredit"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad56c004b148de298870f"]}],"SchoolCalender-SchoolDate":[{"550ad5af004b148de2988711":[{"type":["Aggregation",""],"role":["owner","ownee"],"class":["SchoolCalender","SchoolDate"],"multiplicity":["1","*"]}]},{"order":["550ad5af004b148de2988711"]}],"Student-Undergraduate":[{"550ad5cf004b1407c7fd8716":[{"role":["father","child"],"class":["Student","Undergraduate"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad5cf004b1407c7fd8716"]}]}];


    var data = {};
    data.user = user.mail;
    data.modelID = '';  // 注意这里是CCM的ID
    data.modelName = modelName;
    data.model = model;

    res.render('workspace_demo', {
        host: settings.host,
        port: settings.port,
        title: 'Workspace Demo - ' + req.params.model,
        user : user,
        model: modelName,  // 该用户当前 model 的 name
        modelInfo: templateData,  // 该用户所有的 model 信息集合（仅包含 name）
        data: data,  // 传给前端 js 的数据
        success : '',  // 为不破坏页面结构，workspace 页面不使用 flash 作为消息显示机制
        error : ''  // 为不破坏页面结构，workspace 页面不使用 flash 作为消息显示机制
    });
};

/**
 * model info 页面 get 方法
 */
exports.getInfo = function(req, res){

    console.log("GET PAGE: Model info");
    console.log(req.session.user);
    console.log(req.params.model);

    ModelInfo.getByUser(req.session.user.mail, function(err, modelInfo) {
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

        ModelInfo.getOneByUserAndName(req.session.user.mail, req.params.model, function(err, icmInfo) {
            if (!icmInfo) {
                req.flash('error', 'Model does not exist');

                return res.redirect('/u');
            }

            var ccmID = icmInfo.ccm_id;

            ModelInfo.getOneByID(ccmID, function(err, ccmInfo) {
                if (!ccmInfo) {
                    req.flash('error', 'Model does not exist');

                    return res.redirect('/u');
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
                    peopleNum: ccmInfo.people_num
                };

                res.render('model_info', {
                    host: settings.host,
                    port: settings.port,
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
            host: settings.host,
            port: settings.port,
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
        relation_num: 0,
        people_num: 1
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
            relation_num: 0,
            people_num: 1
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
            res.redirect('/' + req.body.name + '/workspace');
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
            relation_num: 0,
            people_num: 1
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

            // CCM 参与人数加 1
            ccmInfo.updateModelInfo({
                $inc: {people_num: 1},
                update_date: new Date()

            }, function (err) {
                if (err) {
                    req.flash('error', err.toString());
                    return res.redirect('/newmodel');
                }

                // 向前端反馈结果
                req.flash('success', 'Create model successfully');
                res.redirect('/' + req.body.name + '/workspace');
            });
        });
    });
};

