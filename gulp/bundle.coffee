gulp = require 'gulp'
source = require 'vinyl-source-stream'

module.exports = (b, fileName) ->
  b.bundle()
   .pipe source fileName
   .pipe gulp.dest './app/js/'

