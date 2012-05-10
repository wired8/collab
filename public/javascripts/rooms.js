head.ready(function () {
	
	now.addRooms = function (rooms) {
		$(".rooms").empty();
		for (var room in rooms) {
			now.addRoom(rooms[room]);
		}
	}
	
	now.addRoom = function (room) {
		$(".rooms").append("" +
		    "<div class='well room' id=" + room.id + "'>" +
			"  <div class='room-header'><h3><span><a href='#' onclick='joinRoom(\"" + room.title + "\")'>" + room.title + "</a></span></h3>" +
			"    <div class='room-description'>" + room.description + "</div>" +
			"  </div>" +
			"  <div class='room-details'>" + room.details + "</div>" +
			"  <div class='room-message-count'>" + room.messagecount + " total messages</div>" +
			"  <div class='room-user-count'>" + room.usercount + " active users</div>" +
			"</div>");
		
	}
	
	joinRoom = function (room) {
		location.href = '/chat#' + room;
	}
	
	now.ready(function () {
		now.getRooms();
	});
	
	
	$('#createroom').modal({
        backdrop: true,
        keyboard: true,
        show: false,
    }).css({
        width: '420px',
        'margin-left': function () {
            return -($(this).width() / 2);
        }
    });
	
	closeDialog = function() {
		$('#createroom').modal('hide');
	}
	
});
