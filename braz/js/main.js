$.hisrc.speedTest();

$(document).ready(function(){

  $(".hisrc img").hisrc();
  $(".hisrc img+img").hisrc({
    useTransparentGif: false,
    speedTestUri: './50K.jpg'
  });

  // Set navbar size

  var setNav = function() {
    var cntWidth = $('#content-wrapper').width();
    $('#navbar').css('width', cntWidth);
  };

  var resizeMgr = function() {

  // Resize gallery images

    this.gallImgWindow = $('.img-window');
    this.gallImg = $('.gall-image');

    if($(document).width() < 768){
      this.gallImg.width('80%');
    } else {
      this.gallImg.width('90%');
    }
    this.gallImg.height(this.gallImg.width() * 1/1.333333);
    this.gallImgWindow.height(this.gallImg.height());

  // Set gallery image description position when shown

    this.gallImgWindow.each(function(index){
      var position;
      var gallImgDesc = $(this).find('.gall-img-desc');
      var descHeight = gallImgDesc.height();
      var offset = descHeight/2;
      var halfGallImgHeight = $(this).height()/2;
      position = halfGallImgHeight + offset;
      gallImgDesc.css('bottom', position);
    });

  // Resize navbar
    setNav();
  };

  resizeMgr();

  window.onresize = resizeMgr();

  $(".backstretch-carousel").backstretch([
    "./img/bg-services.jpg",
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
