watch = require 'gulp-watch'
gulp = require 'gulp'

module.exports = -> watch 'src/*.coffee', -> gulp.start 'build'

