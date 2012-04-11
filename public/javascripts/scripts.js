 head.js(
      {jquery: "http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"},
      {bootstraptabs: "http://twitter.github.com/bootstrap/1.4.0/bootstrap-tabs.js"},
      {bootstrapdropdown: "http://twitter.github.com/bootstrap/1.4.0/bootstrap-dropdown.js"},
      {bootstrapmodal: "http://lab.wired8.com/collab/public/javascripts/bootstrap-modal.js"},
      {jqueryvalidate: "http://lab.wired8.com/collab/public/javascripts/jquery.validate.pack.js"}
    );
  
    head.ready(function() {
     jQuery('.tabs').tabs();
     jQuery('.page-header').dropdown();
     jQuery(function(){
       jQuery(window).resize(function(){
         utils.autoResizeChatWindow();
       });
     });
    });