
var express = require('express');
var http = require('http');


var settings = require('./settings');
var MongoStore = require('connect-mongo')(express);

var partials = require('express-partials');
var flash = require('connect-flash');

var sessionStore = new MongoStore({
						db : settings.db.name
					}, function() {
							console.log('connect mongodb success...');
					});

var log4js = require('log4js');
var logger = require('./models/logger.js')
log4js.configure({
    appenders: [
        { type: 'console' }, //控制台输出
        {
            type: 'dateFile',
            filename: 'logs/click.log',
            pattern: "-yyyy-MM-dd",

            alwaysIncludePattern: false,

            backups: 4,
            category: 'process'
        }
    ],
    replaceConsole: true
});
logger.setLogger(log4js.getLogger('process'));

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');

	app.use(partials());
	app.use(flash());

	app.use(express.favicon(__dirname + '/public/src/img/favicon.ico'));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use(express.cookieParser());
	
	app.use(express.session({
		secret : settings.cookie_secret,
		cookie : {
			maxAge : 7*24*60*60*1000	//ms
		},
		store : sessionStore
	}));

	app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(log4js.connectLogger(log4js.getLogger('normal'), {level:log4js.levels.INFO}));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

//routes
var routes = require('./routes');
app.get('/', routes.home.index);

app.all('/reg',routes.state.checkNotLogin);
app.get('/reg', routes.home.reg);
app.post('/reg', routes.home.doReg);

app.all('/login',routes.state.checkNotLogin);
app.get('/login', routes.home.login);
app.post('/login', routes.home.doLogin);

//app.get('/logout', routes.state.checkLogin);
app.get('/logout', routes.home.logout);

app.get('/checkmail',routes.state.checkNotActive);
app.get('/checkmail',routes.home.checkMail);
app.post('/checkmail',routes.state.checkNotActive);
app.post('/checkmail',routes.home.doCheckMail);

app.get('/checklink/:user/:link',routes.home.checkLink);

app.get('/forget',routes.home.forget);
app.post('/forget',routes.home.doForget);

app.get('/revisePW/:user/:link',routes.home.revisePW);
app.post('/revisePW/:user/:link',routes.home.doRevisePW);

app.get('/u/:user',routes.state.checkLogin);
app.get('/u/:user', routes.user.user);
//app.get('/u/:user', routes.user);

//app.get('/:user/involved/:id',routes.state.checkLogin);
app.get('/:user/involved/:id',routes.involve.on);

//统计
app.get('/:user/statistic/:id',routes.statistic.on);
app.post('/:user/statistic/:id',routes.statistic.show);

app.get('/:user/statistic-icd/:id',routes.statistic.statisticIcdGet);
app.post('/:user/statistic-icd/:id',routes.statistic.statisticIcdPost);

app.get('/:user/statistic-operationScore',routes.statistic.operationScoreGet);
app.post('/:user/statistic-operationScore',routes.statistic.operationScorePost);

app.get('/:user/statistic-cite/:id',routes.statistic.citedOrderGet);


app.get('/:user/uninvolved/:id',routes.state.checkLogin);
app.get('/:user/uninvolved/:id',routes.involve.create);
//app.get('/:user/uninvolved/:id',routes.involve.intro);
//app.post('/:user/uninvolved/:id',routes.involve.create);

app.get('/:user/own',routes.state.checkLogin);
app.get('/:user/own',routes.own.on);

app.post('/:user/own/create',routes.state.checkLogin);
app.post('/:user/own/create',routes.own.create);

//app.get('/own/:id',routes.state.checkLogin);
//app.get('/own/:id',routes.own.on);

app.get('/:user/intro/:id',routes.state.checkLogin);
app.get('/:user/intro/:id',routes.intro.on);


app.post('/post/html/:file',routes.html.getHtml);
app.get('/test/:id',routes.test.testUI);
app.post('/post/modal',routes.test.testPost);
app.post('/post/search',routes.test.testSearch);
app.post('/post/search/cd',routes.test.testSearchCD);
app.post('/post/search/class',routes.test.testSearchClass);
app.post('/post/search/relation',routes.test.testSearchRelation);

app.post('/post/data/icd',routes.data.icd);
//app.post('/post/data/icd-cd',routes.data.icdCD);
//app.post('/post/data/icd-class',routes.data.icdClass);
//app.post('/post/data/icd-relation',routes.data.icdRelation);
app.post('/post/data/icd-element',routes.data.icdElement);
app.post('/post/data/icd-operationValue',routes.data.icdOperationValue);

app.post('/post/data/ccd',routes.data.ccd);

app.post('/post/data/index',routes.data.index);
app.post('/post/data/intro',routes.data.intro);


app.post('/post/data/icd-attributeSort',routes.data.icdAttributeSort);

app.get('/reset',routes.test.reset);

app.get('/comment',routes.test.getComment);

// about 页面 get 方法
app.get('/about', routes.home.getAbout);  // 不需要登录状态验证

// workspace 页面 get 方法
app.all('/:user/:model/workspace',routes.state.checkLogin);
app.get('/:user/:model/workspace', routes.model.enterWorkspace);

// model info 页面 get 方法
app.all('/:user/:model/info',routes.state.checkLogin);
app.get('/:user/:model/info', routes.model.getInfo);

// user settings 页面 get、post 方法
app.all('/u/:user/settings/profile',routes.state.checkLogin);
app.get('/u/:user/settings/profile', routes.user.settings);
app.post('/u/:user/settings/profile', routes.user.updateProfile);


http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

var db = require('./models/db.js');
var mongodb = new db();

mongodb.trueBase(function(err,db){
    //console.log("DB.inited");
});
