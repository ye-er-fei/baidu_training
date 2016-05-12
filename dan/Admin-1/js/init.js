$(document).ready(function() {

var pageList = {
    'index':function(){
        return {
            chart:[],
            table:[]
        }
    },
    'realtime_summary':function(){
        return {
            chart:[
                {
                    cid: 'base_chartcontainer',
                    params:{
                        time_unit:'hourly',
                        is_compared: false,
                        stats: 'index_hours_' + $('#base-sum-tab').SumTab('getTab')
                    }
                },
                {
                    cid: 'custom_chartcontainer',
                    params:{
                        time_unit:'hourly',
                        is_compared: false,
                        stats: 'index_hours_' + $('#custom-sum-tab').SumTab('getTab')
                    }
                }
            ],
            table:[
                {
                    tid: 'scale_table',
                    params: {
                        stats: 'index_scale'
                    },
                    tmpl: '<tr><td>${date}</td><td>${data}</td></tr>'
                },{
                    tid: 'summary_table',
                    params: {
                        stats : 'index_summary'
                    },
                    tmpl: '<tr><td>${date}</td><td>${data}</td></tr>'
                }
            ]
        }
    },
    'group_trend': function() {
        return {
            chart:[
                {
                    cid: 'chartcontainer',
                    url: '/apps/load_group_trend_chart.json',
                    params:{
                        metric: tab_VM.getTab(),
                        app_tag_id: $('#group-select-cus').DownList('get').attr('data-id')
                    }
                }
            ],
            table:[
                {
                    tid: 'group_trend_table',
                    url: '/apps/load_group_trend_table.json',
                    tmpl: UMENG.Agent.getTimeunit() == 'daily' ? '<tr><td>${date}</td><td>${install}</td><td>${install_uniq}</td><td>${active}</td><td>${active_uniq}</td><td>${launch}</td><td>${install_accum}</td></tr>' : '<tr><td>${date}</td><td>${install}</td><td>${active}</td><td>${active_avg}</td><td>${launch}</td><td>${install_accum}</td></tr>',
                    per_page: 30,
                    params: {
                        app_tag_id: $('#group-select-cus').DownList('get').attr('data-id')
                    },
                    callback: function(){
                      if(UMENG.Agent.getTimeunit() != 'daily'){
                        $('#group_trend_table table th').eq(2).hide();
                        $('#group_trend_table table th').eq(4).hide();
                      }else{
                        $('#group_trend_table table th').eq(2).show();
                        $('#group_trend_table table th').eq(4).show();
                      }
                    }
                }
            ]
        };
    },
    'installations': function() {
      return {
        chart: [
          {
            cid: 'chartcontainer',
            params: {
              stats: JSON.parse($('#useAccount').val()) ? $('#tabpanel_items').tab('getTab') : UMENG.ACTIONSTATS
            },
            callback:function(){
              $('#chartcontainer').mileStones();
            }
          }
        ],
        table: [
          {
            tid: 'installation_table',
            params: {
              stats: JSON.parse($('#useAccount').val()) ? 'installations_accounts' : UMENG.ACTIONSTATS
            },
            url: '/apps/'+ UMENG.APPKEY +'/reports/load_table_data',
            tmpl: JSON.parse($('#useAccount').val()) ? ($('li[particle="installations_accounts"]').hasClass('off') ? window.installAccount.tmpl['accountInstall']  : window.installAccount.tmpl['installations_accounts']) :  '<tr><td>${date}</td><td>${data}</td><td>${rate}{{if rate != "--"}}%{{/if}}</td></tr>',
            callback:function(){
              $.publish('/'+UMENG.ACTIONSTATS)
            }
          }
        ]
      };
    },
    'active_users': function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    params: {
                      stats: tab_VM.getTab() || UMENG.ACTIONSTATS
                    },
                    chartParams: {
                        tooltip: {
                            formatter: function() {
                                return this.key + (UMENG.Agent.getTimeunit() == 'daily' ? getHoliday(this.key,this.series.userOptions) : '')  + ': ' + this.y + (tab_VM.getTab().indexOf('rate') > 0 ? '%' : '');
                            }
                        }
                    },
                    callback:function(){
                        $('#chartcontainer').mileStones();
                    }
                }
            ],
            table: [

            ],
            subscribeFunc: [
                {
                    funcName: 'activeUserSummary',
                    tmpl: '',
                    params: []
                }
            ]
        };
    },
    'silent_users': function() {
        var tab = $('#stats-tab').tab('getTab');
        var chartConfig;
        if (tab === 'percentage') {
          chartConfig = {
              cid: 'chartcontainer',
              params: {stats: UMENG.ACTIONSTATS, tabindex: '1', time_unit: 'weekly'},
              chartParams: {
                  chart: {
                    type: 'area'
                  },
                  yAxis: {
                      labels: {
                        formatter: function() {
                          return this.value + '%';
                        }
                      }
                  },
                  tooltip: {
                    formatter: function() {
                      return this.x + ': <b>'+this.y.toFixed(2) +'%</b>'
                    }
                  }
              },
              callback:function(){
                  UMENG.MileStoneChart = 'chartcontainer';
                  $('#chartcontainer').mileStones({params:{time_unit: "weekly"}});
              },
              dataCallback: function(stats) {
                var newStats = [], silentData, newData, newSeries = {'name': I18n.t('page_misc.silent_user.silent_user_percentage'), data:[]};
                if (stats.length === 2) {
                  silentData = stats[0].data;
                  newData = stats[1].data;
                  for (var i = 0, len = silentData.length; i < len; i++) {
                    var ratio = 0;
                    if (newData[i] !== 0) {
                      ratio = (100 * silentData[i] / newData[i]);
                    }
                    newSeries.data.push(ratio);
                  }
                  newStats.push(newSeries);
                  stats = newStats;
                }
                return stats;
              },
          };
        } else if (tab === 'absolute') {
          chartConfig = {
            cid: 'chartcontainer',
            params: {stats: UMENG.ACTIONSTATS, tabindex: '2', time_unit: 'weekly'},
            chartParams:{
               chart: {
                 type: 'area'
               },
              //  plotOptions: {
              //    area: {
              //      stacking: 'normal',
              //    }
              //  },
               tooltip: {
                 formatter: function() {
                   var tip_html = this.x + "<br/>";
                   $.each(this.points, function(index, value){
                     tip_html += '<span style="color:'+ value.series.color +'">'+value.series.name+'</span>: <b>'+value.point.y+'</b><br/>'
                   });
                   return tip_html;
                 },
                 shared: true
               }
            },
            callback:function(){
                UMENG.MileStoneChart = 'chartcontainer';
                $('#chartcontainer').mileStones({params:{time_unit: "weekly"}});
            },
            dataCallback: function(stats) {
              stats.reverse();
              return stats;
            }
        };
      }
        return {
            chart: [
              chartConfig
            ],
            table: [
              {
                  tid: 'silent_user_table',
                  url: '/apps/'+ UMENG.APPKEY +'/reports/load_table_data',
                  tmpl: '<tr><td>${date}</td><td>${install}</td><td>${silent_user} </td><td>${rate} %</td></tr>'
              }
            ],
            subscribeFunc: [
                {
                    funcName: 'silentUserSummary',
                    tmpl: '',
                    params: []
                }
            ]
        };
    },
    'retentions': function() {
        return {
            table: [
                {
                    tid: 'rentention-detail',
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_table_data',
                    tmpl: {id: 'tmplTable'},
                    params:{per_page: 1000}
                },
            ],
            subscribeFunc: [
                {
                    funcName: 'tableCallback',
                    tmpl: '',
                    params: []
                }
            ]
        };
    },
    'retention_analytic': function() {
        var user_email = '';
        if ($('#user_email').length > 0) {
          user_email = $('#user_email').attr('attr-id');
        }
        if ($('#version-selector').data('multiSelector')) {
          var versions = $('#version-selector').multiSelector('getResult');
        }
        var versionSign = MD5(user_email + window.location.pathname + 'version-selector');
        var cachedVersions = JSON.parse(localStorage.getItem(versionSign + 'version-selector'));

        if (!$.isArray(versions)) {
          if (cachedVersions !== null) {
            versions = cachedVersions;
          } else {
            versions = [];
          }
        }
        if ($('#channel-selector').data('multiSelector')) {
          var channels = $('#channel-selector').multiSelector('getResult');
        }
        var channelSign = MD5(user_email + window.location.pathname + 'channel-selector');
        var cachedChannels = JSON.parse(localStorage.getItem(channelSign + 'channel-selector'));
        if (!$.isArray(channels)) {
          if (cachedChannels !== null) {
            channels = cachedChannels;
          } else {
            channels = [];
          }
        }
        var cachedChannelsStatus = JSON.parse(localStorage.getItem(channelSign + 'selected'));
        var force_channel = 0;
        if (cachedChannelsStatus === true) {
          force_channel = 1;
        }
        return {
            table: [
                {
                    tid: 'rentention-detail',
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_table_data',
                    tmpl: {id: 'tmplTable'},
                    per_page: 1000,
                    params: {
                      versions: versions,
                      channels: channels,
                      force_channel: force_channel
                    }
                },
            ],
            subscribeFunc: [
                {
                    funcName: 'tableCallback',
                    tmpl: '',
                    params: [{
                      versions: []
                    }]
                }
            ]
        };
    },
    'launches': function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    params: '',
                    callback:function(){
                        UMENG.MileStoneChart = 'chartcontainer';
                        $('#chartcontainer').mileStones();
                    }
                }
            ],
            table: [
                {
                    tid: 'launch-detail-table',
                    tmpl: '<tr><td>${date}</td><td>${data}</td><td>${rate} %</td></tr>'
                }
            ]
        };
    },
    'versions': function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    params:{
                        stats: UMENG.ACTIONSTATS + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        tooltip: {
                            formatter: function() {
                                return this.series.name +' '+ this.key + getHoliday(this.key,this.series.userOptions) + ': ' + this.y;
                            }
                        }
                    }
                }
            ],
        };
    },
    'versionselected': function() {
        return {
            chart:[
                {
                    cid: 'chartcontainer',
                    params:{
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab'),
                        app_version: $('#version-select').DownList('get').attr('id')
                    },
                    callback:function(){
                        UMENG.MileStoneChart = 'chartcontainer';
                        $('#chartcontainer').mileStones();
                    }
                }
            ],
            table:[
                {
                    tid: 'trendDetail',
                    tmpl: '<tr><td>${date}</td><td>${install}</td><td>${active_user}</td><td>${launch}</td><td>${upgrade}</td></tr>',
                    params: {
                        per_page: 20,
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab'),
                        app_version: $('#version-select').DownList('get').attr('id')
                    }
                }
            ]
        };
    },
    'benchmark': function() {
        return {
            table:[
                {
                    tid: 'parent-table',
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_table_data',
                    params:{
                        cat: $('#benchmark-type-selector').DownList('get').attr('id'),
                        stats: UMENG.ACTIONSTATS,
                        time_unit: ''
                    },
                    tmpl: UMENG.Tmpl.getTemplate('pages.benchmark.parentTable'),
                    callback:function(){
                        $.publish('showMore');
                    }
                }
            ]
        };
    },
    'duration': function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer_daily_per_launch',
                    params: {
                        stat_type: 'daily_per_launch'
                    },
                    chartParams: {
                        chart: {
                            defaultSeriesType: 'column'
                        },
                        yAxis: {
                            labels: {
                                formatter: function() {
                                    return this.value + '%';
                                }
                            }
                        },
                        'tooltip':{
                            formatter: function() {
                                return this.x+': '+this.y+'%';
                            }
                        }
                    },
                    callback:function(chart,data){
                        showSummary(chart,data);
                    }
                },
                {
                    cid: 'chartcontainer_daily',
                    params: {
                        stat_type: 'daily'
                    },
                    chartParams: {
                        chart: {
                            defaultSeriesType: 'column'
                        },
                        yAxis: {
                            labels: {
                                formatter: function() {
                                    return this.value + '%';
                                }
                            }
                        },
                        'tooltip':{
                            formatter: function() {
                                return this.x+': '+this.y+'%';
                            }
                        }
                    },
                    callback:function(chart,data){
                        showSummary(chart,data);
                    }
                }
            ],
            table: [
                {
                    tid: 'table_daily_per_launch',
                    tmpl: '<tr><td>${key}</td><td>${num}</td><td>${percent}%</td></tr>',
                    params: {
                        stat_type: 'daily_per_launch'
                    }
                },
                {
                    tid: 'table_daily',
                    tmpl: '<tr><td>${key}</td><td>${num}</td><td>${percent}%</td></tr>',
                    params: {
                        stat_type: 'daily'
                    }
                }
            ]
        };
    },
    'frequency': function() {
        return {
            chart: [
                {
                    cid: 'chart_daily',
                    params: {
                        stat_type: 'daily'
                    },
                    chartParams: {
                        'chart':{'defaultSeriesType': 'column'},
                        'yAxis': {
                            labels: {
                                formatter: function() {
                                    return this.value +'%';
                                }
                            }
                        },
                        'tooltip':{
                            formatter: function() {
                                return this.x+': '+this.y+'%';
                            }
                        }
                    },
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_chart_data',
                    callback:function(chart,data){
                        showSummary(chart,data);
                    }
                },
                {
                    cid: 'chart_weekly',
                    params: {
                        stat_type: 'weekly'
                    },
                    chartParams: {
                        'chart':{'defaultSeriesType': 'column'},
                        'yAxis': {
                            labels: {
                                formatter: function() {
                                    return this.value +'%';
                                }
                            }
                        },
                        'tooltip':{
                            formatter: function() {
                                return this.x+': '+this.y+'%';
                            }
                        }
                    },
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_chart_data',
                    callback:function(chart,data){
                        showSummary(chart,data);
                    }
                },
                {
                    cid: 'chart_monthly',
                    params: {
                        stat_type: 'monthly'
                    },
                    chartParams: {
                        'chart':{'defaultSeriesType': 'column'},
                        'yAxis': {
                            labels: {
                                formatter: function() {
                                    return this.value +'%';
                                }
                            }
                        },
                        'tooltip':{
                            formatter: function() {
                                return this.x+': '+this.y+'%';
                            }
                        }
                    },
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_chart_data',
                    callback:function(chart,data){
                        showSummary(chart,data);
                    }
                }
            ],
            table: [
                {
                    tid: 'table_daily',
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_table_data',
                    tmpl: '<tr><td>${key}</td><td>${num}</td><td>${percent}%</td></tr>',
                    params: {
                        stat_type: 'daily'
                    }
                },
                {
                    tid: 'table_weekly',
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_table_data',
                    tmpl: '<tr><td>${key}</td><td>${num}</td><td>${percent}%</td></tr>',
                    params: {
                        stat_type: 'weekly'
                    }
                },
                {
                    tid: 'table_monthly',
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_table_data',
                    tmpl: '<tr><td>${key}</td><td>${num}</td><td>${percent}%</td></tr>',
                    params: {
                        stat_type: 'monthly'
                    }
                },
            ]
        };
    },
    'depth': function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    chartParams: {
                        'chart': {
                            'defaultSeriesType': 'column'
                        },
                        'tooltip': {
                            formatter: function() {
                                return this.x+I18n.t('metrics.depth.page_unit')+': '+this.y;
                            }
                        }
                    },
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_chart_data',
                    callback:function(chart,data){
                        showSummary(chart,data);
                    }
                }
            ],
            table: [
                {
                    tid: 'detail-table',
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_table_data',
                    tmpl: '<tr><td>${date}</td><td>${data}</td><td>${rate}%</td></tr>'
                }
            ]
        };
    },
    'interval': function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    chartParams: {
                        'chart': {
                            'defaultSeriesType': 'column'
                        },
                        'tooltip': {
                            formatter: function() {
                                return this.x + ': ' + this.y;
                            }
                        }
                    },
                    url: '/apps/'+ UMENG.APPKEY +'/reports/load_chart_data'
                }
            ],
            table: [
                {
                    tid: 'detailTable',
                    url: '/apps/' + UMENG.APPKEY + '/reports/load_table_data',
                    tmpl: '<tr><td>${date}</td><td>${data}</td><td>${rate}%</td></tr>'
                }
            ]
        };
    },
    'devices_ios': function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer_resolutions',
                    params: {
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function() {
                                return '' + this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                },
                {
                    cid: 'chartcontainer_versions',
                    params: {
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function() {
                                return '' + this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                },
            ],
            table: [
                {
                   tid: 'table-container',
                   url: '/apps/' + UMENG.APPKEY + '/reports/load_table_data',
                   tmpl: '<tr><td>${date}</td><td>${install_data}</td><td>${install_rate}%</td><td>${launch_data}</td><td>${launch_rate}%</td></tr>'
                },
                {
                    tid: 'broken-table',
                    url: '/apps/' + UMENG.APPKEY + '/reports/load_table_data',
                    tmpl: '<tr><td>${date}</td><td>${data}%</td></tr>',
                    params : {
                      stats:'devices_jailbroken_install'
                    },
                    elem : '#broken',
                    callback: function() {
                      fixColumn();
                    }
                },
                {
                   tid: 'pirated-table',
                   url: '/apps/' + UMENG.APPKEY + '/reports/load_table_data',
                   params: {
                        stats: 'devices_pirated_install'
                   },
                   tmpl: '<tr><td>${date}</td><td>${data}%</td></tr>'
                },
            ]
        };
    },
    'devices_other' : function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer_devices',
                    params: {
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function() {
                                return '' + this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                },
                {
                    cid: 'chartcontainer_resolutions',
                    params: {
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function() {
                                return '' + this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                },
                {
                    cid: 'chartcontainer_versions',
                    params: {
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function() {
                                return '' + this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                }
            ],
            table: [
                {
                   tid: 'table-container',
                   params: {
                       stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                   },
                   url: '/apps/' + UMENG.APPKEY + '/reports/load_table_data',
                   tmpl: '<tr><td>${date}</td><td>${install_data}</td><td>${install_rate}%</td><td>${launch_data}</td><td>${launch_rate}%</td></tr>'
                }
            ]
        };
    },
    'network_access': function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer-access',
                    params:{
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function() {
                              return '' + this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                }
            ],
            table: [
                {
                    tid: 'table-access',
                    params:{
                        stats: UMENG.ACTIONSTATS + '_launches'
                    },
                    tmpl: '<tr><td>${date}</td><td>${install_data}</td><td>${install_rate}%</td><td>${launch_data}</td><td>${launch_rate}%</td></tr>'
                }
            ]
        };
    },
    'network_carriers': function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer-carriers',
                    params: {
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function() {
                              return '' + this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                }
            ],
            table: [
                {
                    tid: 'table-carriers',
                    tmpl: '<tr><td>${date}</td><td>${install_data}</td><td>${install_rate}%</td><td>${launch_data}</td><td>${launch_rate}%</td></tr>'
                }
            ]
        };
    },
    'location_cities' : function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer-cities',
                    params: {
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function() {
                                return '' + this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                }
            ],
            table: [
                {
                    tid: 'table-cities',
                    tmpl: '<tr><td>${date}</td><td>${install_data}</td><td>${install_rate}%</td><td>${launch_data}</td><td>${launch_rate}%</td></tr>'
                }
            ]
        };
    },
    'location_countries' : function() {
        return {
            chart: [
                {
                    cid: 'chartcontainer-countries',
                    params: {
                        stats: UMENG.ACTIONSTATS + '_' + $('#stats-tab').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        tooltip: {
                            formatter: function() {
                                return '' + this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                }
            ],
            table: [
                {
                    tid: 'table-countries',
                    tmpl: '<tr><td>${date}</td><td>${install_data}</td><td>${install_rate}%</td><td>${launch_data}</td><td>${launch_rate}%</td></tr>'
                }
            ]
        };
    },
    'payment_trend': function(){
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats:$('#tabpanel_items').tab('getTab'),
                        num_time_unit: UMENG.Agent.getDate().counts
                    },
                    callback:function(){
                        $('#chartcontainer').mileStones();
                    }
                }
            ],
            table: [
                {
                    tid:'game_payment_trend',
                    url:'/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl:'<tr><td>${date}</td><td>${payments}</td><td>${payers}</td><td>${paynumber}</td>{{if $("#signatureType").val()}}<td>${pirated_payers}</td><td>${pirated_paynumber}</td>{{/if}}</tr>',
                    params: {
                        per_page: $('.pagination').data('perPage') || 7,
                        stats:'payment_trend'
                    }
                }
            ]
        }
    },
    'payment_permeation': function(){
        return {
            chart: [
                {
                    cid:'chartcontainer',
                    url:'/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: 'permeation_general',
                        time_unit: UMENG.Agent.getTimeunitArray()[0]
                    },
                    chartParams: {
                        'yAxis': {
                            endOnTick: false,
                            labels: {
                                formatter: function() {
                                    return this.value +'%';
                                }
                            }
                        },
                        tooltip: {
                            formatter: function() {
                                return '' + this.key + getHoliday(this.key,this.series.userOptions) + ': ' + this.y + '%';
                            }
                        }
                    },
                    callback:function(){
                        $('#chartcontainer').mileStones();
                    }
                },
                {
                    cid:'chartcontainer_arpu',
                    url:'/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: 'permeation_arpu',
                        time_unit: UMENG.Agent.getTimeunitArray()[1]
                    },
                    callback:function(){
                        $('#chartcontainer_arpu').mileStones();
                    }
                },
                {
                    cid:'chartcontainer_arppu',
                    url:'/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: 'permeation_arppu',
                        time_unit: UMENG.Agent.getTimeunitArray()[2]
                    },
                    callback:function(){
                        $('#chartcontainer_arppu').mileStones();
                    }
                }
            ],
            table: [
                {
                    tid:'general',
                    url:'/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl:'<tr><td>${date}</td><td>${permeation}%</td></tr>',
                    params: {
                        per_page: $('.pagination').eq(0).data('perPage') || 7,
                        stats: 'permeation_general',
                        time_unit: UMENG.Agent.getTimeunitArray()[0]
                    }
                },
                {
                    tid:'tableArpu',
                    url:'/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl:'<tr><td>${date}</td><td>${arpu}</td></tr>',
                    params: {
                        per_page: $('.pagination').eq(1).data('perPage') || 7,
                        stats: 'permeation_arpu',
                        time_unit: UMENG.Agent.getTimeunitArray()[1]
                    }
                },
                {
                    tid:'tableArppu',
                    url:'/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl:'<tr><td>${date}</td><td>${arppu}</td></tr>',
                    params: {
                        per_page: $('.pagination').eq(2).data('perPage') || 7,
                        stats: 'permeation_arppu',
                        time_unit: UMENG.Agent.getTimeunitArray()[2]
                    }
                }
            ]
        }
    },
    'payment_conversion': function(){
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats:$('#tabpanel_items').tab('getTab')
                    },
                    chartParams: {
                        tooltip: {
                            formatter: function() {
                                return '' + this.key + getHoliday(this.key,this.series.userOptions) + ': ' + this.y + '%';
                            }
                        },
                        yAxis: {
                            labels: {
                              formatter: function() {
                                return this.value + '%';
                              }
                            }
                        }
                    },
                    callback: function(){
                        $('#chartcontainer').mileStones();
                    }
                },
                {
                    cid: 'chartcontainer_duration',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: 'conversion_durations'
                    },
                    chartParams: {
                        chart: {
                            type: 'column'
                        }
                    }
                },
                {
                    cid: 'chartcontainer_behavior',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: $('#tabpanel_items_behavior').tab('getTab')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                }
            ],
            table: [
                {
                    tid: 'conversionTable',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl:'<tr><td>${date}</td><td>${first_day_pay_rate}%</td><td>${first_day_pay_count}</td><td>${first_week_pay_rate}%</td><td>${first_week_pay_count}</td><td>${first_month_pay_rate}%</td><td>${first_month_pay_count}</td></tr>',
                    params: {
                        per_page: $('.pagination').eq(0).data('perPage') || 7,
                        stats: 'conversion_general'
                    }
                },
                {
                    tid:'durationTable',
                    url:'/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl:'<tr><td>${name}</td><td>${data}</td><td>${rate}%</td></tr>',
                    params: {
                        per_page: $('.pagination').eq(1).data('perPage') || 7,
                        stats:'conversion_durations'
                    }
                },
                {
                    tid:'behaviorTable',
                    url:'/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl:'<tr><td>${name}</td><td>${data}</td></tr>',
                    params: {
                        per_page: $('.pagination').eq(2).data('perPage') || 7,
                        stats:'conversion_paysource'
                    }
                }
            ]
        }
    },
    'custom_paysource': function(){
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: $('#tabpanel_items').tab('getTab'),
                        time_unit: $('.datepickerPanelArea .select_value').attr('timeunit')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                },
                {
                    cid: 'chartcontainerArea',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: $('#tabpanel_items_area').tab('getTab'),
                        time_unit: $('.datepickerPanelArea .select_value').attr('timeunit')
                    },
                    chartParams: {
                        chart: {
                            type: 'bar'
                        },
                        xAxis: {
                            labels: {
                                align: 'right'
                            }
                        },
                        plotOptions: {
                            series: {
                                pointWidth: 15
                            }
                        }
                    }
                }
            ],
            table: [
                {
                    tid: 'paysourceTable',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl: '<tr><td>${name}</td><td>${sum}</td><td>${count}</td></tr>',
                    params: {
                        per_page: $('.pagination').eq(0).data('perPage') || 7,
                        stats:'custom_paysource',
                        time_unit: $('.datepickerPanelArea .select_value').attr('timeunit')
                    }
                },
                {
                    tid: 'areaTable',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl: '<tr><td>${province}</td><td>${pay_sum}</td><td>${pay_count}</td><td>${arpu}</td><td>${arppu}</td></tr>',
                    params: {
                        per_page: $('.pagination').eq(1).data('perPage') || 7,
                        stats:'custom_province',
                        time_unit: $('.datepickerPanelArea .select_value').attr('timeunit')
                    }
                }
            ]
        }
    },
    'payment_distance': function(){
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: 'distance_distance',
                        time_unit: $('.datepickerPanelArea .select_value').attr('timeunit')
                    },
                    chartParams: {
                        chart: {
                            type: 'column'
                        }
                    }
                }
            ],
            table: [
                {
                    tid: 'distanceTable',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl: '<tr><td>${name}</td><td>${count}</td><td>${rate}%</td></tr>',
                    params: {
                        per_page: $('.pagination').data('perPage') || 7,
                        stats:'distance_distance',
                        time_unit: $('.datepickerPanelArea .select_value').attr('timeunit')
                    }
                }
            ]
        }
    },
    'gamerlevel_all': function(){
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: 'gamerlevel_all',
                        time_unit: $('#timeUnit').val()
                    },
                    chartParams: {
                        tooltip: {
                            formatter: function(){
                                return this.key + '级: ' + this.y + '人';
                            }
                        }
                    }
                }
            ],
            table: [
                {
                    tid: 'detailTable',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl: '<tr><td>${level_id}</td><td>${level_name}</td><td>${count}</td><td>${rate}%</td></tr>',
                    params: {
                        per_page: $('.pagination').data('perPage') || 30,
                        stats:'gamerlevel_all',
                        time_unit: $('#timeUnit').val()
                    }
                }
            ]
        }
    },
    'gamerlevel_lost': function(){
        return {
            chart: [
                {
                    cid: 'chartcontainer',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_chart_data',
                    params: {
                        stats: UMENG.ACTIONSTATS
                    },
                    chartParams: {
                        tooltip: {
                            formatter: function(){
                                return this.key + ': ' + this.y + '人';
                            }
                        }
                    }
                }
            ],
            table: [
                {
                    tid: 'detailTable',
                    url: '/apps/'+UMENG.APPKEY+'/game_reports/load_table_data',
                    tmpl: '<tr><td>${level_id}</td><td>${level_name}</td><td>${count}</td><td>${rate}%</td></tr>',
                    params: {
                        per_page: $('.pagination').data('perPage') || 30,
                        stats:'gamerlevel_lost'
                    }
                }
            ]
        }
    }
};

function chartInit(e, chart, newParams, newChartParams, newCallback){
    try{
        var _page = pageList[UMENG.PAGELIST]();
        var cht = _page.chart;

        //render specified chart
        if(chart != undefined && chart.length > 0){
            var flag = true;
            // init chart with cid and pagelist[cid] params
            for(i in cht){
                if(cht[i].cid == chart){
                    flag = false;
                    //console.log(cht[i].app_version)
                    var params = $.extend({},cht[i].params,newParams);
                    var chartParams = $.extend({}, cht[i].chartParams, newChartParams);
                    var callback = newCallback || cht[i].callback || '';
                    $('#'+chart).renderChart({
                        url: cht[i].url || '/apps/'+ UMENG.APPKEY +'/reports/load_chart_data',
                        params:UMENG.Agent.buildParams(params),
                        chartParams: chartParams,
                        callback: callback,
                        dataCallback: cht[i].dataCallback || ''
                    });
                }
            }
            // init chart with cid not in pagelist, newParams is all params
            if(flag){
                $('#'+chart).renderChart({
                    url: newParams.url || '/apps/'+ UMENG.APPKEY +'/reports/load_chart_data',
                    params:UMENG.Agent.buildParams(newParams.params),
                    chartParams: newParams.chartParams
                });
            }
            // render all page chart
        }else{
            $.each(cht,function(index,chart){
                var params = $.extend({},chart.params,newParams);
                $('#'+chart.cid).renderChart({
                    url: chart.url || '/apps/'+ UMENG.APPKEY +'/reports/load_chart_data',
                    params:UMENG.Agent.buildParams(params),
                    chartParams: chart.chartParams,
                    callback:chart.callback || function(){},
                    dataCallback: chart.dataCallback || function(){}
                });
            });
        }
    }catch(e){console.log(e)}
};
$.subscribe('rChart',chartInit);

function tableInit(e, opt, tid) {
    //opt: renderTable params ,include url, params, tmpl, per_page...
    try{
        if(tid != '' && tid != undefined) {
            var flag = true;
            for (i in table) {
                if(table[i].tid == tid) {
                    flag = false;
                    $('#' + tid).renderTable($.extend(true, {}, table[i], {params:UMENG.Agent.buildParams()}, opt));
                }
            }
            if(flag){
                $('#' + tid).renderTable($.extend(true, {}, {params:UMENG.Agent.buildParams()}, opt));
            }
        }else{
            var _page = pageList[UMENG.PAGELIST](),
                table = _page.table;
            for(i in table){
                var p = $.extend(true, {}, {params:UMENG.Agent.buildParams()},table[i], opt); //table params
                $('#'+table[i].tid).renderTable(p);
            }
        }
    }catch(e){}
};
$.subscribe('rTable',tableInit);

function pageInit(){
    $.publish('rChart');
    $.publish('rTable');

    // publish func list
    try{
        var _page = pageList[UMENG.PAGELIST]();
        if(_page.subscribeFunc){
            $.each(_page.subscribeFunc,function(i,func){
                if(func['params'].length > 0){
                    $.publish(func.funcName,func.params);
                }else{
                    $.publish(func.funcName);
                }
            });
        }
    }catch(e){}

};
$.subscribe('rPage', pageInit);

    //if cache date, reload timeUnit

    $.publish('timeUnitSelection');
});
