var gulp    = require('gulp'),
    plumber = require('gulp-plumber'),
    stylus  = require('gulp-stylus'),
    jade    = require('gulp-jade'),
    connect = require('gulp-connect');

gulp.task('serve', function() {
  connect.server({
    root: 'public',
    port: process.env.PORT || 3000,
    livereload: true
  });
});

gulp.task('jade', function() {
  gulp.src('src/**/*.jade')
    .pipe(plumber())
    .pipe(jade())
    .pipe(gulp.dest('public/'))
    .pipe(connect.reload());
});

gulp.task('js', function() {
  gulp.src('src/**/*.js')
    .pipe(gulp.dest('public/'));
});

// NOTE: No reload is done here since we need to watch CSS files directly for
// that.
gulp.task('styl', function() {
  gulp.src('src/index.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest('public/'));
});

gulp.task('css', function() {
  gulp.src('public/**/*.css')
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.styl', ['styl']);
  gulp.watch('src/**/*.jade', ['jade']);
  gulp.watch('src/**/*.js', ['js']);
  gulp.watch('public/**/*.css', ['css']);
});

gulp.task('build', ['jade', 'styl', 'js']);

gulp.task('default', ['build', 'serve', 'watch']);
