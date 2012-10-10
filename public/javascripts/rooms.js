head.ready(function () {
	
	var Room = {
		pagesize : 10,
		
		initialize : function () {
			var self = this;
			
			now.ready(function () {
				now.getRooms(1, self.pagesize);
			});
			
			jQuery('#createroom').modal({
				backdrop : true,
				keyboard : true,
				show : false
			}).css({
				width : '420px',
				'margin-left' : function () {
					return  - ($(this).width() / 2);
				}
			});
			
			
		},
		
		joinRoom : function (room) {
			location.href = '/chat#' + room;
		},
		
		closeDialog : function () {
			$('#createroom').modal('hide');
		},
		
		htmlEscape : function (str) {
			return String(str)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		},
		
		htmlEncode : function (value) {
			return $('<div/>').text(value).html();
		},
		
		htmlDecode : function (value) {
			return $('<div/>').html(value).text();
		}
		
	};
	
	now.addRooms = function (roomPages) {
		$(".rooms").empty();
		for (var room in roomPages.rooms) {
			now.addRoom(roomPages.rooms[room]);
		}
		
		var pages = "";
		for (var i = 1; i < roomPages.totalPages + 1; i++) {
			var link = 'onclick=\'now.getRooms(' + i + ',' + Room.pagesize + ');\'';
			pages += (roomPages.currentpage == i ? "<li class='active'><a href='#'>" + i + "</a></li>" : "<li><a href='#' " + link + ">" + i + "</a></li>");
		}
		
		var back = (roomPages.currentpage > 1 ? '<li><a href=\'#\' onclick=\'now.getRooms(' + (roomPages.currentpage - 1) + ',' + Room.pagesize + ');\'>&larr;</a></li>' : '<li><a href=\'#\'>&larr;</a></li>');
		var next = (roomPages.currentpage < roomPages.totalPages ? '<li><a href=\'#\' onclick=\'now.getRooms(' + (roomPages.currentpage + 1) + ',' + Room.pagesize + ');\'>&rarr;</a></li>' : '<li><a href=\'#\'>&rarr;</a></li>');
		
		var pagination = "<div class='pagination pagination-centered'>" +
			"<ul>" +
			back +
			pages +
			next +
			"</ul>" +
			"</div>";
		
		$(".rooms-pagination").empty();
		$(".rooms-pagination").append(pagination);
	};
	
	now.addRoom = function (room) {
		var roomTitle = Room.htmlEscape(room.title);
		$(".rooms").append("" +
			"<div class='well room' id=" + room.id + "'>" +
			"  <div class='room-header'><h3><span><a href='#' id='room_" + room.id + "'>" + roomTitle + "</a></span></h3>" +
			"    <div class='room-description'><i class='icon-info-sign'></i> " + room.description + "</div>" +
			"  </div>" +
			"  <div class='room-details'>" + room.details + "</div>" +
			"  <div class='room-message-count'><i class='icon-comment'></i> " + room.messagecount + " total messages</div>" +
			"  <div class='room-user-count'><i class='icon-user'></i> " + room.usercount + " active users</div>" +
			"  <div class='drop-down'>" +
			"    <a id='drop-" + room.id + "' href='#' class='dropdown-toggle room-isadmin' data-toggle='dropdown' role='button'><i class='" + (room.isadmin ? 'icon-wrench' : '' ) + "'></i></a> " + 
			"    <ul class='dropdown-menu' role='menu' aria-labelledby='drop" + room.id + "'> " +
			"      <li><a href='#' id='deleteroom_" + room.id + "' tabindex='-1'><i class='icon-trash'></i> Delete room</a></li>" +
			"      <li><a href='#' tabindex='-1'><i class='icon-eye-open'></i> Manage room</a></li>" +
			"      <li><a href='#' id='renameroom_" + room.id + "' tabindex='-1'><i class='icon-edit'></i> Rename room</a></li>" +
			"      <li><a href='#' tabindex='-1'><i class='icon-hdd'></i> Archive room</a></li>" +
			"    </ul> " +
			"  </div> " +
			"  <div class='room-private'><i class='" + (room.private ? 'icon-lock' : '' ) + "'></i></div> " + 
			"</div>");
		
		$("#room_" + room.id).click(function () {
			Room.joinRoom(room.url);
			return false;
		});
		
		$('#deleteroom_' + room.id).click(function () {
			var roomTitle = Room.htmlEscape(room.title);
			$('#deleteroom').find('#roomid').val(room.id);
			$('#deleteroom').find('#roomname').text(roomTitle);
			$('#deleteroom').modal('show');
		});
		
		$('#renameroom_' + room.id).click(function () {
			var roomTitle = Room.htmlEscape(room.title);
			$('#renameroom').find('#roomid').val(room.id);
			$('#renameroom').find('#roomname').text(roomTitle);
			$('#renameroom').find('#newroomname').val(roomTitle);
			$('#renameroom').modal('show');
		});
		
	};
	
	Room.initialize();
	
});
