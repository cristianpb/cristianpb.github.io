var gulp = require('gulp'),
  image = require('gulp-image'),
  gp_uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var purify = require('gulp-purifycss');
var minifyCss = require('gulp-minify-css');

var site = 'https://d40e46fc.ngrok.io';

gulp.task('image', function () {
  gulp.src('./assets/images/*')
    .pipe(image({
      pngquant: true,
      optipng: false,
      zopflipng: true,
      jpegRecompress: false,
      mozjpeg: true,
      guetzli: false,
      gifsicle: true,
      svgo: true,
      concurrent: 10,
      quiet: true // defaults to false
    }))
    .pipe(gulp.dest('./assets/images/'));
});

gulp.task('sass', function () {
  return gulp.src('./_sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./_includes/'));
});

// purify removes unused CSS classes
gulp.task('purify', function() {
  return gulp.src('./_includes/main.css')
    .pipe(purify(['./_layouts/default.html','./_layouts/page.html','./_layouts/post.html', './_pages/index.md', './_pages/abobut.md'], {info: true, rejected: true}))
    .pipe(minifyCss())
    .pipe(gulp.dest('./_includes/purify'));
});

gulp.task("watch", ["purify"], function() {
  gulp.watch("./_pages/*", ["purify"])
})

gulp.task('default', ['watch'], function(){});
