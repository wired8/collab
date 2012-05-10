head.ready(function () {


    now.loadRoomInfo = function (room) {
		$(".room-subject").html(room.description);
	}
	
    now.loadRoomMessages = function (user, messages) {
		for (var message in messages) {
			now.receiveMessage(user, messages[message], false);
		}
		hideLoading();
	}
	
	now.receiveMessage = function (user, message, effect) {
		if (now.session && now.session.email == user.email && !user.isserver) {
			message.classname = 'message-wrapper message-wrapper-user';
		}

		var html = $("<div class='" + message.classname + "'>" +
				"  <div class='message-inner'>" +
				"    <div class='title'>" +
				"      <a class='account'><img class='avatar' src='" + (user.avatar.length > 0 ? user.avatar : '/images/user.png') + "' /></a>" +
				"      <div class='screen-name'>" + user.name + "</div>" +
				"      <div class='message-time'>" + message.time + "</div>" +
				"    </div>" +
				"    <div class='message'>" + message.message + "</div>" +
				"   </div>" +
				"  </div>");
		
		if (effect) {
			$(".messages").append(html); //.hide().fadeIn(600);
		} else {
			$(".messages").append(html);
		}
		$(".messages-container").scrollTop($(".messages-container")[0].scrollHeight);
	}
	
	now.clearUsers = function () {
		$(".username").remove();
	}
	
	now.addUsers = function (users) {
		for (var user in users) {
			now.addUser(users[user]);
		}
	}
	
	now.addUser = function (user) {
		if ($("#user-list li[id='" + user.id + "']").length == 0) {
			var userclass = 'icon-user';
			if (now.session && now.session.email == user.email) {
				userclass = 'icon-star';
			}
			$(".users ul").append($("<li id='" + user.id + "' class='username'><a href='#users/" + user.id + "'><i class='" + userclass + "'></i>" + "\n" + user.name + "</a></li>").hide().fadeIn(600));
			console.log('added ' + user.id + ' : ' + user.name);
			
			$('#user-list li > a').click(function () {
				$('#user-list li').not('.nav-header').removeClass();
				$(this).parent().addClass('active');
			});
		}
	}
	
	now.removeUsers = function (users) {
		var userids = [];
		$('#user-list li').each(function () {
			var id = $(this).attr('id');
			userids.push(id);
		});
		
		for (var id in userids) {
			if ($.inArray(userids[id], users)) {
				now.removeUser(userids[id]);
			}
		}
	}
	
	now.removeUser = function (id) {
		$("#" + id).fadeOut(100, function () {
			$(this).remove();
		});
		console.log('removed ' + id);
	}
	
	$('textarea').bind('keypress', function (e) {
		if (e.which == 13 && $("#text-input").val().trim().length > 0) {
			now.distributeMessage($("#text-input").val());
			$("#text-input").val("");
			return false;
		}
	});
	
	$("#send-button").click(function () {
		if ($("#text-input").val().trim().length > 0) {
			now.distributeMessage($("#text-input").val());
			$("#text-input").val("");
		}
	});
	
	$(".change").click(function () {
		now.changeRoom($(this).text());
	});
	
	utils.autoResizeChatWindow();
	
	now.ready(function() {
		var room = document.location.hash.replace('#', '');
		now.joinRoom(room);
	});
	
	hideLoading = function() {
	    $('.loading').hide();
		$('.container').show().fade(500);
	}

});

var utils = {
	autoResizeChatWindow : function () {
		var docHeight = jQuery(window).height();
		var navbarHeight = jQuery('.navbar.navbar-fixed-top').height();
		var footerHeight = jQuery('.footer-wrapper').height();
		console.log('docheight:' + docHeight);
		jQuery('.messages-container').height(docHeight - (navbarHeight + footerHeight) + 'px');
	}
}
