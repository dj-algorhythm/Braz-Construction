$(".hisrc img").hisrc();
$(".hisrc img+img").hisrc({
  useTransparentGif: true,
  speedTestUri: '50K.jpg'
});

$(document).ready(function(){
  var gallImgMgr = {

    gallImgWindow: $('.img-window'),
    gallImg: $('.gall-image'),

    setGallImgSize: function(){
      if($(document).width() < 768){
        this.gallImg.width('80%');
      } else {
        this.gallImg.width('90%');
      }
      this.gallImg.height(this.gallImg.width() * 1/1.333333);
      this.gallImgWindow.height(this.gallImg.height());
      this.setGallImgDesc();
    },

    setGallImgDesc: function(){
      var gallImgDesc = $('.gall-img-desc');
      var descHeight = gallImgDesc.height();
      var halfGallImgHeight = this.gallImg.height()/2;
      gallImgDesc.css('bottom', function(){
        var offset = descHeight/2;
        return halfGallImgHeight + offset;
      });
    }

  }

  window.onresize = gallImgMgr.setGallImgSize();

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


  gallImgMgr.setGallImgSize();


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
