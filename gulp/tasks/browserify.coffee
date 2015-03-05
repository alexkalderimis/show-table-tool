gulp = require 'gulp'
rename = require 'gulp-rename'
browserify = require 'browserify'
source = require 'vinyl-source-stream'
transform = require 'vinyl-transform'

module.exports = ->
  browserified = transform (filename) ->
    browserify(filename).bundle()

  browserify('./src/tool.coffee').bundle()
      .pipe source 'tool.js'
      .pipe gulp.dest './app/js'

  browserify('./src/index.coffee').bundle()
      .pipe source 'index.js'
      .pipe gulp.dest './app/js'
