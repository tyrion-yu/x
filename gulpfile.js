/**
 * Created by Administrator on 2015/10/27.
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('script', function () {
    gulp.src(['./libs/jquery-2.1.4.js','./libs/vue.js','./libs/ZeroClipboard.min.js','./js/common.js','./js/smb.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./build/'))
        .pipe(rename({suffix:'.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('./build/'));
});

gulp.task('sass', function () {
    gulp.src('./sass/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error',sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./css'))
});

gulp.task('default',['script','sass'], function () {
    gulp.watch('./js/*.js',['script']);
    gulp.watch('./sass/*.scss',['sass']);
});