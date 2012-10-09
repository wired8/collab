 head.js(
      {jquery: "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"},
      {bootstrap: "/javascripts/bootstrap.min.js"},
      {bootbox: "/javascripts/bootbox.min.js"},
      {jqueryvalidate: "/javascripts/jquery.validate.min.js"},
      {common: "/javascripts/common.js"}
    );
  
    head.ready(function() {
     jQuery('.nav-tabs a').click(function (e) {
    	  e.preventDefault();
      jQuery(this).tab('show');
     });
     jQuery('.nav-tabs a:first').tab('show');
     jQuery('.page-header').dropdown();
     jQuery(function(){
       jQuery(window).resize(function(){
         if (typeof utils != "undefined") {
           utils.autoResizeChatWindow();
         }
       });
     });
    });