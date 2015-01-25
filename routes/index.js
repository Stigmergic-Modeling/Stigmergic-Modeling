//var db = require('../models/db.js');
//var mongodb = new db();

//mongodb.trueBase(function(err,db){
    //console.log("DB.inited");
//});

//route
var Home = require('./home');
exports.home = Home;

var User = require('./user');
exports.user = User;

var State = require('./state');
exports.state = State;

var Html = require('./html');
exports.html = Html;

var Data = require('./data');
exports.data = Data;

var Involve =require('./involve');
exports.involve = Involve;

var Own =require('./own');
exports.own = Own;

var Intro =require('./intro');
exports.intro = Intro;

var Test = require('./test') ;
exports.test = Test;

var Statistic = require('./statistic') ;
exports.statistic = Statistic;

var Model = require('./model');
exports.model = Model;

var Settings = require('./settings');
exports.settings = Settings;


