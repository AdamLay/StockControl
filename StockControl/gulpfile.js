var gulp = require('gulp'),
    concat = require('gulp-concat'),
    wrap = require('gulp-wrap'),
    handlebars = require('gulp-handlebars');

gulp.task("compile-hbs", function () {
  return gulp
    .src('web/js/templates/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    //.pipe(declare({ namespace: 'templates', noRedeclare: true }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('web/js/'));
});

gulp.task("default", ["compile-hbs"], function () {

    return gulp
        .src(['web/js/Helpers.js', 'web/js/main.js', 'web/js/templates.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('web/js/'));
});
