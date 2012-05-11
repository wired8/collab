head.ready(function () {
	
	var pagesize = 10;
	
	now.addRooms = function (roomPages) {
		$(".rooms").empty();
		for (var room in roomPages.rooms) {
			now.addRoom(roomPages.rooms[room]);
		}
		
		var pages = "";
		for (var i=0; i<roomPages.totalPages; i++){
		  var link = 'onclick=\'now.getRooms(' + (i+1) + ',' + pagesize + ');\'';
		  pages += (roomPages.currentpage == i ? "<li class='active'><a href='#'>" + (i+1) + "</a></li>" :  "<li><a href='#' " + link + ">" + (i+1) + "</a></li>");	
		}		
		
		var pagination = "<div class='pagination pagination-centered'>" +
					     "<ul>" +
						 "<li><a href='#'>&larr;</a></li>" +
						 pages +
						 "<li><a href='#'>&rarr;</a></li>" +
						 "</ul>" +
						 "</div>";
		
		$(".rooms-pagination").empty();
		$(".rooms-pagination").append(pagination);
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
		now.getRooms(0, pagesize);
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
