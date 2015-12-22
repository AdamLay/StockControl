/// <binding AfterBuild='default' />
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    declare = require('gulp-declare'),
    jade = require('gulp-jade'),
    less = require('gulp-less');

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

gulp.task('compile-less', function () {

  return gulp
    .src('./web/styles/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('./web/styles/'));
});

gulp.task('common-js', function () {

  return gulp
    .src(['./common/**/*.js', '!./common/shared.js'])
    .pipe(concat('shared.js'))
    .pipe(gulp.dest('./common/'));
});

gulp.task('compile-client', ['compile-jade', 'common-js', 'compile-less'], function () {

  return gulp
    .src(['./common/shared.js', './web/js/main.js', , './web/js/templates.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./web/js/'));
});

gulp.task('compile-server', ['common-js'], function () {

  return gulp
    .src(['./common/shared.js', './server.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('default', ['compile-client', 'compile-server'], function () { });
