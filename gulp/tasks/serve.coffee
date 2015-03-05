express = require 'express'

module.exports = ->
  PORT = (process.env.PORT ? 5000)
  app = express().use express.static 'app'
                 .listen PORT

  console.log "Server started on #{ PORT }"

