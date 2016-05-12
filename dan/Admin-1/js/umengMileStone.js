;(function($,undefined){
    $.widget('umeng.mileStones',{
        options:{
            params: {}
        },
        _init: function(){
            if(UMENG.Storage.milestone == undefined){
                UMENG.Storage.milestone = {};
            };
            var length = $('.js-um-milestone').length;
            if(length > 0){
                this.reset();
                try{
                    this._getData(function(that,data){
                        function sliceData(sdata,data,len){
                            var arr = [];
                            for(i=0;i<sdata.length;i++){
                                for(j=0;j<data.length;j++){
                                    if(sdata[i].category == data[j].point){
                                        arr.push(data[j]);
                                    }
                                };

                            };
                            return arr;
                        };

                        if(data.length > 0){
                            var tag = false;
                            var chart = $('div[data-chart="'+ that.element.attr('id') +'"]').attr('data-chart');
                            var hc = $('#'+chart).highcharts();
                            var sdata = hc.series[0].data;
                            //keep data and sdata same length :slice point
                            var len = sdata.length;
                            var slicedata = sliceData(sdata,data,len);

                            var color = hc.series[0].color.split('#')[1];
                            for(s=0;s<slicedata.length;s++){
                                for(i=0;i<sdata.length;i++){
                                    if(sdata[i].category == slicedata[s].point){
                                        slicedata[s].x = sdata[i].clientX;
                                        tag = true;
                                    }
                                }
                            }
                            $('div[data-chart="'+ that.element.attr('id') +'"]').data('originData',sdata);
                        }
                        //if not match any date
                        if(tag){
                            // table
                            that.drawTable(slicedata);

                            var yAix = hc.series[0].yAxis.left;
                            $('div[data-chart="'+ that.element.attr('id') +'"]').find('.posiLine').css('left',yAix);
                            //flag
                            that.drawFlag(color,slicedata);
                        }
                    });

                }catch(e){}
            };
            this.bindEvents();
        },
        drawFlag: function(color,data){
            //params : color, data
            //return
            var date = MD5(new Date().toString());
            for(i=0;i<data.length;i++){
                if(data[i].x == undefined){
                    data[i].x = -9999;
                }
                for(j = i+1;j<data.length;j++){
                    if(data[i].point == data[j].point){
                        data[j].x = -9999;
                    }
                }
            }
            var line = $('div[data-chart="'+ this.element.attr('id') +'"]').find('.js-ms-flag');
            var tmplFlag = '<img src="/images/icons/milestone/'+ color +'-0.png" flag-id="${point}" class="js-ms-img" style="left:${x-5}px" alt="${date}" target="false"/>';
            $.template(date,tmplFlag);
            $.tmpl(date,data).appendTo(line);
        },
        drawTable: function(data){
            //params : data
            var date = MD5(new Date().toString());

            var table = $('div[data-chart="'+ this.element.attr('id') +'"]').find('table.ms-details tbody');
            var tmplTable = '<tr flag-id="${point}"><td width="10%">${date}</td><td width="70%">${name}</td><td width="20%">${email}</td></tr>';
            $.template(date,tmplTable);
            $.tmpl(date,data).appendTo(table);
        },
        _getData: function(callback){
            var that = this;
            var ms = [];
            var params = $.extend({},{start_date: UMENG.Agent.getDate().start_date,end_date: UMENG.Agent.getDate().end_date},{time_unit: UMENG.Agent.getTimeunit()},this.options.params);
            var key = MD5(JSON.stringify(params));
            if(UMENG.Storage.milestone && UMENG.Storage.milestone[key] != undefined){
                ms = UMENG.Storage.milestone[key];
                callback(that,ms);
            }else{
                $.ajax({
                    url: '/apps/'+ UMENG.APPKEY +'/milestones/load',
                    type: 'get',
                    data: params,
                    success: function(res){
                        if(res.result == 'ok'){
                            ms = res.data;
                            UMENG.Storage.milestone[key] = res.data;
                            callback(that,ms);
                        }
                    }
                })
            }
        },
        resizeFlag: function(){
            $('.js-ms-img').each(function(){
                var sdata = $('div[data-chart="'+ this.element.attr('id') +'"]').data('originData');
                for(i=0;i<sdata.length;i++){
                    if(sdata[i].category == $(this).attr('flag-id')){
                        $(this).css('left',sdata[i].clientX);
                    }
                }

            })
        },
        reset: function(){
            var jsUmMs = $('div[data-chart="'+ this.element.attr('id') +'"]');
            jsUmMs.find('table.ms-details tbody').empty();
            jsUmMs.find('.js-ms-flag').empty();
            $('.js-ms-flag').off();
            $('.js-ms-btn').off();
            $('.js-ms-tab tbody').off();
        },
        bindEvents: function(){
            var that = this;
            //flag images hover event
            $('.js-ms-flag').on('mouseenter','.js-ms-img',function(){
                var img = $(this).eq(0);
                var src = img.attr('src').split('-')[0] + '-1.png';
                img.attr('src',src);
            });

            $('.js-ms-flag').on('mouseleave','.js-ms-img',function(){
                var img = $(this).eq(0);
                if(img.attr('target') != 'true'){
                    var src = img.attr('src').split('-')[0] + '-0.png';
                    img.attr('src',src);
                }
            });

            //flag images click event
            $('.js-ms-flag').on('click','.js-ms-img',function(){
                var parents = $(this).parents('.js-um-milestone');
                var img = $(this).eq(0);
                $(this).siblings().attr({'target':'false','src':img.attr('src').split('-')[0] + '-0.png'});
                var flagId = img.attr('flag-id');
                var src = img.attr('src').split('-')[0] + '-1.png';
                img.attr('src',src);
                img.attr('target','true');
                parents.find('.ms-details tr').removeClass('highlight');
                parents.find('.js-ms-tab').show();
                parents.find('.ms-details tr[flag-id='+ flagId +']').addClass('highlight');
                parents.find('.js-ms-btn').attr('ms-switch','on');
                parents.find('.js-ms-btn').attr('src','/images/icons/milestone/hide.png');
            });

            //milestone button event
            $('.js-ms-btn').on('click',function(){
                var images = $('.js-ms-flag .js-ms-img');
                $(this).parents('.js-um-milestone').find('.js-ms-tab').toggle();
                if($(this).attr('ms-switch') == 'off'){
                    $(this).attr('ms-switch','on');
                    $(this).attr('src','/images/icons/milestone/hide.png');
                }else{
                	if(images.length>0){
                		try{
                        	images.attr({'target':'false','src':images.eq(0).attr('src').split('-')[0] + '-0.png'});
                    	}catch(e){};
                	}
                    $(this).parents('.js-um-milestone').find('.js-ms-tab tbody tr').removeClass('highlight');
                    $(this).attr('ms-switch','off');
                    $(this).attr('src','/images/icons/milestone/show.png');
                }
            });

            //milestone table item click event
            $('.js-ms-tab tbody').on('click','tr',function(){
                var flagId = $(this).attr('flag-id');
                var img = $(this).parents('.js-um-milestone').find('.js-ms-flag .js-ms-img[flag-id='+ flagId +']');
                img.siblings().attr('src',img.attr('src').split('-')[0] + '-0.png');
                var src = img.attr('src').split('-')[0] + '-1.png';
                img.attr('src',src);
                $(this).siblings().removeClass('highlight');
                $(this).addClass('highlight');
            })

            $(window).resize(function(){
                var that = this;
                setTimeout(function(){
                    $('.js-ms-img').each(function(){
                        var sdata = $(this).parents('.js-um-milestone').data('originData');
                        for(i=0;i<sdata.length;i++){
                            if(sdata[i].category == $(this).attr('flag-id')){
                                $(this).css('left',sdata[i].clientX);
                            }
                        }
                    })
                },600);

            });
            //image add tooltip
            //$('.js-ms-img').tooltip();
        }

    });
})(jQuery);
