head.ready(function(){
	
	now.addRooms = function(rooms) {
	    $(".rooms").empty();
	  	for (var room in rooms) {
	  		now.addRoom(rooms[room]);
	  	}
	}
	
	now.addRoom = function(room) {
	  $(".rooms").append("<div id='" + room.id + "'>" +
	                     "  <div class='room-header'><h3><span><a href='/chat#" + room.id + "'>" + room.title  + "</a></span></h3></div>" +
	                     "    <div class='room-description'>" + room.description  + "</div>" +
	                     "  </div>" +
	                     "  <div class='room-details'>" + room.details + "</div>" +
	                     "  <div class='room-message-count'>" + room.messagecount  + "</div>" +
	                     "  <div class='room-user-count'>" + room.usercount  + "</div>" +
	                     "</div>");
	  
	}
	
	now.ready(function(){
	  now.getRooms();
  });


});