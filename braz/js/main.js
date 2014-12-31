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
      return offset.top === 0;
    });

    if (currentScreen.attr('id', 'welcome')) {
      $('#navbar').css('border-color', '#4E2005')
    } else if (currentScreen.attr('id', 'services')) {
      $('#navbar').css('border-color', '#4E2005')
    } else if (currentScreen.attr('id', 'gallery')) {
      $('#navbar').css('border-color', '#4E2005')
    } else (currentScreen.attr('id', 'contact')) {
      $('#navbar').css('border-color', '#4E2005')
    }
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

  $(".backstretch-carousel").backstretch([
    "./img/bg-gallery3.jpg",
    "./img/bg-gallery1.jpg",
    "./img/bg-gallery2.jpg"],
    {duration:1000,fade:1000});

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



});
