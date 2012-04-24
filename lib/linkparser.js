var embedly = require('embedly')
  , require_either = embedly.utils.require_either
  , util = require('util')
  , Api = embedly.Api
  , api = new Api({user_agent: 'Mozilla/5.0 (compatible; myapp/1.0; u@my.com)', key: 'efb156d287de11e185db4040d3dc5c07'});

LinkParser = {
		parse : function (url, callback, context) {
			api.oembed({url: url}).on('complete', function(objs) {
			  console.log(util.inspect(objs[0]));
			  var html = '';
			  
			  switch (objs[0].type) {
			  	case 'video':
			  		html = objs[0].html.replace("640", "320").replace("360", "180");
			  		break;
			  	
			  	case 'photo':
			  		html = '<img src="' + objs[0].url + '" />';
			  		break;
			  	
			  	case 'link':
			  	  if (objs[0].html) {
			  			html = objs[0].html.replace("640", "320").replace("360", "180");
			  		} else if (objs[0].description) {
			  		  html = objs[0].description;
			  		} else {
			  			html = objs[0].url;
			  		}
			  		break;
			  	
			  	case 'rich':
			  		html = objs[0].html.replace("640", "320").replace("360", "180");
			  		break;
			  		
			  	default:
			  	  html = url;
			  	  break;			  
			  }
			  			  
			  callback(html, context);
			}).on('error', function(e) {
			  console.error('request #1 failed')
			  console.error(e)
			}).start()
		}
};

module.exports = LinkParser;