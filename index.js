'use strict';

var container;

jQuery(function () {
  container = jQuery('#results-table');
  if (window.parent !== window) {
    runAsChild();
  }

});

function runAsChild () {
  var chan;

  chan = Channel.build({
    window: window.parent,
    origin: "*",
    scope: "CurrentStep"
  });

  chan.bind('configure', function (trans, params) {
    merge(intermine.options, params);
    return 'ok';
  });

  chan.bind("init", function(trans, params) {
    var events, props, widget, url;

    url = (params.url || (params.service && params.service.root));
    events = {
      'list-creation:success': reportList.bind(null, chan),
      'list-update:success': reportList.bind(null, chan),
      'imo:click': reportObjectFocus.bind(null, chan, {root: url}),
      'object:view': reportObjectView.bind(null, chan)
    };
    props = merge({pageSize: 25}, (params.prop || {}));
    console.log(props);
    widget = container.imWidget({
      type: 'table',
      url: url,
      token: (params.token || (params.service && params.service.token)),
      query: params.query,
      properties: props,
      events: events
    });
    // Only need to listen to forward history events - the
    // hosting app can be in control of backwards ones.
    widget.states.on('add', function () {
      if (widget.states.length > 1) {
        // Read the last model.
        stateAdded(chan, widget.states.last().toJSON());
      }
      reportQuery(chan, widget.states.last().toJSON());
    });

    return 'ok';
  });

  // Activate all formatters.
  enableAll(intermine.results.formatsets.genomic);

}

function reportObjectFocus (channel, service, type, id) {
  channel.notify({
    method: 'has',
    params: {
      what: 'item',
      data: {
        item: { type: type, id: id },
        service: service
      }
    }
  });
}

function reportObjectView (channel, event) {
  event.preventDefault();
  var object = event.object.toJSON();
  channel.notify({
    method: 'wants',
    params: {
      what: 'report',
      for: 'item',
      data: {
        item: { type: object['obj:type'], id: object.id},
        service: { root: object['service:base'] }
      }
    }
  });
}

function stateAdded (channel, state) {
  if (state && state.query) {
    console.log("New step added");
    channel.notify({
      method: 'change-state',
      params: {
        title: state.title,
        data: {
          service: { root: state.query.service.root },
          query: state.query.toJSON() // Must be serializable.
        }
      }
    });
  }
}

function reportQuery (channel, state) {
  channel.notify({
    method: 'has',
    params: {
      what: 'query',
      data: {
        service: {root: state.query.service.root},
        query: state.query.toJSON()
      }
    }
  });
}

function reportList (channel, list) {
  channel.notify({ // TODO: Should change to wants report for list.
    method: 'next-step',
    params: {
      title: 'Created list ' + list.name,
      tool: 'show-list',
      data: {
        listName: list.name,
        service: { root: list.service.root }
      }
    }
  });
}

function enableAll(obj) {
  var key;
  for (key in obj) {
    obj[key] = true;
  }
}

function merge(x, y) {
  var key, value;
  if (!y) return;
  for (key in y) {
    value = y[key];
    if (_.isArray(value) || !_.isObject(value) || !x[key]) {
      x[key] = value;
    } else {
      merge(x[key], value);
    }
  }
  return x;
}

function showDemo () {
  return container.imWidget({
    type: 'table',
    url: "http://www.flymine.org/query",
    query: {
      select: ['*'],
      from: 'Organism'
    }
  });
}

