 head.js(
      {jquery: "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"},
      {jqueryvalidate: "/javascripts/jquery.validate.pack.js"},
      {bootstrap: "/javascripts/bootstrap.min.js"},
      {bootbox: "/javascripts/bootbox.min.js"}
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