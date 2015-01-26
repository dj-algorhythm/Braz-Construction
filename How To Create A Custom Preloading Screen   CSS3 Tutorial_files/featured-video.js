(function( $ ) {
	if ( 'function' == typeof jQuery.fn.fitVids ) { 
		$('.featured-video-embeded').fitVids();
	}   
	else if ( 'function' == typeof jQuery.fn.fitVidsMaxWidthMod ) { 
		$('.featured-video-embeded').fitVidsMaxWidthMod();
	} 
})( jQuery );
