 head.js(
      {jquery: "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"},
      {bootstraptabs: "http://twitter.github.com/bootstrap/1.4.0/bootstrap-tabs.js"},
      {bootstrapmodal: "http://lab.wired8.com/collab/public/javascripts/bootstrap-modal.js"},
      {bootstrapdropdown: "http://lab.wired8.com/collab/public/javascripts/bootstrap-dropdown.js"},
      {bootstrapalert: "http://lab.wired8.com/collab/public/javascripts/bootstrap-alert.js"},
      {jqueryvalidate: "http://lab.wired8.com/collab/public/javascripts/jquery.validate.pack.js"}
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