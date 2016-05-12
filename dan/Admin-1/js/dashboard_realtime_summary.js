/**
 * Realtime summary Vue.js version
 * Author: wangfang@umeng.com
 * Date: 2014.10
 *
 * ViewModel: 页面 (app)
 *            基本指标 (baseIndicesTab)
 *            自定义指标 (customIndicesTab)
 *            编辑自定义指标对话框 (editIndicesDialog)
 */


/**
 * Filter
 */


Vue.filter('omission', function(value, length) {
  return (stringLength(value) <= length) ? value : value.slice(0, length) + '...';
});


/**
 * ViewModel
 */


var baseIndicesTab = new Vue({

  el: "#base-indices",

  data: {
    baseIndices: {
      install: { amount: "-", growth: "-", fluctuation: "-" },
      launches: { amount: "-", growth: "-", fluctuation: "-" },
      sumactive: { amount: "-", growth: "-", fluctuation: "-" },
      uniqactive: { amount: "-", growth: "-", fluctuation: "-" }
    },
    activeItem: 'install'
  },

  created: function() {
    this.fetchData();

    this.$watch('activeItem', function(value) {
      this.renderChart(value);
    }, false, true);

  },

  methods: {

    // 获取基本指标数据
    fetchData: function() {
      var _ = this;

      $.ajax({
        url: '/apps/' + UMENG.APPKEY + '/reports/load_table_data',
        data: { stats: 'dashboard_general' },
      }).done(function(res) {
        if (res.result === "success") {
          $.extend(_.$data.baseIndices, res.stats);
          _.setNumberFontSize();
        }
      });
    },

    renderChart: function(stats) {
      $('#base_chartcontainer').renderChart({
        params: {
          stats: 'index_hours_' + stats,
          time_unit:'hourly',
          is_compared: false
        }
      });
    },

    onClick: function(id) {
      this.$data.activeItem = id;

      // Clear CompareChart cache
      UMENG.Storage.compareChart['base_chartcontainer'] = [];
    },

    setNumberFontSize: function() {
      var count = ('' + this.$data.baseIndices.install.amount).split('').length,
          size = '32px';

      if (count <= 10) {
        size = '32px';
      } else if ((count > 10) && (count <= 12)) {
        size = '28px';
      } else if ((count > 12) && (count <= 14)) {
        size = '24px';
      } else if ((count > 14) && (count < 18)) {
        size = '20px';
      } else {
        size = '16px';
      }

      $('.digest-block h1', '#base-indices').css('font-size', size);
    }
  }

});


var customIndicesTab = new Vue({

  el: "#custom-indices",

  data: {
    indices: [],
    activeIndex: 0
  },

  computed: {
    activeIndexID: function() {
      var index = this.$data.indices[this.$data.activeIndex];
      if (typeof index !== 'undefined') return index.index_id;
    },

    blockWidth: function() {
      var count = this.$data.indices.length;
      if (count <= 3) {
        return '25%';
      } else {
        return 100 / (count == 6 ? count : (count + 1)) + '%';
      }
    }
  },

  ready: function() {
    this.fetchData();
  },

  methods: {
    fetchData: function() {
      var _ = this;

      $.ajax({
        url: '/apps/'+ UMENG.APPKEY + '/reports/load_table_data',
        data: { stats: 'dashboard_custom' }
      }).done(function(res) {
        if (res.result === 'success') {
          _.$data.indices = res.stats;
          _.setNumberFontSize();

          if (_.$data.indices.length > 0) {
            _.renderChart(_.$data.indices[0].index_id);
          }
        };
      });
    },

    toggleTip: function(event) {
      $(event.target).prev().toggle();
    },

    renderChart: function(customIndexId) {
      $('#custom_chartcontainer').renderChart({
        params: {
          stats: 'custom_quarter',
          custom_index_id: customIndexId,
          time_unit:'hourly',
          is_compared: false
        },
        chartParams: {
          tooltip: {
            formatter: function() {
              var times = ["00:15","00:30","00:45","01:00","01:15","01:30","01:45","02:00","02:15","02:30","02:45","03:00","03:15","03:30","03:45","04:00","04:15","04:30","04:45","05:00","05:15","05:30","05:45","06:00","06:15","06:30","06:45","07:00","07:15","07:30","07:45","08:00","08:15","08:30","08:45","09:00","09:15","09:30","09:45","10:00","10:15","10:30","10:45","11:00","11:15","11:30","11:45","12:00","12:15","12:30","12:45","13:00","13:15","13:30","13:45","14:00","14:15","14:30","14:45","15:00","15:15","15:30","15:45","16:00","16:15","16:30","16:45","17:00","17:15","17:30","17:45","18:00","18:15","18:30","18:45","19:00","19:15","19:30","19:45","20:00","20:15","20:30","20:45","21:00","21:15","21:30","21:45","22:00","22:15","22:30","22:45","23:00","23:15","23:30","23:45","00:00"],
                  nextTime = times[times.indexOf(this.key) + 1] || "00:15";
              return this.key + '~' + nextTime + ': ' + this.y;
            }
          },
          yAxis: { min: null }
        }
      });
    },

    setNumberFontSize: function() {
      var count = ('' + Math.max.apply(null, this.$data.indices.map(function(d) { return d.amount; }))).split('').length,
          size = '32px';

      if (count <= 10) {
        size = '32px';
      } else if ((count > 10) && (count <= 12)) {
        size = '28px';
      } else if ((count > 12) && (count <= 14)) {
        size = '24px';
      } else if ((count > 14) && (count < 18)) {
        size = '20px';
      } else {
        size = '16px';
      }

      $('.digest-block h1', '#custom-indices').css('font-size', size);
    },

    onClick: function(i) {
      this.$data.activeIndex = i;
      this.renderChart(this.$data.indices[i].index_id);
    },

    openCustomIndicesDialog: function() {
      app.openCustomIndicesDialog();
    }
  }

});


var editIndicesDialog = new Vue({

  el: "#edit-indices-dialog",

  data: {
    events: [],
    showingPopup: false,
    popupEvent: {}
  },

  computed: {
    selectedIndices: function() {
      // 从自定义指标Tab控件获取当前自定义指标
      return customIndicesTab.indices;
    }
  },

  methods: {

    //  获取自定义事件列表
    fetchEvents: function() {
      var _ = this;

      $.ajax({
        url: ' /apps/' + UMENG.APPKEY + '/events/load_numeric_event_groups'
      }).done(function(res) {
        if (res.result === "success") {
          _.$data.events = res.datas;
          _.setEventsIsUsed();
        }
      });
    },

    // 点击自定义指标名称
    editIndexName: function(index, e) {
      e.stopPropagation();

      if (index.isEditing) return false;

      index.isEditing = true;
      index.oldName = index.index_name;

      e.target.style.display = "none";
      e.target.nextSibling.nextSibling.style.display = "block";
      e.target.nextSibling.nextSibling.select();
    },

    // 保存自定义指标名称
    saveIndexName: function(index, e) {
      e.target.style.display = "none";
      e.target.previousSibling.previousSibling.style.display = "block";

      if (!index.isEditing) return false;

      index.isEditing = false;

      // 若新名称为空 或 未改变
      if (index.index_name.length < 1 || index.oldName === index.index_name) {
        index.index_name = index.oldName;
        return false;
      }

      $.ajax({
        url: '/apps/' + UMENG.APPKEY + '/custom_indices/' + index.index_id,
        type: 'PUT',
        data: { name: index.index_name.replace(/</g, '').replace(/>/g, '').replace(/\//g, '') },
      }).done(function(res) {
        if (res.result === 'fail') alert(res.data);
      });

    },

    // 删除自定义指标
    deleteIndex: function(index, e) {
      var _ = this;
      e.stopPropagation();

      confirm_msg(I18n.t('page_misc.realtime_summary.delete_indices'), I18n.t('page_misc.realtime_summary.confirm_delete_index') + index.index_name + "？", function() {

        $.ajax({
          url:'/apps/' + UMENG.APPKEY + '/custom_indices/' + index.index_id,
          type:'DELETE',
        }).done(function(res) {
          if (res.result == 'success') {
            customIndicesTab.indices = customIndicesTab.indices.filter(function(d) { return d.index_id !== index.index_id; });
            _.setEventsIsUsed();
          }
        });
      });
    },

    // 点击自定义事件，展开弹出层
    showEventPopup: function(clickedEvent) {
      var _ = this;

      if (_.$data.showingPopup = !_.$data.showingPopup) {
        _.$data.popupEvent = clickedEvent;

        // reset types
        _.$data.popupEvent.num_sum = _.$data.popupEvent.num_launch = _.$data.popupEvent.num_avg_per_launch = false;

        _.selectedIndices
          .filter(function(d) {
            return d.event_group_id === clickedEvent.id;
          })
          .map(function(d) {
            if (d.num_type) { _.$data.popupEvent[d.num_type] = true; }
          });
      }
    },

    // 创建自定义指标
    createIndex: function(type) {
      var _ = this,
          typeMapping = {
            num_launch: I18n.t('page_misc.realtime_summary.event_counts'),
            num_sum: I18n.t('page_misc.realtime_summary.numeric_sum'),
            num_avg_per_launch: I18n.t('page_misc.realtime_summary.numeric_avg_per_launch')
          };

      if (_.selectedIndices.length >= 6) {
        alert(I18n.t('page_misc.realtime_summary.max_info').replace('${max}', 6));
        return false;
      }

      if (_.$data.popupEvent[type]) return false;

      _.$data.popupEvent[type] = true;

      var data = {
        name: _.$data.popupEvent.name + '_' + typeMapping[type],
        event_group_id: _.$data.popupEvent.id,
        num_type: type
      };

      $.ajax({
        url: '/apps/' + UMENG.APPKEY + '/custom_indices',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
      }).done(function(res) {
        if (res.result === "success") {
          customIndicesTab.indices.push({
            event_group_id: data.event_group_id,
            event_group_name: _.$data.popupEvent.name,
            num_type: data.num_type,
            num_type_name: typeMapping[type],
            index_name: data.name,
            index_id: res.data,
            amount: '-'
          });
          _.setEventsIsUsed();
        }
      });

    },

    // 设置事件是否已添加 自定义指标 标志
    setEventsIsUsed: function() {
      var _ = this;

      var customIndicesId = _.selectedIndices.map(function(d) { return d.event_group_id; });

      _.$data.events.forEach(function(e, i) {
        // 若存在于自定义事件ID列表，则标志位设为 ture
        e.used = (customIndicesId.indexOf(e.id) !== - 1);
      });
    },

    closeDialog: function() {
      $("#edit-indices-dialog").dialog('close');
    }
  }

});


/**
 * Page
 */

window.app = new Vue({

  el: ".report",

  data: {},

  computed: {
    customIndices: function() {
      return customIndicesTab.indices;
    }
  },

  methods: {
    openCustomIndicesDialog: function() {
      $("#edit-indices-dialog").dialog({title: I18n.t('page_misc.realtime_summary.edit_indexes') + '（' + I18n.t('page_misc.realtime_summary.max_custom_indices') +'）', width:'540px'});
      editIndicesDialog.fetchEvents();
    },

    exportBasicReport: function(e) {
      // _gaq.push(['_trackEvent', '导出报表', '实时统计', '基本指标']);

      $(e.target)._export(e, {
        'stats': 'index_hours_' + baseIndicesTab.activeItem + '_csv',
        'url': '/apps/' + UMENG.APPKEY + '/reports/load_chart_data',
        contrast: UMENG.Storage.compareChart.base_chartcontainer ? UMENG.Storage.compareChart.base_chartcontainer.map(function(d) { return d[0] }) : []
      });
    },

    exportCustomReport: function(e) {
      // _gaq.push(['_trackEvent', '导出报表', '实时统计', '自定义指标']);

      $(e.target)._export(e, {
        'stats': 'custom_quarter_csv',
        'url': '/apps/' + UMENG.APPKEY + '/reports/load_chart_data',
        'custom_index_id': customIndicesTab.activeIndexID,
        'contrast': UMENG.Storage.compareChart.custom_chartcontainer ? UMENG.Storage.compareChart.custom_chartcontainer.map(function(d) { return d[0] }) : []
      });
    }
  }
});


/**
 * Legacy codes
 */


$(document).ready(function() {

  $('#base_constr_date').click(contrastPeriodHandler('base'));
  $('#custom_constr_date').click(contrastPeriodHandler('custom'));

  $('#base_constr_date_popform, #custom_constr_date_popform').on('click', function(e) {
    e.stopPropagation();
  });

  function contrastPeriodHandler(type) {
    return function() {
      var panel =  $('#' + type + '_constr_date_popform');

      panel
        .show()
        .find('.mod-body').datepicker({
          yearRange: '2000:' + window.thisYear,
          maxDate : +0,
          onSelect: function(date) {
            var params = {
              base: {
                stats: 'index_hours_' + baseIndicesTab.activeItem,
                time_unit:'hourly'
              },
              custom: {
                stats: 'custom_quarter',
                custom_index_id: customIndicesTab.activeIndexID,
                time_unit:'hourly'
              }
            };

            if (type + '_chartcontainer' in UMENG.Storage.compareChart) {
              UMENG.Storage.compareChart[type + '_chartcontainer'].push([date, date]);
            } else {
              UMENG.Storage.compareChart[type + '_chartcontainer'] = [];
              UMENG.Storage.compareChart[type + '_chartcontainer'].push([date, date]);
            }

            $('#' + type + '_chartcontainer').renderChart('renderCompareChart', {
              params: params[type]
            });

            panel.hide();
          }
        });

      return false;
    }
  }

  var $tipAdv = $('#tips-adv'),
      todayDate = new Date().getDate();

  switch (+localStorage.getItem('todayData_' + UMENG.APPKEY)) {
    case -999:
      $tipAdv.hide();
      break;
    case todayDate:
      $tipAdv.show();
      localStorage.removeItem('todayData_' + UMENG.APPKEY);
      break;
    default:
      $tipAdv.show();
      break;
  }

  $('.close, .ignore', "#tips-adv").on('click', function() {
    var isClose = $(this).hasClass('close');
    $tipAdv.hide();
    localStorage.setItem('todayData_' + UMENG.APPKEY, isClose ? todayDate : -999);
  });

  if ( (I18n.locale === 'zh') && !+localStorage.getItem('newSummaryGuides') ) {
    $('#base-indices').guideTip({
      corner: 'bottom',
      left: '200px',
      top: '-54px',
      text: '该指标当日值及相对于昨日同时刻的变化率。点击指标后展示该指标的趋势。', // I18n.t('page_misc.app_list.tips_use_group'),
      close: function() { localStorage.setItem('newSummaryGuides', 1); }
    });

    $('.custom-index-title').guideTip({
      corner: 'left',
      left: '110px',
      text: '自定义查看<a href="http://dev.umeng.com/analytics/functions/numekv" target="_blank">计算事件</a>消息数、累计值或单次均值。',
      close: function() { localStorage.setItem('newSummaryGuides', 1); }
    });
  }

});


/**
 * Helper
 */


// Get real string length
function stringLength(str) {

  var realLength = 0, charCode = -1;

  for (var i = 0; i < str.length; i++) {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) realLength += 1;
    else realLength += 2;
  }

  return realLength;
};
