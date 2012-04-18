var email = require("../lib/email");

// login form route
app.get('/', function(req, res) {
  res.render('user/login', {
    locals: {
      user: new User(),
      register: new User()
    }
  });
});

// login route
app.post('/', function(req, res) {
  User.findOne({ email: req.body.user.email }, function(err, user) {
    if (user && user.authenticate(req.body.user.password)) {
      req.session.user_id = user.id;
      req.session.username = user.name;
      req.session.email = user.email;
      
      if (req.body.remember_me) {
        var loginToken = new LoginToken({ email: user.email });
        loginToken.save(function() {
          res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
        });
      }
      res.redirect('/chat');
    } else {
      req.flash('error', 'Login failed');
      res.redirect('/');
    }
  });
});

// forgot password form route
app.get('/resetpassword', function(req, res) {
  res.render('user/resetpassword', {
    locals: {
      user: new User(),
      register: new User()
    }
  });
});

// forgot password route
app.post('/forgotpassword', function(req, res) {
  User.findOne({ email: req.body.user.email }, function(err, user) {
    if (user) {
      email.forgotPassword(user.email, user.name, 'http://lab.wired8.com:3000', 'http://lab.wired8.com:3000/resetpassword#' + user.hashed_password);
      res.redirect('/');
    } else {
      req.flash('error', 'No such account!');
      res.redirect('/');
    }
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

// create user route
app.post('/register', function(req, res) {
  User.findOne({ email: req.body.register.email }, function(err, user) {
    if (user) {
      // show error on username
      req.flash('error', 'Email address already registered!');
      res.render('user/register', {
        locals: {
          register: req.body.register
        }
      });
    } else if (req.body.register.password != req.body.password_verify) {
      req.flash('error', 'Passwords do not match!');
      res.render('user/register', {
        locals: {
          register: req.body.register
        }
      });
    } else {
      var nUser = new User(req.body.register);
      // check username
      User.findOne({ name: nUser.name }, function(err, userCheck) {
        if (userCheck) {
          req.flash('error', 'Username is already taken!');
          res.render('user/register', {
            locals: {
              register: req.body.register
            }
          });
        } else {
          function userSaveFailed() {
            req.flash('error', 'Error while saving your registration!');
            res.render('user/register', {
              locals: { register: nUser }
            });
          }

          nUser.save(function(err) {
            if (err) userSaveFailed();
            req.flash('info', 'Registration successful');
            email.register(req.body.register.email, req.body.register.password, req.body.register.username, 'http://lab.wired8.com:3000');
            res.redirect('/');
          });
        }
      });
    }
  });
});
