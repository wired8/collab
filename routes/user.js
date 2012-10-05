var mongoose = require("mongoose");
var email = require("../lib/email");
var common = require("../lib/common");

// login route
app.post('/login', function(req, res) {
  User.findOne({ $or:[{ email: req.body.email }, { name: { $regex : new RegExp(req.body.email, "i") } }] }, function(err, user) {
    if (user && user.authenticate(req.body.password)) {
      req.session.user_id = user.id;
      req.session.username = user.name;
      req.session.email = user.email;
      
      if (req.body.remember_me) {
        var loginToken = new LoginToken({ email: user.email });
        loginToken.save(function() {
          res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
        });
      }
      res.redirect('/lobby');
    } else {
      req.flash('error', 'Wrong Username/Email and password combination.');
      res.redirect('/login');
    }
  });
});


// reset password form route
app.get('/resetpassword/:id', function(req, res) {
	var id = req.params.id;
	if (id) {
	  res.render('user/resetpassword', {
	    locals: {
	      hashedPassword: id,
	    }
	  });
  } else {
		res.redirect('/error');  
	}
});

// reset password form route
app.post('/resetpassword', function(req, res) {
    User.findOne({ hashed_password: req.body.id }, function(err, user) {
    	if (user) {
    	  user.password = req.body.password;
    		user.save(function(err, updated) {
    			if (err) res.redirect('/error');
    		});
    	} else {
    		res.redirect('/error');
    	}
    });
		res.redirect('/passwordreset');
});


// password has been reset form route
app.get('/', function(req, res) {
	if (req.session && req.session.user_id) {
		res.redirect('/lobby');
	} else {
		res.render('user/home', {
  	});	
  }
});

// login form route
app.get('/login', function(req, res) {
	res.render('user/login', {
	 locals: {
      user: new User(),
      register: new User()
    }
  });	
});

// password has been reset form route
app.get('/passwordreset', function(req, res) {
	res.render('user/passwordreset', {
  });	
});

// forgot password form route
app.get('/forgotpassword', function(req, res) {
	res.render('user/forgotpassword', {
  });	
});

// email sent route
app.get('/emailsent', function(req, res) {
	res.render('user/emailsent', {
  });	
});

// forgot password route
app.post('/forgotpassword', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (user) {
      email.forgotPassword(user.email, user.name, common.baseUrl(req), common.baseUrl(req) + '/resetpassword/' + user.hashed_password);
      res.redirect('/emailsent');
    } else {
      req.flash('error', 'No such account!');
      res.redirect('/error');
    }
  });
});

// create new room route
app.post('/newroom', function(req, res) {
	var nRoom = new Room();
	nRoom.name = req.body.roomname;
	nRoom.url = encodeURIComponent(req.body.roomname.replace(/[^a-z0-9]/gi,'').toLowerCase()); 
	nRoom.description = req.body.roomsubject;
	nRoom.type = req.body.create_room_access;
	nRoom.userid = mongoose.Types.ObjectId(req.session.user_id);
	nRoom.created = new Date();
	nRoom.private = req.body.create_room_access == 'private' ? 1 : 0;
	nRoom.save(function(err) {
    if (err) res.redirect('/error');
    var nRoomUser = new RoomUser();
    nRoomUser.userid = mongoose.Types.ObjectId(req.session.user_id);
    nRoomUser.roomid = mongoose.Types.ObjectId(nRoom.id);
    nRoomUser.save(function(err) {
      if (err) res.redirect('/error');
    	req.flash('info', 'New room created');
    	res.redirect('/lobby');
    });
  });
});

//logout user
app.get('/logout', auth.loadUser, function(req, res) {
  if (req.session) {
    LoginToken.remove({ email: req.currentUser.email }, function() {});
    res.clearCookie('logintoken');
    req.session.destroy(function() {});
  }
  res.redirect('/');
});

// register form route
app.get('/register', function(req, res) {
  res.render('user/register', {
    locals: {
      register: new User()
    }
  });
});

// register error route
app.get('/error', function(req, res) {
  res.render('user/error', {
  });
});

// register about route
app.get('/about', function(req, res) {
  res.render('user/about', {
  });
});

// register contact route
app.get('/contact', function(req, res) {
  res.render('user/contact', {
  });
});

app.get('/delete/:email', function(req, res) {
  User.remove({ email: req.params.email }, function(err, user) {
  	if (err) res.redirect('/error');
  });
  console.log('removed:' + req.params.email);
  res.redirect('/');
});


// create user route
app.post('/register', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (user) {
      // show error on username
      req.flash('error', 'Email address already registered!');
      res.render('user/register', {
        locals: {
          register: req.body.register
        }
      });
    } else if (req.body.password != req.body.password_verify) {
      req.flash('error', 'Passwords do not match!');
      res.render('user/register', {
        locals: {
          register: req.body
        }
      });
    } else {
      var nUser = new User(req.body);
      // check username
      User.findOne({ name: nUser.name }, function(err, userCheck) {
        if (userCheck) {
          req.flash('error', 'Username is already taken!');
          res.render('user/register', {
            locals: {
              register: req.body
            }
          });
        } else {
          function userSaveFailed() {
            req.flash('error', 'Error while saving your registration!');
            res.render('user/error', {
              locals: { register: nUser }
            });
          }

          nUser.save(function(err) {
            if (err) res.redirect('/error');
            req.flash('info', 'Registration successful');
            email.register(req.body.email, req.body.password, req.body.name, common.baseUrl(req) + '/login');
            res.redirect('/emailsent');
          });
        }
      });
    }
  });
});
