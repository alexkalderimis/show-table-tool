Channel = require 'jschannel'

window.onload = ->
  chan = Channel.build
    window: document.getElementById('child').contentWindow
    origin: '*'
    scope: 'CurrentStep'

  chan.call
    method: 'configure'
    params:
      TableCell:
        IndicateOffHostLinks: false
    success: ->
      console.log 'Configured'

  # Bind to the events that this tool emits
  chan.bind 'change-state', (trans, data) ->
    console.log 'CHANGED STATE', data

  chan.bind 'has-list', (trans, data) ->
    console.log 'HAS LIST', data

  chan.bind 'next-step', (trans, data) ->
    console.log 'NEXT STEP', data

  chan.bind 'changed-list', (trans, data) ->
    console.log 'CHANGED LIST', data

  chan.bind 'has', (trans, params) ->
    console.log 'HAS', params.what, params.data
    if params.what is 'item'
      obj = params.data
      alert "Chose #{ obj.classes.join(', ') } #{ obj.id }"
    else if params.what is 'query'
      query = JSON.stringify(params.data, null, 2)
      document.getElementById('stdout').innerHTML = query

  withSession = (req, e) ->
    console.log req.response.token

    chan.call
      method: "init",
      params:
        url: "http://www.flymine.org/query",
        token: req.response.token,
        query:
          select: ['*'],
          from: 'Gene',
          where:
            'organism.taxonId': 7227
      success: -> console.log("Table initialised")
      error: (e) -> console.error "Could not initialise table", e

  sessionRequest = new XMLHttpRequest()
  sessionRequest.onload = withSession.bind(null, sessionRequest)
  sessionRequest.open('GET', "http://www.flymine.org/query/service/session", true)
  sessionRequest.responseType = 'json'
  sessionRequest.send()

