 $(function(){
	 	$(function(){
	 		(function(){
	 			var curr = 0;
	 			$("#jsNav .trigger").each(function(i){
	 				$(this).click(function(){
	 					curr = i;
	 					$("#js img").eq(i).fadeIn("slow").siblings("img").hide();
	 					$(this).siblings(".trigger").removeClass("imgSelected").end().addClass("imgSelected");
	 					return false;
	 				});
	 			});
	 			
	 			var pg = function(flag){
	 				if (flag) {
	 					if (curr == 0) {
	 						todo = 3;
	 					} else {
	 						todo = (curr - 1) % 3;
	 					}
	 				} else {
	 					todo = (curr + 1) % 3;
	 				}
	 				$("#jsNav .trigger").eq(todo).click();
	 			};
	 			
	 			//ǰ
	 			$("#prev").click(function(){
	 				pg(true);
	 				return false;
	 			});
	 			
	 			//
	 			$("#next").click(function(){
	 				pg(false);
	 				return false;
	 			});
	 			
	 			//Զ
	 			var timer = setInterval(function(){
	 				todo = (curr + 1) % 3;
	 				$("#jsNav .trigger").eq(todo).click();
	 			},3000);
	 			
	 			$("#js,#prev,#next").hover(function(){
	 					clearInterval(timer);
	 				},
	 				function(){
	 					timer = setInterval(function(){
	 						todo = (curr + 1) % 3;
	 						$("#jsNav .trigger").eq(todo).click();
	 					},3000);			
	 				}
	 			);
	 		})();
	 	});
			



		//最新资讯
		$("li[id^='panel']").click(function(){
			var index=$(this).attr('id');
			 var thisid = index.substr(5);
			 $(this).addClass('active').siblings().removeClass('active');
			$('#panel0'+thisid).addClass('active').siblings().removeClass('active');

		})

		$(".hero-pic li").mouseover(function(){
			$(this).find('.hero-dt').show();
		})
		$(".hero-pic li").mouseleave(function(){
			$(this).find('.hero-dt').hide();
		})












		 })
