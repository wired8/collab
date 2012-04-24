head.ready(function(){
 
 $('#login-form').validate(
 {
  rules: {
    email: {
      required: true,
      email: true,
    },
    password: {
      required: true
    }
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