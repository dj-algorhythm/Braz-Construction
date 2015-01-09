//$.hisrc.speedTest();

$(document).ready(function(){

  $(".hisrc img").hisrc();
  $(".hisrc img+img").hisrc({
    useTransparentGif: false,
    speedTestUri: './50K.jpg'
  });

  $(window).scroll(function(){
    var currentScreen = $('.screen').filter(function(){
      var offset = $(this).offset();
      return offset.top == 0;
    });

    if (currentScreen.attr('id', 'welcome')) {
      $('#navbar').css('border-color', '#612B03');
    } else if (currentScreen.attr('id', 'services')) {
      $('#navbar').css('border-color', '#C69C6D');
    } else if (currentScreen.attr('id', 'gallery1')) {
      $('#navbar').css('border-color', '#3d5e19');
    } else if (currentScreen.attr('id', 'gallery2')) {
      $('#navbar').css('border-color', '#3A1002');
    } else if (currentScreen.attr('id', 'gallery3')) {
      $('#navbar').css('border-color', '#3d5e19');
    } else (currentScreen.attr('id', 'contact'))
      $('#navbar').css('border-color', '#3A1002');
  });

  $('.img-window').each(function(index){
    var position;
    var gallImgDesc = $(this).find('.gall-img-desc');
    var gallImg = $(this).find('.gall-image');
    var descHeight = gallImgDesc.height();
    var offset = descHeight/2;
    var halfGallImgHeight = gallImg.height()/2;
    position = halfGallImgHeight + offset;
    gallImgDesc.css('bottom', position);
  });

  if ($(window).width() < 768) {
  $(".backstretch-carousel").backstretch([
    "./img/bg-gallery3.jpg",
    "./img/bg-welcome_half.jpg",
    "./img/bg-services_naked.jpg",
    "./img/bg-gallery1.jpg",
    "./img/bg-gallery2.jpg"],
    {duration:1000,fade:1000});
  } else {
    $(".backstretch-carousel").backstretch([
      "./img/bg-gallery3.jpg",
      "./img/bg-welcome.jpg",
      "./img/bg-services_naked.jpg",
      "./img/bg-gallery1.jpg",
      "./img/bg-gallery2.jpg"],
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

  $('#srvcs-content-container').tinyscrollbar({trackSize: 100, wheelLock: false});

});
