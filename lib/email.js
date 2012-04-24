var node_mailer = require("mailer");

Email = {

	register : function(email, password, username, loginurl) {
	  var subject = "Welcome to collab!";
		var template = "/../../../templates/register.txt";
		var data = { email: email, password: password, username: username, loginurl: loginurl };
		           
		this.send(email, subject, template, data);
	},
	
	forgotPassword : function (email, username, loginurl, reseturl) {
		var subject = "Password reminder";
		var template = "/../../../templates/forgotpassword.txt";
		var data = { email: email, username: username, loginurl: loginurl, reseturl: reseturl };
		
		this.send(email, subject, template, data);
	},
	
	send : function(to, subject, template, data) {
		node_mailer.send({
    	host : "localhost",              // smtp server hostname
      port : "25",                     // smtp server port
      ssl: false,                        // for SSL support - REQUIRES NODE v0.3.x OR HIGHER
      domain : "localhost",            // domain used by client to identify itself to server
      to : to,
      from : "support@collab.com",
      subject : subject,
      template : template,
      data : data
      //authentication : "login",        // auth login is supported; anything else is no auth
     // username : "my_username",        // username
     // password : "my_password"         // password
    },
    function(err, result){
      if(err){ console.log(err); }
    });
	}

};

module.exports = Email; 