// nowjs
var nowjs = require("now");
require('now-middleware')(nowjs)
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
		
		this.everyone.now.changeRoom = function (newRoom) {
			this.now.distributeMessage("[leaving " + this.now.room + "]");
			nowjs.getGroup(this.now.room).removeUser(this.user.clientId);
			nowjs.getGroup(newRoom).addUser(this.user.clientId);
			this.now.room = newRoom;
			this.now.distributeMessage("[entering " + this.now.room + "]");
			var that = this;
			nowjs.getGroup(this.now.room).count(function (count) {
				var prettyCount = (count === 1) ? "Room is empty." : (count - 1) + " other(s) in room.";
				that.now.serverMessage("SERVER", "You're now in " + that.now.room + ". " + prettyCount);
			});
		}
		
		this.everyone.now.distributeMessage = function (message) {
			var currentTime = new Date();
			var hours = currentTime.getHours();
			var minutes = currentTime.getMinutes();
			var message = {
				classname : 'message-wrapper',
				message : message,
				time : hours + ':' + (minutes < 10 ? '0' + minutes : minutes)
			};
			var user = {
				id : this.user.clientId,
				name : this.user.session.username,
				avatar : ""
			}
			nowjs.getGroup(this.now.room).now.receiveMessage(user, message);
		};
		
		this.everyone.now.serverMessage = function (message) {
			var currentTime = new Date();
			var hours = currentTime.getHours();
			var minutes = currentTime.getMinutes();
			var message = {
				classname : 'message-wrapper message-wrapper-server',
				message : message,
				time : hours + ':' + (minutes < 10 ? '0' + minutes : minutes)
			};
			var user = {
				id : 0,
				name : 'server',
				avatar : "http://lab.wired8.com/collab/public/images/robot.png"
			}
			nowjs.getGroup(this.now.room).now.receiveMessage(user, message);
			console.log('serverMessage');
		};
		
	},
	
	setupRooms : function (context) {
		
		context.everyone.now.room = "room 1";
		var group = nowjs.getGroup(context.everyone.now.room);
		
		group.hasClient(context.user.clientId, function (bool) {
			if (!bool) {
				group.addUser(context.user.clientId);
			}
		});
		
		if (!group.hasOwnProperty('_events')) {
			group.on('join', function () {
				
				// Remove duplicate connections
				for (var userid in group.users) {
					if ((group.users[userid].user.session.email == context.user.session.email) && (group.users[userid].user.clientId != context.user.clientId)) {
						group.removeUser(group.users[userid].user.clientId);
					}
				}
				
				var currentTime = new Date();
				var hours = currentTime.getHours();
				var minutes = currentTime.getMinutes();
				var message = {
					classname : 'message-wrapper message-wrapper-server',
					message : context.user.session.username + ' joined',
					time : hours + ':' + (minutes < 10 ? '0' + minutes : minutes)
				};
				var user = {
					id : 0,
					name : 'server',
					avatar : "http://lab.wired8.com/collab/public/images/robot.png"
				}
				
				group.now.receiveMessage(user, message);
				
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

						var message = {
							classname : 'message-wrapper message-wrapper-server',
							message : context.user.session.username + ' left',
							time : hours + ':' + (minutes < 10 ? '0' + minutes : minutes)
						};
						var user = {
							id : 0,
							name : 'server',
							avatar : "http://lab.wired8.com/collab/public/images/robot.png"
						}
						
						group.now.receiveMessage(user, message);
					}
				}
				
				group.now.removeUsers(users);
				console.log("leave: " + context.user.session.username);
			});
		}
		
	},
	
};

module.exports = Chat;
