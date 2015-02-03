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

var Test = require('./test');
exports.test = Test;

var Statistic = require('./statistic');
exports.statistic = Statistic;

var Model = require('./model');
exports.model = Model;

var Settings = require('./settings');
exports.settings = Settings;


