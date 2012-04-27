 head.js(
      {jquery: "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"},
      {bootstraptabs: "http://twitter.github.com/bootstrap/1.4.0/bootstrap-tabs.js"},
      {bootstrapmodal: "/javascripts/bootstrap-modal.js"},
      {bootstrapdropdown: "/javascripts/bootstrap-dropdown.js"},
      {bootstrapalert: "/javascripts/bootstrap-alert.js"},
      {jqueryvalidate: "/javascripts/jquery.validate.pack.js"}
    );
  
    head.ready(function() {
     jQuery('.tabs').tabs();
     jQuery('.page-header').dropdown();
     jQuery(function(){
       jQuery(window).resize(function(){
         if (typeof utils != "undefined") {
           utils.autoResizeChatWindow();
         }
       });
     });
    });