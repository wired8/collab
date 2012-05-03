// nowjs
var nowjs = require("now"),
		messageParser = require("./messageparser");
require('now-middleware')(nowjs);
require('now-sessions')(nowjs);



Chat = {
	initialize : function (server, sessionStore) {
		this.everyone = nowjs.initialize(server);
		nowjs.sessions(sessionStore);
		nowjs.sessionStore = sessionStore;
		
		console.log("Chat initialized");
		console.log(this);
		
		var that = this;
			
		var context = new Object();
		
		nowjs.on('connect', function () {
			var sid = decodeURIComponent(this.user.cookie['connect.sid']);
			that.user = this.user;
			nowjs.sessionStore.get(sid, function (err, session) {
				if (session != undefined) {
					that.user.session = session;
					
					that.setupRooms(that);
				}
			});
			
			if (that.user.session != undefined) {
				that.setupRooms(that);
			}
		});
		
		this.everyone.on('disconnect', function () {
			console.log("Disconnected: " + this.user.session.username);
		});

		this.everyone.now.distributeMessage = function (msg) {
			messageParser.parse(msg, that.sendMessage, this);
		};
	},
	
	sendMessage : function (msg, context, isServer) {
		var currentTime = new Date();
		var hours = currentTime.getHours();
		var minutes = currentTime.getMinutes();
		
		var message = {
				classname : (isServer ? 'message-wrapper message-wrapper-server' : 'message-wrapper'),
				message : msg,
				time : hours + ':' + (minutes < 10 ? '0' + minutes : minutes)
		};
		var user = {
				id : (isServer ? 0 : context.user.clientId),
				name : (isServer ? 'server' : context.user.session.username),
				avatar : (isServer ? 'http://lab.wired8.com/collab/public/images/robot.png' : ''),
				email : context.user.session.email,
				isserver: isServer
			}
		nowjs.getGroup(context.now.room).now.receiveMessage(user, message);
	},
	
	setupRooms : function (context) {
		var that = this;
		
		context.everyone.now.room = "room 1";
		var group = nowjs.getGroup(context.everyone.now.room);
		
		group.hasClient(context.user.clientId, function (bool) {
			if (!bool) {
				group.addUser(context.user.clientId);
			}
		});
		
		var users = [];
				
		for (var userid in group.users) {
			var user = {
				id : group.users[userid].user.session.user_id,
				name : group.users[userid].user.session.username,
				email : group.users[userid].user.session.email
			};
			users.push(user);
		}
		
		group.now.addUsers(users);
		
		if (!group.hasOwnProperty('_events')) {
			group.on('join', function () {
				
				// Remove duplicate connections
				for (var userid in group.users) {
					if ((group.users[userid].user.session.email == context.user.session.email) && (group.users[userid].user.clientId != context.user.clientId)) {
						group.removeUser(group.users[userid].user.clientId);
					}
				}
								
			  that.sendMessage(context.user.session.username + ' joined', this, true);
				
				var users = [];
				
				for (var userid in group.users) {
					var user = {
						id : group.users[userid].user.session.user_id,
						name : group.users[userid].user.session.username,
						email : group.users[userid].user.session.email
					};
					users.push(user);
				}
				
				group.now.addUsers(users);
				console.log("join: " + context.user.session.username);
			});
			
			group.on('leave', function () {
				
				var currentTime = new Date();
				var hours = currentTime.getHours();
				var minutes = currentTime.getMinutes();
				
				var users = [];
				
				for (var userid in group.users) {
					if (this.user.session.user_id != group.users[userid].user.session.user_id) {
						var user = group.users[userid].user.session.user_id;
						users.push(user);
						
						that.sendMessage(context.user.session.username + ' left', this, true);
					}
				}
				
				group.now.removeUsers(users);
				console.log("leave: " + context.user.session.username);
			});
		}
		
	},
	
};

module.exports = Chat;
