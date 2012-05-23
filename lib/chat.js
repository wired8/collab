// nowjs
var nowjs = require('now'),
async = require('async'),
mongoose = require('mongoose'),
messageParser = require("./messageparser");
require('now-middleware')(nowjs);
require('now-sessions')(nowjs);

Chat = {
	
	initialize : function (server, sessionStore) {
		this.everyone = nowjs.initialize(server, {
				socketio : {
					transports : ['xhr-polling', 'jsonp-polling']
				}
			});
		nowjs.sessions(sessionStore);
		nowjs.sessionStore = sessionStore;
		
		console.log("Chat initialized");
		console.log(this);
		
		var that = this;
		var context = new Object();
		
		nowjs.on('connect', function () {
			console.log("Getting session!");
			var sid = decodeURIComponent(this.user.cookie['connect.sid']);
			that.user = this.user;
			nowjs.sessionStore.get(sid, function (err, session) {
				if (err)
					console.log("Session Error!");
				if (session != undefined) {
					that.user.session = session;
					console.log("Connected: " + that.user.session.username);
				}
			});
		});
		
		this.everyone.on('disconnect', function () {
			//console.log("Disconnected: " + this.user.session.username);
		});
		
		this.everyone.now.distributeMessage = function (msg) {
			messageParser.parse(msg, that.sendMessage, this);
		};
		
		this.everyone.now.getRooms = function (page, limit) {
			that.getRooms(page, limit);
		};
		
		this.everyone.now.joinRoom = function (room) {
			that.joinRoom(this.now, room);
		};

        this.everyone.now.userIsActive = function (room) {
            nowjs.getGroup(room).now.userIsActive(this.user.clientId);
        };

	},
	
	getRooms : function (page, limit) {
		var self = this;
		var pages = new Object();
		var rooms = new Array();
		var totalPages = 0;
		var j = 0;
		
		this.getPersistantRooms(page, limit, this, function () {
			nowjs.getGroups(function (groups) {
				var totalRecords = groups.length;
				var totalPages = Math.ceil(groups.length / limit);
				var startIndex = (page - 1) * limit;
				var endIndex = ((startIndex + limit) < totalRecords ? (startIndex + limit) : totalRecords);
				
				pages.totalPages = totalPages;
				pages.currentpage = page;
				pages.limit = limit;
				
				for (var i = startIndex; i < endIndex; i++) {
					
					if (i > groups.length)
						return;
					console.log('groups[i] : ' + groups[i]);
					
					if (groups[i] == 'undefined')
						continue;
					
					var grp = nowjs.getGroup(groups[i]);
					
					if (grp.groupName == 'everyone' || grp.groupName == 'undefined')
						continue;
					
					var room = new Object();
					room.usercount = 0;
					
					grp.count(function (count) {
						room.usercount = count;
					});
					
					var users = grp.getUsers(function (users) {
						room.users = users;
					});
					
					room.title = grp.groupName;
					room.url = grp.url;
					room.description = grp.description;
					room.details = '';
					room.messagecount = 0;
					room.id = grp.id;
					rooms.push(room);
					
					Message.count({
						roomid : grp.id
					}, function (err, count) {
						rooms[j].messagecount = count;
						j++;
						if (j == rooms.length) {
							pages.rooms = rooms;
							self.showRooms(pages);
						}
						
					});
				}
			});
		});
	},
	
	getPersistantRooms : function (page, limit, context, callback) {
		var that = this;
		
		// Load persistant rooms
		Room.find({}, function (err, rooms) {
			for (var room in rooms) {
				var group = nowjs.getGroup(rooms[room].url);
				group.description = rooms[room].description;
				group.id = rooms[room].id;
				group.url = rooms[room].url;
			}
			callback();
		}).skip((page + 1) * limit).limit(limit);
	},
	
	showRooms : function (rooms) {
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
		
		var group = nowjs.getGroup(context.now.roomurl);
		
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
		
		group.now.receiveMessage(user, client_message, true);
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
	
	loadExistingMessages : function () {
		var that = this;
		var existing_messages = [];
		var i = 0;
		
		Room.findOne({
			url : that.now.roomurl
		}, function (err, room) {
			Message.find({
				roomid : room.id
			}, function (err, messages) {
				if (messages.length == 0)
					that.now.loadRoomMessages(existing_messages, false);
				for (var message in messages) {
					User.findOne({
						_id : messages[message].userid
					}, function (err, user) {
						
						var client_user = {
							id : user.id,
							name : user.name,
							avatar : '',
							email : user.email,
							isserver : false
						};
						var dt = messages[i].created;
						var client_message = {
							classname : 'message-wrapper',
							message : messages[i].message,
							time : dt.getHours() + ':' + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes()),
							user : client_user
						};
						
						existing_messages.push(client_message);
						
						i++;
						if (i == messages.length) {
							that.now.loadRoomMessages(existing_messages, false);
						}
					});
				}
				
			});
		});
	},
	
	loadUsers : function (group) {
		var users = [];
		
		for (var userid in group.users) {
			if (group.users[userid].user.session) {
				var user = {
					id : group.users[userid].user.session.user_id,
					name : group.users[userid].user.session.username,
					email : group.users[userid].user.session.email
				};
				users.push(user);
			}
		}
		
		group.now.addUsers(users);
	},
	
	joinRoom : function (now, roomurl) {
	   var that = this;
	   that.now = now;
	   
	   nowjs.getClient(this.user.clientId, function () {
			Room.findOne({
				url : roomurl
			}, function (err, room) {
				if (err || room == null) {
					console.log(that.now.room + 'not found!');
					now.loadRoomInfo(null);
					return;
				}
				var group = nowjs.getGroup(room.url);
				group.hasClient(that.user.clientId, function (bool) {
					if (!bool) {
						group.addUser(that.user.clientId);
					}
				});
				that.now.roomurl = room.url;
				now.loadRoomInfo(room);
				that.setupGroup(group);
				that.loadUsers(group);
				that.loadExistingMessages();
			});
		});
		
	/*
		var that = this;
		that.now = now;
		var group = nowjs.getGroup(roomname);
		group.hasClient(this.user.clientId, function (bool) {
			if (!bool) {
				group.addUser(that.user.clientId);
			}
		});
		
		nowjs.getClient(this.user.clientId, function () {
			that.now.room = roomname;
			Room.findOne({
				name : that.now.room
			}, function (err, room) {
				if (err || room == null) {
					console.log(that.now.room + 'not found!');
					nowjs.removeGroup(that.now.room);
					now.loadRoomInfo(null);
					return;
				}
				now.loadRoomInfo(room);
				that.setupGroup(group);
				that.loadUsers(group);
				that.loadExistingMessages();
			});
		});
	*/	
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
