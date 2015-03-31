$(document).ready(function(){

  $('.img-window').each(function(){
    var position;
    var gallImgDesc = $(this).find('.gall-img-desc');
    var gallImg = $(this).find('.gall-image');
    var descHeight = gallImgDesc.height();
    var offset = descHeight/2;
    var halfGallImgHeight = gallImg.height()/2;
    position = halfGallImgHeight + offset;
    gallImgDesc.css('bottom', position);
  });

  $('.navbar-collapse').click('li', function() {
    $('.navbar-collapse').collapse('hide');
  });
  
  if (($(window).width() >= 800) && ($(window).height() > $(window).width())) {
    $(".backstretch-carousel").backstretch([
    "./img/bg-contactTall_800x1600.jpg",
    "./img/bg-welcomeTall_800x1600.jpg",
    "./img/bg-servicesTall_800x1600.jpg",
    "./img/bg-galRed_800x1600.png",
    "./img/bg-galGreen_800x1600.png",
    "./img/bg-galBeige_800x1600.png"],
    {duration:1000,fade:1000});

    $(window).on('orientationchange', function(){
      var indx = $('.backstretch-carousel').data("backstretch").index;
      $('.backstretch-carousel').backstretch([
        "./img/bg-contact_1300x954.jpg",
        "./img/bg-welcome_1300x919.jpg",
        "./img/bg-services_1300x951.jpg",
        "./img/bg-galRed_1300x955.png",
        "./img/bg-galGreen_1300x955.png",
        "./img/bg-galBeige_1300x955.png"],
        {duration:1000,fade:1000});
      $('.backstretch-carousel').data("backstretch").index = indx;
    });
  } else if (($(window).width() < 800) && ($(window).height() > $(window).width())){
    if (($(window).width() == 360)&&($(window).height() == 640)){
      $(".backstretch-carousel").backstretch([
        "./img/bg-contact_400x800.jpg",
        "./img/bg-welcomeHalf_400x800.jpg",
        "./img/bg-servicesHalf_400x800.jpg",
        "./img/bg-galRed_400x800.png",
        "./img/bg-galGreen_400x800.png",
        "./img/bg-galBeige_400x800.png"],
        {duration:1000,fade:1000});

      $(window).on('orientationchange', function(){
        var indx = $('.backstretch-carousel').data("backstretch").index;
        $('.backstretch-carousel').backstretch([
          "./img/bg-contact_800x400.jpg",
          "./img/bg-welcome_800x400.jpg",
          "./img/bg-services_800x400.jpg",
          "./img/bg-galRed_800x400.png",
          "./img/bg-galGreen_800x400.png",
          "./img/bg-galBeige_800x400.png"],
          {duration:1000,fade:1000});
        $('.backstretch-carousel').data("backstretch").index = indx;
      });
    } else {
        $(".backstretch-carousel").backstretch([
        "./img/bg-contact_400x800.jpg",
        "./img/bg-welcomeHalf_400x800.jpg",
        "./img/bg-services_400x800.jpg",
        "./img/bg-galRed_400x800.png",
        "./img/bg-galGreen_400x800.png",
        "./img/bg-galBeige_400x800.png"],
        {duration:1000,fade:1000});

        $(window).on('orientationchange', function(){
          var indx = $('.backstretch-carousel').data("backstretch").index;
          $('.backstretch-carousel').backstretch([
            "./img/bg-contact_800x400.jpg",
            "./img/bg-welcome_800x400.jpg",
            "./img/bg-services_800x400.jpg",
            "./img/bg-gal1300xRed_800x400.png",
            "./img/bg-gal1300xGreen_800x400.png",
            "./img/bg-gal1300xBeige_800x400.png"],
            {duration:1000,fade:1000});
          $('.backstretch-carousel').data("backstretch").index = indx;
        });
      }
  } else {
    $(".backstretch-carousel").backstretch([
      "./img/bg-contact_1300x954.jpg",
      "./img/bg-welcome_1300x919.jpg",
      "./img/bg-services_1300x951.jpg",
      "./img/bg-galRed_1300x955.png",
      "./img/bg-galGreen_1300x955.png",
      "./img/bg-galBeige_1300x955.png"],
    {duration:1000,fade:1000});
  }

  $(".backstretch-carousel").backstretch("pause");

  $('.screen').waypoint(function(direction) {
    if (direction === 'down') {
     $(".backstretch-carousel").backstretch("next");
    }
    if (direction === 'up') {
     $(".backstretch-carousel").backstretch("prev");
    }
  }, { offset: '50%' });

  if ($(window).width() >= 768){
    $('.img-window').hover(function(event){
        var img = $(this).children('.gall-image');
        var imgSrc = img.attr("src");
        var newSrc = imgSrc.replace(".png", "Tint.png");
        img.attr("src", newSrc);
        $(this).find('.gall-img-desc').addClass('animated fadeInDown').css('display', 'block');
    },function(){
        var img = $(this).children('.gall-image');
        var imgSrc = img.attr("src");
        var newSrc = imgSrc.replace("Tint.png" ,".png");
        img.attr("src", newSrc);
        $(this).find('.gall-img-desc').removeClass('animated fadeInDown').css('display', 'none');
    });
  }
});
