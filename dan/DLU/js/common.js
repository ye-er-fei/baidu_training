$(function(){

$(".a-left li").click(function(){
 	$(this).addClass('active').siblings().removeClass('active');

 })

	$("li[id^='tab']").click(function(){
		var index=$(this).attr('id');
		 var thisid = index.substr(3);
		 $(this).addClass('active').siblings().removeClass('active');
		$('#tab0'+thisid).addClass('active').siblings().removeClass('active');

	})



})