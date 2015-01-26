jQuery(document).ready(function(){
	var $_magicactionbox = jQuery('.magic-action-box');
	
	//add class "last" to .mab-main-copy p:last-child and .mab-secondary-copy p:last-child
	//jQuery('.magic-action-box .mab-main-copy p:last-child').addClass('last');
	$_magicactionbox.find('.mab-main-copy p:last-child').addClass('mablast');
	$_magicactionbox.find('.mab-secondary-copy p:last-child').addClass('mablast');
	
	//add class "last" to last .mab-field div in form
	$_magicactionbox.find('.mab-main-action-wrap form .mab-field:last').addClass('mablast');
});


//fallback for placeholder
var $_mab_placeholderFallback={class_name:'placeholder',fFocus:function(o){if(o.val()==o.attr('placeholder')){o.val('').removeClass(this.class_name);}},fBlur:function(o){if(o.val()==''||o.val()==o.attr('placeholder')){o.addClass(this.class_name).val(o.attr('placeholder'));}},fReset:function(o){if(o.val()==o.attr('placeholder')){o.val('');}},onSubmit:function(o){var _this=this;jQuery('.magic-action-box input[placeholder], .magic-action-box textarea[placeholder]').parents('form').submit(function(){jQuery(this).find('input[placeholder], textarea[placeholder]').each(function(){_this.fReset(jQuery(this));});});},load:function(){var _this=this;jQuery(document).ready(function(){jQuery('.magic-action-box input[placeholder], .magic-action-box textarea[placeholder]').focus(function(){_this.fFocus(jQuery(this));}).blur(function(){_this.fBlur(jQuery(this));}).blur();_this.onSubmit();});}};jQuery(document).ready(function(){$_mab_placeholderFallback.load();});
