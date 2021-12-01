const gulp = require('gulp');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const stream = require('webpack-stream');
const rename = require('gulp-rename');
const awspublish = require('gulp-awspublish');
const replace = require('gulp-replace-task');
const { exec } = require('child_process');
const { version } = require('./package.json');
const webpackConfig = require('./webpack.config.js');
const awsProfile = require('./aws-profile.json');

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
  .pipe(terser()) // minifies the code for better compression
  .pipe(rename({ suffix: `-${version}`, extname: '.min.js' }))
  .pipe(gulp.dest(SETTINGS.DEST_BUILD)));

// build for snippet
gulp.task('webpack-snippet', () => gulp.src('./examples/js/snippet.js') // gulp looks for all source files under specified SETTINGS
  .pipe(terser()) // minifies the code for better compression
  .pipe(gulp.dest(SETTINGS.DEST_BUILD)));

if (awsProfile && awsProfile.params && awsProfile.params.Bucket) {

  // create a new publisher
  const publisher = awspublish.create(awsProfile);

  // define custom headers
  const headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public',
  };

  gulp.task('deploy', () => gulp.src(`dist/js/visearch-${version}.min.js`)
    .pipe(rename((path) => {
      // upload folder name
      path.dirname = '/visearch/dist/js/';
    }))
    .pipe(awspublish.gzip({ ext: '' }))
    .pipe(publisher.publish(headers, { force: true }))
    .pipe(awspublish.reporter()));

}

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
