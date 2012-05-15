head.ready(function(){
 
 $('#register-form').validate(
 {
  rules: {
    email: {
      required: true,
      email: true
    },
    name: {
    	required: true
    },
    password: {
      required: true,
      minlength: 6
    },
    password_verify: {
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