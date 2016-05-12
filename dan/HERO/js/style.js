
$(function(){


// $(document).ready(function() {
    
//     //Remove 300ms lag set by -webkit-browsers     
//     window.addEventListener('load', function() {
// 		FastClick.attach(document.body);
// 	}, false);	
// })

//游戏美景
//  $(".scien").mouseover(function(){
//  	$(this).addClass('active').siblings().removeClass('active');
// })

	$(".scien").hover(function(){
		$(this).addClass("active")},
		function(){$(this).removeClass("active")
	})	


//topNav
$(".et").mouseover(function(){
	$(this).find('.imlay').show();
})
$(".et").mouseout(function(){
	$(this).find('.imlay').hide();
})

//section4
$(".et").mouseover(function(){
	$(this).find('.l-imlay').show();
})
$(".et").mouseout(function(){
	$(this).find('.l-imlay').hide();
})


//最新资讯
	$("li[id^='panel']").click(function(){
		var index=$(this).attr('id');
		 var thisid = index.substr(5);
		 $(this).addClass('active').siblings().removeClass('active');
		$('#panel0'+thisid).addClass('active').siblings().removeClass('active');

	})
$(".hero-t a").hover(function(){
	var d=$(this).attr('id');
	var t=d.substr(1);	
	$(this).addClass('active').siblings().removeClass('active');
	$('.shi20'+t).addClass('active').siblings().removeClass('active');
	
})

// })
//人物切换
$(".hero-t li").mouseover(function(){
	var n=$(this).attr('id');
	var this_id=n.substr(1);	
	$(this).addClass('active').siblings().removeClass('active');
	$('#t0'+this_id).addClass('active').siblings().removeClass('active');

})
//英雄详情
 // $(".hero-t li").mouseover(function(){
 // 	$(".slow").show('slow');
 // })
 //  $(".hero-t li").mouseout(function(){
 // 	$(".slow").hide('slow');
 // })
  $(".hero-t li").click(function(){
 	window.location.href="heroDefailtPage.html"; 
 })

// $(".black-icon").hover(function(){
// 	$(this).hide();
// 	$(this).next('.light-icon').show();

// }
// )
 // $(".light-icon").mouseover(function(){
 // 	$(this).title().show();


// })


})