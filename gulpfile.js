const gulp = require('gulp');
const sass = require('gulp-sass');

sass.compiler = require('node-sass');

function sassCompiler(){
    return gulp.src('./styles/scss/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('./styles/css'))

}

function watchSass(){
    gulp.watch('./styles/scss/*.scss', sassCompiler)
}

exports.watch_sass = watchSass;