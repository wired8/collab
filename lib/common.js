var url = require('url');

var Common = {
	
	baseUrl : function(req) {
		var hostname = req.headers.host; // hostname = 'localhost:8080'
		return ('http://' + hostname);
	}
}

module.exports = Common;
