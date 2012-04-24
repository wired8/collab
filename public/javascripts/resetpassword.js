head.ready(function(){
 
 $('#reset-form').validate(
 {
  rules: {
    password: {
      minlength: 6,
      required: true
    },
    password_verify: {
      minlength: 6,
      required: true,
      equalTo: "#password"
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