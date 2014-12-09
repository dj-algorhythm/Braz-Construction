jQuery(document).ready(function(){
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_EN/all.js#xfbml=1&#038;appId=186756854786800";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

    var sc = jQuery('#social_count');
    if(sc.size()){
        var scn= sc.text().split('_');
        jQuery('.fb_like_cnt').text(scn[0] + ' Fans');
        jQuery('.tw_like_cnt').text(scn[1] + ' Followers');
        jQuery('.gp_like_cnt').text(scn[2] + ' Followers');
    }
    
    jQuery("#authorsure-author-profile a").attr("target","_blank");
    //jQuery("#authorsure-author-profile a[href^='http://']").attr("target","_blank");

    jQuery(".special_offer a").click(function(){
        _gaq.push(['_trackEvent', 'banner', 'blog banner', jQuery(this).text()]);
        return true;
    });
});