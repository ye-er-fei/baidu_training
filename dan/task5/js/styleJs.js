$(function(){
	 $('[name="nice-select"]').click(function (e) {
            $('[name="nice-select"]').find('ul').hide();
            $(this).find('ul').show('fast',function(){
            	$(this).parent().addClass('active');
           		$(this).addClass('on');
            });
            
            e.stopPropagation();
        });
        $('[name="nice-select"] li').hover(function (e) {
            $(this).toggleClass('on');
            e.stopPropagation();
        });
        $('[name="nice-select"] li').click(function (e) {
            var val = $(this).text();
            var dataVal = $(this).attr("data-value");

            $(this).parents('[name="nice-select"]').find('input').val(val);
            $('[name="nice-select"] ul').hide('fast',function(){
            	 	$(this).parent().removeClass('active');
            		$(this).removeClass('on');
            });
            
            e.stopPropagation();
            // alert("中文值是：" + val);
            // alert("数字值是：" + dataVal);
            //alert($(this).parents('[name="nice-select"]').find('input').val());
        });
        $(document).click(function () {
            $('[name="nice-select"] ul').hide('fast',function(){
            	 	$(this).parent().removeClass('active');
            		$(this).removeClass('on');
            });
        });
})