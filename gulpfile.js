require('coffee-script/register');
var gulp = require('./gulp/index.coffee')([
  'browserify',
  'watchify',
  'watch',
  'serve'
]);

gulp.task('default', ['build', 'watch', 'serve']);
gulp.task('build', ['browserify']);
