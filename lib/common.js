var url = require('url');

var Common = {
	
	baseUrl : function(req) {
		var hostname = req.headers.host; // hostname = 'localhost:8080'
		var pathname = url.parse(req.url).pathname; // pathname = '/MyApp'
		return ('http://' + hostname + pathname);
	}
}

module.exports = Common;
