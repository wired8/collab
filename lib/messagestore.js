var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

MessageStore = {
	init : function () {
		
		var Message = new Schema({
		    userId    : ObjectId
		  , body      : String
		  , date      : { type: Date, default: Date.now }
		});
		
		mongoose.model('Message', Message);
	
	},
	
	save : function (msg, callback) {
		
		var message = new Message();
		
		message.userId = msg.userId;
		message.body = msg.body;
		
		message.save(function(err){
			if (err) res.redirect('/error');
		});
		
		callback();
	},
	
	findByUserId : function (userId) {
		
		Message.find({ userId: userId }, function(err, messages) {
			if (err) res.redirect('/error');
			return messages;		
		});
	
	}
};

module.exports = MessageStore;