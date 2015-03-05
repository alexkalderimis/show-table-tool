browserify = require 'browserify'

module.exports = ->
  b = browserify cache: {}, packageCache: {}, fullPaths: true
  b.add './src/tool.coffee'
  return b
