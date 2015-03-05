gulp = require 'gulp'

module.exports = (tasks) ->
  for t in tasks
    gulp.task t, require "./tasks/#{ t }"
  gulp
