;$(document).ready(function() {
  //nav-item
 
  // init date filter
  if ($('#date-select')) {
    $('#date-select').ProSelect({
      callback: function(arr, n) {
        if (UMENG.MileStoneChart) {
          $('#'+UMENG.MileStoneChart).mileStones('reset');
        }

        if (UMENG.plugin.userCustomDate.localCache) {
          UMENG.plugin.userCustomDate.setDate(arr, 'localCacheDate');
        }

        //constrain time_unit component
        $.publish("timeUnitSelection");
        $.publish('/' + UMENG.ACTIONSTATS);
        $.publish('rPage');

        try {
          $('.back').trigger('click');
        } catch(e) {}

        // hack game report
        if (typeof window.global.renderPage == 'function') {
          $.publish("timeUnit", n);
          window.global.renderPage();
        }
      }
    });
  }

  // init version filter
  $('#filter-version').Filter({
    url: '/apps/' + global.appid + '/load_versions',
    panelid: 'filt-version',
    text: I18n.t('components.filters.version'),
    templDefault: '{{if is_shown}}<li><input type="checkbox" id="${name}" {{if check}}checked=${check}{{/if}}/>${name}</li>{{/if}}',
    templSearch: '<li><input type="checkbox" id="${name}" {{if check}}checked=${check}{{/if}}/>${name}</li></li>',
    templchecked:  '{{if check}}<li><input type="checkbox" id="${name}" checked="${check}"/>${name}</li>{{/if}}',
    callback: function(inst, data) {
      //add for events show filter bug
      if (data.check) {
        global.filter.version = data.id;
      } else {
        global.filter.version = '';
      }

      if ($('#' + UMENG.MileStoneChart).length > 0) {
        $('#' + UMENG.MileStoneChart).mileStones('reset');
      }
      $.publish("timeUnitSelection");
      $.publish('rPage');
      $.publish('/' + UMENG.ACTIONSTATS);

      try {
          $('.back').trigger('click');
          if($('#'+UMENG.MileStoneChart).length > 0){
              $('#'+UMENG.MileStoneChart).mileStones('reset');
          }
      } catch(e) {console.log(e)}
      try {
          window.global.renderPage();
      }catch(e){console.log(e)};
    }
  });

  // init channel filter
  $('#filter-channel').Filter({
    panelid: 'filt-chan',
    url: '/apps/' + global.appid + '/load_channels',
    text: I18n.t('components.filters.channel'),
    callback: function(inst, data) {
      if($('#' + UMENG.MileStoneChart).length > 0) {
        $('#' + UMENG.MileStoneChart).mileStones('reset');
      }

      $.publish("timeUnitSelection");
      $.publish('rPage');
      $.publish('/' + UMENG.ACTIONSTATS);

      try {
        $('.back').trigger('click');
        $('#' + UMENG.MileStoneChart).mileStones('reset');
      } catch(e) {
        console.log(e)
      };

      try {
        window.global.renderPage();
      } catch(e) {
        console.log(e)
      };
    }
  });

  // init segment filter
  $('#filter-segment').Filter({
    panelid : 'filt-segment',
    url : '/apps/'+global.appid+'/load_segments',
    text : I18n.t('components.filters.segment'),
    panelTempl : '<div class="filterpanel" style="display:none;"><input type="text" class="input" placeholder="'+I18n.t('components.filters.segment_search')+'"/><ul class="filterlist"></ul><div class="load" style="margin:10px auto;text-align:center;display:block;"><img src="/images/pic/ajax-loader.gif"/></div><div class="new-segment"><a href="/apps/'+ global.appid +'/segmentations/new" target="_blank">'+I18n.t('components.filters.segment_new')+'</a></div><div class="submitpanel"><a href="#" class="submit">'+I18n.t('components.buttons.confirm')+'</a></div></div>',
    callback : function(inst,data){
        if($('#'+UMENG.MileStoneChart).length > 0){
            $('#'+UMENG.MileStoneChart).mileStones('reset');
        }
        $.publish("timeUnitSelection");
        $.publish('rPage');
        $.publish('/'+ UMENG.ACTIONSTATS);
        try {
            $('#'+UMENG.MileStoneChart).mileStones('reset');
        }catch(e) {console.log(e)};
        try {
            window.global.renderPage();
        } catch(e) {console.log(e)};
    }
  });

  // init constrast times
  $('#constr-date').Contrast({
    callback: function() {
      $('#chartcontainer').renderChart('renderCompareChart');
    }
  });

  // init game constrast times
  $('#game-constr-date').Contrast({
    callback: function() {
      $('#chartcontainer').renderChart('renderCompareChart', { url: '/apps/' + UMENG.APPKEY + '/game_reports/load_chart_data' });
    }
  });

  // init version down-selector
  $('#version-select').DownList({
    is_ajax: true,
    search: 'on',
    url: '/apps/' + global.appid + '/load_versions?show_all=true',
    temp: '<li><a class="event" href="?version=${encodeID}" data-id="${id}" title="${name}">${name}</a></li>',
    searchTemp: '<li><a class="event" data-id="${id}" title="${name}" href="?version=${encodeID}">${name}</a></li>',
    callback: function(elem) {
      global.filter.version = $(elem).data('id');
    }
  });

  //timeUnitSelection
  function timeUnitSelection(e, counts) {
    var n = counts || UMENG.Agent.getDate().counts;
    var f = UMENG.Agent.getFilters(),
        filters = false;

    for (key in f) {
      if (f[key][0].length > 0) {
        filters = true;
      }
    }

    if (filters) {
      try{
        if (n == 1) {
          $.publish('timeunit.disable', [['hourly','weekly','monthly'], function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        } else if (1 < n && n <= 7) {
          $.publish('timeunit.disable', [['hourly','weekly','monthly'], function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        } else if (n > 7 && n <= 30){
          $.publish('timeunit.disable', [['hourly','hourly','monthly'], function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        } else if (n > 30 && n <= 365){
          $.publish('timeunit.disable', [['hourly'], function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        } else if (n > 365){
          $.publish('timeunit.disable', [['hourly'], function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        }
      } catch(e) {}
    } else {
      try {
        if (n == 1) {
          $.publish('timeunit.disable', [['weekly','monthly']]);
          $.publish('timeunit.on', ['daily', function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        } else if (1 < n && n <= 7) {
          $.publish('timeunit.disable', [['weekly','monthly']]);
          $.publish('timeunit.on', ['daily', function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        } else if (n > 7 && n <= 30) {
          $.publish('timeunit.disable', [['hourly','monthly']]);
          $.publish('timeunit.on', ['daily', function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        } else if (n > 30 && n <= 365) {
          $.publish('timeunit.disable', [['hourly']]);
          $.publish('timeunit.on', ['weekly', function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        } else if (n > 365) {
          $.publish('timeunit.disable', [['hourly']]);
          $.publish('timeunit.on', ['monthly', function() { $.publish('/' + UMENG.ACTIONSTATS); }]);
        }
      } catch(e) {}
    }
  };

  // black list
  if (UMENG.actionStats !== 'event_details') {

    $.subscribe('timeUnitSelection',timeUnitSelection);
    // if cache date, reload timeUnit
    $.publish('timeUnitSelection');
  }

});
