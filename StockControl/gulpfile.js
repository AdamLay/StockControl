/// <binding AfterBuild='compile-jade, default' />
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    declare = require('gulp-declare'),
    jade = require('gulp-jade');

gulp.task('compile-jade', function () {
  return gulp
    .src('./views/client/*.jade')
    .pipe(jade({
        jade: require('jade'),
        client: true
    }))
    .pipe(declare({
        namespace: "Templates",
        noRedeclare: true,
        processName: function (path) {
            return declare.processNameByPath(path.substring(path.lastIndexOf('\\') + 1));
        }
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('web/js'));
});

gulp.task('default', ['compile-jade'], function () {

    return gulp
      .src(['web/js/main.js', 'web/js/Helpers.js', 'web/js/templates.js'])
      .pipe(concat('app.js'))
      .pipe(gulp.dest('web/js/'));
});
