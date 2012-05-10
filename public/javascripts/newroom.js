head.ready(function(){
 
 $('#newroom-form').validate(
 {
  rules: {
    roomname: {
      required: true,
    },
    roomsubject: {
    	required: true,
    },    
  },
  highlight: function(label) {
    $(label).closest('.control-group').addClass('error');
  },
  success: function(label) {
    label
      .text('OK!').addClass('valid')
      .closest('.control-group').addClass('success');
  }
 });
}); 