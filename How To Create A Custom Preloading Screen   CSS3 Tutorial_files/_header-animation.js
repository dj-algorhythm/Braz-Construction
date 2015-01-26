/*
	Ihatetomatoes Header Animation	
	Dual licensed under MIT and GPL.
*/

jQuery(function(){
	
	jQuery("#content").fitVids();
	

	enquire.register("screen and (max-width: 767px)", {
	    match : function() {
	        // Trigger Nav
			jQuery("#navTrigger").click(function(event){
				event.preventDefault();
				jQuery('.nav').toggle();
			});
	    },  
	    unmatch : function() {
	        // Show nav
	        jQuery('.nav').show();
	    }
	});

});