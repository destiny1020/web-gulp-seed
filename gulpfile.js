var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    connect = require('gulp-connect'),
    minifyCSS = require('gulp-minify-css');

var env,
    jsSources3rd,
    jsSources, 
    cssSources3rd,
    cssSources,
    htmlSources,
    fontSources, 
    imageSources, 
    outputDir, 
    jsExt,
    cssExt;

env = process.env.NODE_ENV || 'development';

if(isDevelopment()) {
  outputDir = 'builds/development/';
  jsExt = '.js';
  cssExt = '.css';
} else if(isProduction()) {
  outputDir = 'builds/production/';
  jsExt = '.min.js';
  cssExt = '.min.css';
} else {
  throw new Error('Please specify NODE_ENV as "production".');
}

jsSources3rd = [
  // browserify dependencies
  'components/scripts/require.js',
  'node_modules/bootstrap/dist/js/bootstrap' + jsExt
];

// add app script sources here
jsSources = [

];

cssSources3rd = [
  // bootstrap css dependency
  'node_modules/bootstrap/dist/css/bootstrap' + cssExt,
  'node_modules/bootstrap/dist/css/bootstrap-theme' + cssExt
];

// app css sources here
cssSources = [
  'components/css/*.css'
];

fontSources = [
  // bootstrap font dependency
  'node_modules/bootstrap/dist/fonts/*.*'

  // add app font sources here
];

imageSources = [
  'components/images/**/*.*'
];

htmlSources = [
  'components/html/**/*.html'
];

gulp.task('js', function() {
  // handle 3rd scripts
  if(jsSources3rd.length > 0) {
    gulp.src(jsSources3rd)
      .pipe(concat('lib.js'))
      .pipe(browserify())
      .pipe(gulpif(isProduction(), uglify()))
      .pipe(gulp.dest(outputDir + 'js'));
  }

  // handle app scripts
  if(jsSources.length > 0) {
    gulp.src(jsSources)
      .pipe(concat('script.js'))
      .pipe(gulpif(isProduction(), uglify()))
      .pipe(gulp.dest(outputDir + 'js'))
      .pipe(connect.reload());
  }
});

gulp.task('css', function() {
  // handle 3rd css
  if(cssSources3rd.length > 0) {
    gulp.src(cssSources3rd)
      .pipe(concat('lib.css'))
      .pipe(gulp.dest(outputDir + 'css'));
  }

  // handle app css
  if(cssSources.length > 0) {
    gulp.src(cssSources)
      .pipe(concat('style.css'))
      .pipe(gulpif(isProduction(), minifyCSS({keepBreaks:true})))
      .pipe(gulp.dest(outputDir + 'css'))
      .pipe(connect.reload());
  }
});

// copy the fonts
gulp.task('font', function() {
  if(fontSources.length > 0) {
    gulp.src(fontSources)
      .pipe(gulp.dest(outputDir + 'fonts'))
      .pipe(connect.reload());
  }
});

gulp.task('images', function() {
  gulp.src(imageSources)
    // TODO: may need compression in production mode
    .pipe(gulp.dest(outputDir + 'images'))
    .pipe(connect.reload())
});

gulp.task('html', function() {
  if(htmlSources.length > 0) {
    gulp.src(htmlSources)
      .pipe(gulpif(isProduction(), minifyHTML()))
      .pipe(gulp.dest(outputDir))
      .pipe(connect.reload());
  }
});

gulp.task('watch', function() {
  gulp.watch(jsSources, ['js']);
  gulp.watch(cssSources, ['css']);
  gulp.watch(fontSources, ['font']);
  gulp.watch(htmlSources, ['html']);
  gulp.watch(imageSources, ['images']);
});

gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

gulp.task('default', ['html', 'js', 'css', 'font', 'images', 'connect', 'watch']);

function isDevelopment() {
  return env === 'development';
}

function isProduction() {
  return env === 'production';
}