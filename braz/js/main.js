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

  // if ($(window).width() < 768) {
  // $(".backstretch-carousel").backstretch([
  //   "./img/bg-contactHalf.jpg",
  //   "./img/bg-welcomeHalf.jpg",
  //   "./img/bg-servicesHalf.jpg",
  //   "./img/bg-designEmbossedRed.jpg",
  //   "./img/bg-designEmbossedGreen.jpg",
  //   "./img/bg-designEmbossedBeige.jpg"],
  //   {duration:1000,fade:1000});
  // } else if ($(window).width() > 768 && ($(window).height() >= 2*$(window).width())) {
  //   $(".backstretch-carousel").backstretch([
  //   "./img/bg-contactTall.jpg",
  //   "./img/bg-welcomeTall.jpg",
  //   "./img/bg-servicesTall.jpg",
  //   "./img/bg-designEmbossedRed.jpg",
  //   "./img/bg-designEmbossedGreen.jpg",
  //   "./img/bg-designEmbossedBeige.jpg"],
  //   {duration:1000,fade:1000});
  // } else {
  //   $(".backstretch-carousel").backstretch([
  //     "./img/bg-contact.jpg",
  //     "./img/bg-welcome.jpg",
  //     "./img/bg-services.jpg",
  //     "./img/bg-gallery1.jpg",
  //     "./img/bg-gallery2.jpg",
  //     "./img/bg-gallerry3.jpg"],
  //   {duration:1000,fade:1000});
  // }

  /*if ($(window).width() < 768) {
  $(".backstretch-carousel").backstretch([
    "./img/bg-contactHalf.jpg",
    "./img/bg-welcomeHalf.jpg",
    "./img/bg-servicesHalf.jpg",
    "./img/bg-designEmbossedRed.jpg",
    "./img/bg-designEmbossedGreen.jpg",
    "./img/bg-designEmbossedBeige.jpg"],
    {duration:1000,fade:1000});
  } else*/
  if (($(window).width() >= 1080) && ($(window).height() > $(window).width())) {
    $(".backstretch-carousel").backstretch([
    "./img/bg-contactTall.jpg",
    "./img/bg-welcomeTall.jpg",
    "./img/bg-servicesTall.jpg",
    "./img/bg-designEmbossedRed.jpg",
    "./img/bg-designEmbossedGreen.jpg",
    "./img/bg-designEmbossedBeige.jpg"],
    {duration:1000,fade:1000});
  } else if (($(window).width() <= 800) && ($(window).height() > $(window).width())){
    if (($(window).width() == 360)&&($(window).height() == 640)){
      $(".backstretch-carousel").backstretch([
        "./img/bg-contact.jpg",
        "./img/bg-welcomeHalf.jpg",
        "./img/bg-servicesHalf.jpg",
        "./img/bg-designEmbossedRed.jpg",
        "./img/bg-designEmbossedGreen.jpg",
        "./img/bg-designEmbossedBeige.jpg"],
        {duration:1000,fade:1000});
    } else {
        $(".backstretch-carousel").backstretch([
        "./img/bg-contact.jpg",
        "./img/bg-welcomeHalf.jpg",
        "./img/bg-services.jpg",
        "./img/bg-designEmbossedRed.jpg",
        "./img/bg-designEmbossedGreen.jpg",
        "./img/bg-designEmbossedBeige.jpg"],
        {duration:1000,fade:1000});
      }
  } else {
    $(".backstretch-carousel").backstretch([
      "./img/bg-contact.jpg",
      "./img/bg-welcome.jpg",
      "./img/bg-services.jpg",
      "./img/bg-gallery1.jpg",
      "./img/bg-gallery2.jpg",
      "./img/bg-gallerry3.jpg"],
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
