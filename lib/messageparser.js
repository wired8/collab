var shSyntaxHighlighter = require('./syntaxhighlighter/shCore').SyntaxHighlighter,
shJScript = require('./syntaxhighlighter/shBrushJScript').Brush,
linkParser = require("./linkparser");

MessageParser = {
	parse : function (message, callback, context) {
		
		var html = message;
		
		if (this.isUrl(message)) {
			linkParser.parse(message, callback, context);
			return;
		}
		
		if (this.isSourceCode(message)) {
			brush = new shJScript();
			brush.init({
				toolbar : false
			});
			html = brush.getHtml(message);
		} 
		
		callback(html, context, false);
		
	},
	
	isUrl : function (str) {
		var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
			return regexp.test(str);
	},
	
	isSourceCode : function (str) {
		var count = str.match(/{/g);
		
		if (count && count.length >= 2) {
			return true;
		}
		
		return false;
		
	}
	
};

module.exports = MessageParser;
