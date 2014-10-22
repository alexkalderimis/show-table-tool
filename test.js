var chan = Channel.build({
  window: document.getElementById("child").contentWindow,
  origin: "*",
  scope: "CurrentStep"
});

chan.call({
  method: 'configure',
  params: {
    IndicateOffHostLinks: false
  },
  success: function () {
    console.log("Configured");
  }
});

chan.bind('has-list', function (trans, data) {
  console.log('has-list', data);
});

chan.bind('silent-step', function (trans, data) {
  console.log("Shhhh", data.title, data);
});

chan.bind('wants', function (trans, params) {
  var d = params.data;
  if (params.what === 'report') {
    document.getElementById('objview').innerHTML = 'WANTS ' + d.service.root + '/' + d.item.type + '#' + d.item.id;
  }
});
chan.bind('has', function (trans, params) {
  var d = params.data;
  if (params.what === 'query') {
    document.getElementById('stdout').innerHTML = JSON.stringify(d.query, 2);
  } else if (params.what === 'item') {
    document.getElementById('objview').innerHTML = 'HAS ' + d.service + '/' + d.item.type + '#' + d.item.id;
  }
});

var sessionRequest = new XMLHttpRequest();
sessionRequest.onload = withSession.bind(null, sessionRequest);
sessionRequest.open('GET', "http://www.flymine.org/query/service/session", true);
sessionRequest.responseType = 'json';
sessionRequest.send();

function withSession (req, e) {
  console.log(req.response);

  chan.call({
    method: "init",
    params: {
      url: "http://www.flymine.org/query",
      token: req.response.token,
      query: {
        select: ['*'],
        from: 'Gene',
        where: {
          'organism.taxonId': 7227
        }
      }
    },
    success: function() {
      console.log("Table initialised");
    }
  });
}
