watchify = require 'watchify'
bundler = require '../bundler.coffee'
bundle = require '../bundle.coffee'

module.exports = ->
  w = watchify bundler()
  w.on 'update', -> bundle w
  bundle w

