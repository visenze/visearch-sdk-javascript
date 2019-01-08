const gulp = require('gulp');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const stream = require('webpack-stream');
const rename = require('gulp-rename');
const replace = require('gulp-replace-task');
const { exec } = require('child_process');
const { version } = require('./package.json');
const webpackConfig = require('./webpack.config.js');

const SETTINGS = {
  DEST_BUILD: 'dist/js',
};

// build for development
gulp.task('webpack', () => gulp.src(['./js/visearch.js']) // gulp looks for all source files under specified SETTINGS
  .pipe(stream(webpackConfig)) // blend in the webpack config into the source files
  .pipe(replace({ patterns: [{ match: 'version', replacement: version }] })) // replace some variables in source
  // creates a source map which would be very helpful for debugging by maintaining the actual source code structure
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(SETTINGS.DEST_BUILD)));

// build for production
gulp.task('webpack-production', () => gulp.src('./js/visearch.js') // gulp looks for all source files under specified SETTINGS
  .pipe(stream(webpackConfig)) // blend in the webpack config into the source files
  .pipe(replace({ patterns: [{ match: 'version', replacement: version }] })) // replace some variables in source
  .pipe(uglify()) // minifies the code for better compression
  .pipe(rename({ suffix: `-${version}`, extname: '.min.js' }))
  .pipe(gulp.dest(SETTINGS.DEST_BUILD)));

// build for snippet
gulp.task('webpack-snippet', () => gulp.src('./examples/js/snippet.js') // gulp looks for all source files under specified SETTINGS
  .pipe(uglify()) // minifies the code for better compression
  .pipe(gulp.dest(SETTINGS.DEST_BUILD)));

gulp.task('watch', () => {
  gulp.watch('./js/visearch.js', gulp.series('webpack'));
  gulp.watch('./examples/js/snippet.js', gulp.series('webpack-snippet'));
});

// alias build task for webpack
gulp.task('build', gulp.series('webpack', 'webpack-production', 'webpack-snippet'));

const testServer = (cb) => {
  console.log('starting node testServer.js');
  exec('nodemon testServer.js', (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
};

// default tasks, build the source and add watch the files, and start a local test server
gulp.task('default', gulp.series('build', gulp.parallel('watch', testServer)));
