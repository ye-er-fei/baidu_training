 //banner
 
// var index = 0;
//     var len = $(".btn span").length;
//     var adTimer;
//     var flag = true;
//     $(".btn span").mouseover(function () {
//         index = $(this).index();
//         showImg(index);
//     });
   
//     function showImg(i)
//     {
//         $(".fPic li.pic").eq(i).stop(true,true).fadeIn(5000).siblings().fadeOut(1000);
//         $(".btn span").eq(i).addClass("curr").siblings().removeClass("curr");
//     }
//     function autoSlide()
//     {
//         if(flag == true)
//         {
//             adTimer = setInterval(function () {
//                 showImg(index%len);
//                 index++;
//             },5000);
//         }
//         else
//         {
//             clearInterval(adTimer);
//         }
//     }
//     autoSlide();


    $(".nav-f").mouseover(function(){
        $(this).addClass("nav-active");
        $(this).find(".nav-next").show();
    })
    $(".nav-f").mouseleave(function(){
        $(this).removeClass("nav-active");
        $(this).find(".nav-next").hide();
    })
    $(".nav-next li").mouseover(function(){
        $(this).addClass("nav-active");
    })
    $(".nav-next li").mouseleave(function(){
        $(this).removeClass("nav-active");
    })

// $("#img-p-tab1").click(function(){
//     $("#cont-p-tab1").show();
//      $("#cont-p-tab2").hide();
// })
// $("#img-p-tab2").click(function(){
//     $("#cont-p-tab2").show();
//     $("#cont-p-tab1").hide();

//})

$("li[id^='job']").click(function () {
        var index = $(this).attr('id');
        var thisid = index.substr(3);        
        $('.job0'+thisid+'_detail').removeClass('dis-none').siblings().addClass('dis-none');
    })
