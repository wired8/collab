
/**
 * Module dependencies.
 */
 
var nowjs = require('now')
  , mongoose = require('mongoose')
  , stylus = require('stylus')
  , util = require('util')
  , sys = require('sys')
  , models = require('./models')
  , express = require('express')
  , redis = require("redis")
  , RedisStore = require('connect-redis')(express)
  , chat = require('./lib/chat')
  , sessionStore
  , db;
  

// include authentication helpers
auth = require('./auth').AuthHelper;
 
app = module.exports = express.createServer();

// setup helpers
app.helpers(require('./helpers.js').helpers);
app.dynamicHelpers(require('./helpers.js').dynamicHelpers);

app.helpers({ renderScriptTags: function(scripts) {
  return scripts.map(function(script) {
    return '<script src="http://lab.wired8.com/collab/public/javascripts/' + script + '"></script>';
  }).join('\n ');
}});

app.dynamicHelpers({
  scripts: function(req, res){
    return ['head.min.js', 'scripts.js']; //this will be available in all views
  }
});


// stylus compile function
function compile(str, path, fn) {
  stylus(str)
    .set('filename', path)
    .set('compress', true)
    .render(fn);
}

app.configure('development', function(){
  app.set('m_database', 'collab-dev');
  app.set('m_host', 'localhost');
  app.set('port', 3000);
  app.set('host', 'localhost');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.set('m_database', 'collab');
  app.set('m_host', 'localhost');
  app.set('port', 3002);
  app.set('host', 'lab.wired8.com');
  app.use(express.errorHandler());
});

//configure server instance
app.configure(function(){
  app.set('connstring', 'mongodb://' + app.set('m_host') + '/' + app.set('m_database'));
  app.set('views', __dirname + '/views');
  // set jade as default view engine
  app.set('view engine', 'jade');
  // set stylus as css compile engine
  app.use(stylus.middleware(
    { src: __dirname + '/stylus', dest: __dirname + '/public', compile: compile }
  ));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
 
  // use redis as session middleware
  sessionStore = new RedisStore({'db':'1', maxAge: 1209600000});
  
  app.use(express.session({
    secret: 'kiaora',
    store: sessionStore
  }));
  app.use(express.methodOverride());
  app.use(app.router);
  // use express logger
  app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }));
  app.use(express.static(__dirname + '/public'));
});

//configure mongoose models
models.defineModels(mongoose, function() {
  app.Message = Message = mongoose.model('Message');
  app.User = User = mongoose.model('User');
  app.LoginToken = LoginToken = mongoose.model('LoginToken');
  db = mongoose.connect(app.set('connstring'));
});

// require routes
require('./routes/user');
require('./routes/chat');

// Catch all
app.get('*', function(req, res){
	res.send('Not Found', 404);
});

app.error(function(err, req, res){
	console.log("Error: " + err);
	res.render('500.jade', {
 		title: "Error!", error: err
	});
});


if (!module.parent) {
  app.listen(app.set('port'));
  // TODO: implement cluster as soon as its stable
  /* cluster(app)
.set('workers', 2)
.use(cluster.debug())
.listen(app.set('port')); */
  console.log("Chat app server listening on port %d", app.address().port);
}

var everyone = chat.initialize(app, sessionStore);







