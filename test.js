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

chan.bind('has', function (trans, params) {
  if (params.what === 'query') {
    document.getElementById('stdout').innerHTML = JSON.stringify(params.data.query, 2);
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
