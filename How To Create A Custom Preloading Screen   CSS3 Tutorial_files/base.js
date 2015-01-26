/*
	Ihatetomatoes Base JS
	
	All rights reserved.
*/

jQuery(function(){

	/* Close Optinmonster Popup when the form is submitted */

	var vars = [], hash;
	    var q = document.URL.split('?')[1];
	    if(q != undefined){
	        q = q.split('&');
	        for(var i = 0; i < q.length; i++){
	            hash = q[i].split('=');
	            vars.push(hash[1]);
	            vars[hash[0]] = hash[1];
	        }
	}
	if(vars['omconfirmation'] == 1){
		/* Add class to body and hide OM with CSS */
		jQuery('body').addClass('hideOm');
	} else {
		/* do nothing */
	}

});