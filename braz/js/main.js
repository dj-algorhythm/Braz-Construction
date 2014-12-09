$(document).ready(function(){
  $(".hisrc img").hisrc();
  $(".hisrc img+img").hisrc({
    useTransparentGif: true,
    speedTestUri: '50K.jpg'
  });

  $(".backstretch-carousel").backstretch("./img/bg-gallery2.png");
  //var galRows = document.getElementsByClassName("gallery-row");
  //var colsRow1 = galRows[0].childNodes;
  //var colsRow2 = galRows[1].childNodes;

  var setImgSize = function (){
      /*var imgWindowWidth = $('.img-window').width();
      $('.img-window > img').width(.7816128773924881877152238327861 * imgWindowWidth);
      var imgWidth = .7816128773924881877152238327861 * imgWindowWidth;
      $('.img-window > img').height(imgWidth * 1/1.5121951219512195121951219512195);*/
      var winWidth = $('.img-window').width();
      $('.gall-image').height(winWidth * 1/1.333333);
      $('.gall-image').width('100%');
  };

  setImgSize();

  $('.gall-image').hover(function(event){
      var imgSrc = $(event.currentTarget).attr("src");
      var newSrc = imgSrc.replace(".png", "Tint.png");
      $(event.currentTarget).attr("src", newSrc);
  },function(){
      var imgSrc = $(event.currentTarget).attr("src");
      var newSrc = imgSrc.replace("Tint.png", ".png");
      $(event.currentTarget).attr("src", newSrc);
  });
  //$(document).resize(setImgSize());
});
