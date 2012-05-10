// nowjs
var nowjs = require('now'),
async = require('async'),
mongoose = require('mongoose'),
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
		
		/*
		nowjs.on('connect', function () {
			that.setUserSession(this);
		});
		*/
		nowjs.on('connect', function () {
				console.log("Getting session!");
					var sid = decodeURIComponent(this.user.cookie['connect.sid']);
					that.user = this.user;
					nowjs.sessionStore.get(sid, function (err, session) {
						if (err) console.log("Session Error!");
						if (session != undefined) {
							that.user.session = session;
							console.log("Connected: " + that.user.session.username);
						}
					});
			});
		//this.setupRooms(this);		
		/*
		async.series({
			one: function(callback){
				nowjs.on('connect', function () {
					var sid = decodeURIComponent(this.user.cookie['connect.sid']);
					that.user = this.user;
					nowjs.sessionStore.get(sid, function (err, session) {
						if (session != undefined) {
							that.user.session = session;
							console.log("Connected: " + that.user.session.username);
						}
					});
				});
				callback();
			},
		},
		function(err, results) {
			that.setupRooms(that);
		});
		*/

		this.everyone.on('disconnect', function () {
			//console.log("Disconnected: " + this.user.session.username);
		});
		
		this.everyone.now.distributeMessage = function (msg) {
			messageParser.parse(msg, that.sendMessage, this);
		};
		
		this.everyone.now.getRooms = function () {
			that.getRooms();
		}
		
		this.everyone.now.joinRoom = function (room) {
			that.joinRoom(this.now, room);
		}
		
	},
	
	getRooms : function () {
		var self = this;
		var rooms = new Array();
		var groupCount = 0;
		var i = 0;
		
		this.setupRooms(this, function() {
			nowjs.getGroups(function (groups) {
			  
			  groupCount = groups.length - 1;
				
				for (var group in groups) {
					
					var grp = nowjs.getGroup(groups[group]);
	
					if (grp.groupName == 'everyone' || grp.groupName == 'undefined')
						continue;
					
					var room = new Object();				
					var users = grp.getUsers(function (users) {
							room.usercount = users.length;
							room.users = users;
						});
					
	
					room.title = grp.groupName;
					room.description = grp.description;
					room.details = '';
					room.messagecount = 0; 
					rooms.push(room);
					
					Message.count({	roomid : grp.id }, function (err, count) {
						rooms[i].messagecount = count;
						if (rooms.length == groupCount) self.showRooms(rooms);
						i++;					
					});
				}
			});
		});
		
	},
	
	showRooms : function(rooms) {
		nowjs.getGroup('everyone').now.addRooms(rooms);	
	},
	
	sendMessage : function (msg, context, isServer) {
		var currentTime = new Date();
		var hours = currentTime.getHours();
		var minutes = currentTime.getMinutes();
		
		var client_message = {
			classname : (isServer ? 'message-wrapper message-wrapper-server' : 'message-wrapper'),
			message : msg,
			time : hours + ':' + (minutes < 10 ? '0' + minutes : minutes)
		};
		var user = {
			id : (isServer ? 0 : context.user.clientId),
			name : (isServer ? 'server' : context.user.session.username),
			avatar : (isServer ? '/images/robot.png' : ''),
			email : context.user.session.email,
			isserver : isServer
		}
		
		var group = nowjs.getGroup(context.now.room);
		
		if (!isServer) {
			var message = new Message();
			message.message = msg;
			message.userid = mongoose.Types.ObjectId(context.user.session.user_id);
			message.roomid = mongoose.Types.ObjectId(group.id);
			message.created = new Date();
			
			message.save(function (err, message_saved) {
				if (err) {
					throw err;
					console.log(err);
				} else {
					console.log('saved!');
				}
			});
		}

		group.now.receiveMessage(user, client_message);
	},
	
	setupRooms : function (context, callback) {
		var that = this;
		
		// Load persistant rooms
		Room.find({}, function (err, rooms) {
			for (var room in rooms) {
				var group = nowjs.getGroup(rooms[room].name); 
				group.description = rooms[room].description;
				group.id = rooms[room].id;
			}
			callback();
		});
		
	},
	
	setupGroup : function (group) {
		var that = this;
		if (!group.hasOwnProperty('_events')) {
			group.on('join', function () {
				console.log("group.on('join'!");
				// Remove duplicate connections
				/*
				for (var userid in group.users) {
					if ((group.users[userid].user.session) && (group.users[userid].user.session.email == context.user.session.email) && (group.users[userid].user.clientId != context.user.clientId)) {
						group.removeUser(group.users[userid].user.clientId);
					}
				}
*/			
				that.now.room = group.groupName;
				that.sendMessage(that.user.session.username + ' joined', that, true);
				
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
				console.log("join: " + that.user.session.username);
			});
			
			group.on('leave', function () {
				console.log("group.on('leave'!");
				var currentTime = new Date();
				var hours = currentTime.getHours();
				var minutes = currentTime.getMinutes();
				
				var users = [];
				
				for (var userid in group.users) {
					if (this.user.session.user_id != group.users[userid].user.session.user_id) {
						var user = group.users[userid].user.session.user_id;
						users.push(user);
						
						that.now.room = group.groupName;
						that.sendMessage(that.user.session.username + ' left', this, true);
					}
				}
				
				group.now.removeUsers(users);
				console.log("leave: " + that.user.session.username);
			});
		}
	},
	
	joinRoom : function (now, roomname) {
		var that = this;
		that.now = now;
		var group = nowjs.getGroup(roomname);
		group.hasClient(this.user.clientId, function (bool) {
			if (!bool) {
				group.addUser(that.user.clientId);
			}
		});
		
		nowjs.getClient(this.user.clientId, function() {
			that.now.room = roomname;
			that.setupGroup(group);	
		});

	},
	
	createRoom : function (roomname, user) {
		var group = nowjs.getGroup(roomname);
		group.addUser(this.user.clientId);
	},
	
	setUserSession : function (context) {
	  var that = context;
		var sid = decodeURIComponent(that.user.cookie['connect.sid']);
		nowjs.sessionStore.get(sid, function (err, session) {
			if (session != undefined) {
				that.user.session = session;
				console.log("Connected: " + that.user.session.username);
			}
		});
	}
	
};

module.exports = Chat;
