function minbanner(){  
  var bn_id = 0;
  var bn_id2= 1;
  var speed33=3000;
  var qhjg = 1;
    var MyMar33;
  $("#min-banner .d1").hide();
  $("#min-banner .d1").eq(0).fadeIn("slow");
  if($("#min-banner .d1").length>1)
  {
    $("#min-banner_id li").eq(0).addClass("nuw");
    function Marquee33(){
      bn_id2 = bn_id+1;
      if(bn_id2>$("#min-banner .d1").length-1)
      {
        bn_id2 = 0;
      }
      // $("#min-banner .d1").eq(bn_id).css("z-index","2");
      // $("#min-banner .d1").eq(bn_id2).css("z-index","1");
      $("#min-banner .d1").eq(bn_id2).show();
      $("#min-banner .d1").eq(bn_id).fadeOut("slow");
      $("#min-banner_id li").removeClass("nuw");
      $("#min-banner_id li").eq(bn_id2).addClass("nuw");
      bn_id=bn_id2;
    };
  
    MyMar33=setInterval(Marquee33,speed33);
    
    $("#min-banner_id li").click(function(){
      var bn_id3 = $("#min-banner_id li").index(this);
      if(bn_id3!=bn_id&&qhjg==1)
      {
        qhjg = 0;
        // $("#min-banner .d1").eq(bn_id).css("z-index","2");
        // $("#min-banner .d1").eq(bn_id3).css("z-index","1");
        $("#min-banner .d1").eq(bn_id3).show();
        $("#min-banner .d1").eq(bn_id).fadeOut("slow",function(){qhjg = 1;});
        $("#min-banner_id li").removeClass("nuw");
        $("#min-banner_id li").eq(bn_id3).addClass("nuw");
        bn_id=bn_id3;
      }
    })
    $("#min-banner_id").hover(
      function(){
        clearInterval(MyMar33);
      }
      ,
      function(){
        MyMar33=setInterval(Marquee33,speed33);
      }
    ) 
  }
  else
  {
    $("#min-banner_id").hide();
  }
}