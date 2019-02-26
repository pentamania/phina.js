var gulp    = require('gulp');
var uglify  = require('gulp-uglify');
var header  = require('gulp-header');
var rename  = require('gulp-rename');
var util    = require('gulp-util');
var pump    = require('pump');

var config = require('../config');

gulp.task('uglify', function(cb) {
  pump([
    gulp.src(config.uglify.target),
    uglify(),
    header(config.banner, {
      pkg: config.package,
    }),
    rename({
      extname: '.min.js'
    }),
    gulp.dest(config.uglify.output)
  ], cb);

  // return gulp.src(config.uglify.target)
  //   .pipe(uglify())
  //   .pipe(header(config.banner, {
  //     pkg: config.package,
  //   }))
  //   .pipe(rename({
  //     extname: '.min.js'
  //   }))
  //   .pipe(gulp.dest(config.uglify.output))
  //   .on('end', function() {
  //     util.log(util.colors.blue('finish'));
  //   });
});

