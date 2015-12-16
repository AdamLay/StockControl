/// <binding AfterBuild='default' />
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    wrap = require('gulp-wrap'),
    declare = require('gulp-declare'),
    handlebars = require('gulp-handlebars');

gulp.task("compile-hbs", function () {
  return gulp
    .src('web/js/templates/*.hbs')
    .pipe(handlebars({ handlebars: require('handlebars') }))
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({ namespace: 'Templates', noRedeclare: true }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('web/js/'));
});

gulp.task("default", ["compile-hbs"], function () {

    return gulp
        .src(['web/js/main.js', 'web/js/Helpers.js', 'web/js/templates.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('web/js/'));
});
