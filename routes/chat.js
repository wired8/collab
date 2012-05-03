var uor = require('../useronline.registry').UserOnlineRegistry;

app.get('/chat', auth.loadUser, function(req, res, next) {
  // render chat interface
  res.render('chat/chat', { locals:
    {
      user: req.currentUser,
      host: app.set('host'),
      scripts: ['/public/javascripts/chat.js']
    }    
  });
});

app.get('/index', auth.loadUser, function(req, res, next) {
  // render chat interface
  res.render('chat/index', { locals:
    {
      user: req.currentUser,
      host: app.set('host'),
      scripts: ['/public/javascripts/rooms.js']
    }    
  });
});