/**
 * Created by Administrator on 2015/10/27.
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('script', function () {
    gulp.src(['./libs/jquery-2.1.4.js','./libs/vue.js','./libs/ZeroClipboard.min.js','./js/common.js','./js/smb.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./build/'))
        .pipe(rename({suffix:'.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('./build/'));
});

gulp.task('default',['script']);