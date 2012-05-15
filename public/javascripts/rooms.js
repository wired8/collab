head.ready(function () {
	
	var pagesize = 10;
	
	now.addRooms = function (roomPages) {
		$(".rooms").empty();
		for (var room in roomPages.rooms) {
			now.addRoom(roomPages.rooms[room]);
		}
		
		var pages = "";
		for (var i=1; i<roomPages.totalPages+1; i++){
		  var link = 'onclick=\'now.getRooms(' + i + ',' + pagesize + ');\'';
		  pages += (roomPages.currentpage == i ? "<li class='active'><a href='#'>" + i + "</a></li>" :  "<li><a href='#' " + link + ">" + i + "</a></li>");	
		}
		
		var back = (roomPages.currentpage > 1 ? '<li><a href=\'#\' onclick=\'now.getRooms(' + (roomPages.currentpage-1) + ',' + pagesize + ');\'>&larr;</a></li>' : '<li><a href=\'#\'>&larr;</a></li>');	
		var next = (roomPages.currentpage < roomPages.totalPages ? '<li><a href=\'#\' onclick=\'now.getRooms(' + (roomPages.currentpage+1) + ',' + pagesize + ');\'>&rarr;</a></li>' : '<li><a href=\'#\'>&rarr;</a></li>');	
		
		var pagination = "<div class='pagination pagination-centered'>" +
					   "<ul>" +
						 back +
						 pages +
						 next +
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
		now.getRooms(1, pagesize);
	});
	
	
	$('#createroom').modal({
        backdrop: true,
        keyboard: true,
        show: false
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
