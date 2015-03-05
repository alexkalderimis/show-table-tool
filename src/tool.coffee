Channel = require 'jschannel'
imtables = require 'imtables'
QueryManagement = require 'imtables/build/views/query-management-tools'


runAsChild = ->

  chan = Channel.build
    window: window.parent
    origin: '*'
    scope: 'CurrentStep'

  stateAdded = (state, service) ->
    console.debug state
    chan.notify
      method: 'change-state'
      params:
        title: state.title
        data:
          service: {root: service.root}
          query: state.query

  chan.bind 'configure', (trans, params) ->
    imtables.configure params
    'ok'

  chan.bind 'style', (trans, params) ->
    link = document.createElement 'link'
    link.rel = 'stylesheet'
    link.href = params.stylesheet
    document.querySelector('head').appendChild(link)

  chan.bind 'init', (trans, params) ->
    trans.delayReturn true
    url = params.url ? params.service?.root
    service = root: url, token: (params.token ? params.service?.token)
    query = params.query

    withTable = (table) ->
      table.$el.on 'view.im.object', (evt) ->
        evt.preventDefault()
        console.log evt

        obj = evt.object
        chan.notify
          method: 'has'
          params:
            what: 'item'
            data: evt.object
            service:
              root: table.history.getCurrentQuery().service.root

      table.history.on 'add', ->
        currentState = table.history.last()
        if table.history.length > 1
          stateAdded currentState.toJSON(), currentState.get('query').service

      table.history.on 'changed:current', ->
        current = table.history.getCurrentQuery()
        chan.notify
          method: 'has'
          params:
            what: 'query'
            service: {root: current.service.root}
            data: current.toJSON()

      table.bus.on 'list-action:success', (action, list) ->
        console.log action, list
        message = if action is 'create'
          {
            method: 'next-step'
            params:
              title: 'Created list ' + list.name
              tool: 'show-list'
              data:
                listName: list.name
                service: {root: list.service.root}
          }
        else
          {
            method: 'changed-list'
            params:
              title: 'Updated list ' + list.name
              data:
                listName: list.name
                service: {root: list.service.root}
          }
        chan.notify message

      trans.complete 'table loaded'

    onError = (error) ->
      console.error 'onError', error
      trans.error error

    loadTable({size: 25}, {service, query}).then withTable, onError
    return false

showDemo = ->
  service = root: "http://www.flymine.org/query"
  query =
    select: ['*'],
    from: 'Organism'

  withTable = (table) -> console.log 'Loaded table'
  onError = console.error.bind console

  loadTable({size: 10}, {service, query}).then withTable, onError

loadTable = (options, queryDef) ->
  imtables.loadDash('#results-table', options, queryDef)

window.onload = ->
  if window is window.parent
    showDemo().then console.log.bind(console), console.error.bind(console)
  else
    runAsChild()

