// nowjs
var nowjs = require("now");
require('now-middleware')(nowjs);
require('now-sessions')(nowjs);

Rooms = {
	initialize : function () {
		
		var self = this;
		var rooms = new Object();
		nowjs.getGroups(function (groups) {
			for (var group in groups) {
				var room = new Object();
				var group = nowjs.getGroup(group);
				
				room.name = group.name;
				
				group.getUsers(function (users) {
					room.users = users;
				});
			}
		});
		
	},
	
	createRoom : function (name) {}
};

module.exports = Rooms;
