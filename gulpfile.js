var gulp = require('gulp');
//var imagemin = require('gulp-imagemin');
const imagemin = import('gulp-imagemin')
const sass = require('gulp-sass')(require('sass'));
let cleanCSS = require('gulp-clean-css');
//var responsive = require('gulp-responsive');
var purgecss = require('gulp-purgecss')
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var gulpAmpValidator = require('gulp-amphtml-validator');
//var del = require('del');
var del = import('del');

var paths = {
  styles: {
    src: '_sass/main.scss',
    tmp: 'assets/css/dist',
    dest: '_includes'
  },
  images: {
    src: 'assets/img',
    dest: 'assets/img'
  },
  html: {
    src: [
      '_site/*.html',
      '_site/blog/*.html',
      '!_site/blog/withings-data.html',
      '!_site/blog/santorini-experience.html',
      '!_site/blog/marathon-mirabelle.html'
    ]
  }
};

function thumbnails() {
  return gulp.src([`${paths.images.src}/**/main.{png,jpg,jpeg,svg}`, `${paths.images.src}/external-articles/*.{png,jpg,jpeg,svg}`])
    //.pipe(
    //  responsive({
    //    '*': [
    //      {
    //        width: 400,
    //        height: 225,
    //        format: 'jpg',
    //        rename: { 
    //          suffix: '-thumb',
    //          dirname: 'external-articles-responsive'
    //        },
    //      },
    //      {
    //        width: 400,
    //        height: 225,
    //        format: 'webp',
    //        rename: { 
    //          suffix: '-thumb',
    //          dirname: 'external-articles-responsive'
    //        },
    //      },
    //      {
    //        width: 1400,
    //        height: 788,
    //        format: 'jpg',
    //        rename: { 
    //          suffix: '-16x9',
    //          dirname: 'external-articles-responsive'
    //        },
    //      },
    //      {
    //        width: 1400,
    //        height: 788,
    //        format: 'webp',
    //        rename: { 
    //          suffix: '-16x9',
    //          dirname: 'external-articles-responsive'
    //        },
    //      }
    //    ],
    //    '*/main.*': [
    //      {
    //        width: 400,
    //        height: 225,
    //        format: 'jpg',
    //        rename: { suffix: '-thumb'},
    //      },
    //      {
    //        width: 400,
    //        height: 225,
    //        format: 'webp',
    //        rename: { suffix: '-thumb'},
    //      },
    //      {
    //        width: 1400,
    //        height: 788,
    //        format: 'jpg',
    //        rename: { suffix: '-16x9'},
    //      },
    //      {
    //        width: 1400,
    //        height: 788,
    //        format: 'webp',
    //        rename: { suffix: '-16x9'},
    //      }
    //    ],
    //  }, {
    //    // Global configuration for all images
    //    // The output quality for JPEG, WebP and TIFF output formats
    //    quality: 70,
    //    // Use progressive (interlace) scan for JPEG and PNG output
    //    progressive: true,
    //    // Zlib compression level of PNG output format
    //    compressionLevel: 6,
    //    // Strip all metadata
    //    withMetadata: false,
    //    errorOnEnlargement: false,
    //    crop: 'entropy'
    //  }))
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ], {verbose: true}))
    .pipe(gulp.dest(paths.images.dest));
}


function images() {
  return gulp.src(`${paths.images.src}/**/*.{png,jpg,jpeg,gif}`)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ], {verbose: true}))
    .pipe(gulp.dest(paths.images.dest))
}

function amp_validator() {
  const logger = console
  logger.info = console.log
  return gulp.src(paths.html.src)
    .pipe(gulpAmpValidator.validate())
    .pipe(gulpAmpValidator.format(logger))
    .pipe(gulpAmpValidator.failAfterError());
}
 
// function clean() {
//   return del([ paths.styles.tmp ]);
// }
 
function purificationPosts() {
  return gulp.src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(purgecss({
      content: ['_includes/*.html', '_layouts/default.html', '_layouts/post.html', 'jekyll_collections/_blog/*.html'],
      variables: true,
      safelist: {
        standard: [],
        deep: [],
        greedy: [],
        keyframes: [],
        variables: [/menu-list-link-padding|body-family|family-primary|background-hover|hover-background-l-delta/]
      }
    }))
    .pipe(replace(/!important/gm, ''))
    .pipe(gulp.dest(paths.styles.tmp));
}

function concatenation() {
  return gulp.src([`${paths.styles.tmp}/main.css`, 'assets/css/github.css'])
    .pipe(concat('main.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}, (details) => {
      console.log(`Minification of ${details.name} posts: ${details.stats.originalSize/1000} kb -> ${details.stats.minifiedSize/1000} kb`);
    }))
    .pipe(rename({ suffix: '-post-min' }))
    .pipe(gulp.dest('./_includes/'));
}

function purificationDefault() {
  return gulp.src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(purgecss({ 
      content: ['_includes/*.html', '_layouts/default.html', 'jekyll_collections/_pages/*.html', '_data/about/*.yml'],
      variables: true,
      safelist: {
        standard: [],
        deep: [],
        greedy: [],
        keyframes: [],
        variables: [/menu-list-link-padding|body-family|family-primary|background-hover|hover-background-l-delta/]
        
      }
    }))
    .pipe(replace(/!important/gm, ''))
    .pipe(cleanCSS({compatibility: 'ie8'}, (details) => {
      console.log(`Minification of ${details.name}: ${details.stats.originalSize/1000} kb -> ${details.stats.minifiedSize/1000} kb`);
    }))
    .pipe(rename({ suffix: '-min' }))
    .pipe(gulp.dest('./_includes/'));
}
 
//var build = gulp.series(clean, purificationPosts, concatenation, purificationDefault, clean);
var build = gulp.series(purificationPosts, concatenation, purificationDefault );

function watch() {
  gulp.watch(["_layouts/**", "_includes/**.html", "jekyll_collections/**", "_sass/*", "assets/css/*"], build);
}
 
exports.images = images;
exports.thumbnails = thumbnails;
exports.amp_validator = amp_validator;
//exports.clean = clean;
exports.concatenation = concatenation;
exports.build = build;
exports.watch = watch;
/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build;
