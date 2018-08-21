var gulp = require('gulp'),
  image = require('gulp-image'),
  gp_uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var purify = require('gulp-purifycss');
var minifyCss = require('gulp-minify-css');
var replace = require('gulp-replace');
 
gulp.task('templates', function(){
  gulp.src(['./_posts_original/**.md'])
    // See http://mdn.io/string.replace#Specifying_a_string_as_a_parameter
    .pipe(replace(/### /gm, '{:.subtitle}\n###]]'))
    .pipe(replace(/## /gm, '<br>\n\n{:.title}\n##]]'))
    .pipe(replace(/{:.subtitle}\n###]]/gm, '{:.subtitle}\n### '))
    .pipe(replace(/{:.title}\n##]]/gm, '{:.title}\n## '))
    .pipe(gulp.dest('_posts/'));
});

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
gulp.task('purify', ['sass'],  function() {
  return gulp.src('./_includes/main.css')
    .pipe(purify(['_includes/**.html', './_layouts/**.html', './_pages/**.html', './blog/**.html'], {info: true}))
    .pipe(minifyCss())
    .pipe(gulp.dest('./_includes/purify'));
});

gulp.task("watch", ["purify", "sass"], function() {
  gulp.watch("./_sass/main.scss", ["sass", "purify"])
  gulp.watch(["./_pages/**", "./_layouts/**"], ["purify"]);
})

gulp.task('default', ['watch'], function(){});
