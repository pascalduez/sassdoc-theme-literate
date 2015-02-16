'use strict';

var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var uglify = require('gulp-uglify');
var svgmin = require('gulp-svgmin');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var gutil = require('gulp-util');
var lazypipe = require('lazypipe');
var gulpif = require('gulp-if');
var browserSync = require('browser-sync');
var reload = browserSync.reload;


// Project paths helpers.
var pjoin = function () {
  var args = [].slice.call(arguments);
  args.unshift(__dirname);
  return path.join.apply(path, args);
};
var dist = function (files) {
  return pjoin('./dist', files || '');
};
var src = function (files) {
  return pjoin('./src', files || '');
};
var proj = function (files) {
  return pjoin('./SassyIcons/stylesheets', files || '');
};
var docs = function (files) {
  return pjoin('./sassdoc', files || '');
};


var devMode = gutil.env.type === 'develop';


gulp.task('styles', function () {
  var processors = [
    require('autoprefixer-core')()
  ];

  var devPipeline = lazypipe()
    .pipe(gulp.dest, docs('assets/css'))
    .pipe(filter, '**/*.css')
    .pipe(reload, { stream: true });

  var distPipeline = lazypipe()
    .pipe(gulp.dest, dist('assets/css'));

  return gulp.src(src('scss/**/*.scss'))
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(postcss(processors))
    .pipe(gulpif(devMode, devPipeline(), distPipeline()));
});


gulp.task('scripts', function () {
  var devPipeline = lazypipe()
    .pipe(gulp.dest, docs('assets/js'))
    .pipe(filter, '**/*.js')
    .pipe(reload, { stream: true });

  var distPipeline = lazypipe()
    .pipe(uglify)
    .pipe(rename, { extname: '.min.js' })
    .pipe(gulp.dest, dist('assets/js'));

  return gulp.src(src('assets/js/*.js'))
    .pipe(gulpif(devMode, devPipeline(), distPipeline()));
});


gulp.task('templates', function () {
  var render = require('./dist/lib/render');
  var doccoify = require('./dist/lib/doccoify');
  var cartoucheify = require('./dist/lib/cartoucheify');
  var applyDefaults = require('./dist/lib/defaults');
  // var def = require('./dist/defaults.json');
  var data = require('./dist/data.json');
  var pkg = require('./package.json');

  var ctx = {
    develop: devMode,
    data: data,
    package: pkg,
  };
  ctx = applyDefaults(ctx);
  doccoify(ctx);
  cartoucheify(ctx);

  return render(src('views/*.html'), docs(), ctx, { base: src('views') })
    .then(reload);
});


gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: docs()
    },
    open: false,
    browser: 'FirefoxNightly',
  });
});


gulp.task('sassdoc', function () {
  var sassdoc = require('sassdoc');
  var sdutils = require('sassdoc-utils');

  var config = {
    verbose: true,
    dest: docs(),
    theme: './dist',
    package: './package.json',
    develop: devMode
  };

  var docStream = sassdoc(config);

  gulp.src(proj('**/*.scss'))
    .pipe(docStream)
    .pipe(sdutils.dump())
    .pipe(gulp.dest(dist()));

  // Await full documentation process.
  return docStream.promise;
});


gulp.task('svgmin', function () {
  return gulp.src(src('assets/svg/*.svg'))
    .pipe(svgmin({
      plugins: [{ removeViewBox: false }]
    }))
    .pipe(gulp.dest(dist('assets/svg')));
});


// Development task.
// While working on a theme.
gulp.task('develop', ['sassdoc', 'browser-sync'], function () {
  gulp.watch(src('scss/**/*.scss'), { interval: 300 }, ['styles']);
  gulp.watch(src('assets/js/*.js'), { interval: 300 }, ['scripts']);
  gulp.watch(src('views/**/*.html'), { interval: 300 }, ['templates']);
});


// Pre-publish tasks.
gulp.task('dist', ['styles', 'scripts', 'svgmin']);


// Push gh-pages preview.
gulp.task('deploy', function () {
  var deploy = require('gulp-gh-pages');

  return gulp.src('./.sassdoc/**/*')
    .pipe(deploy());
});
