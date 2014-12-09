jQuery(document).ready(function() {
    jQuery('#socialFollow').jqm();
});

jQuery('.a_socialFollow').live('click',function(){
    _gaq.push(['_trackEvent','download','FolderDesignCheatSheet',jQuery(this).attr('href')]);
    jQuery('#socialFollow').jqmShow();
});