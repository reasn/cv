var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins         = gulpLoadPlugins({lazy: false});
/*
 typescript   = require('gulp-typescript'),
 concat       = require('gulp-concat-sourcemap'),
 sourcemaps   = require('gulp-sourcemaps'),
 copy         = require('gulp-copy'),
 less         = require('gulp-less'),
 autoprefixer = require('gulp-autoprefixer'),
 minifycss    = require('gulp-minify-css'),
 rename       = require('gulp-rename'),
 eventStream  = require('event-stream');
 */

gulp.task('style', function () {
    gulp.src('./client/style/style.less')
        .pipe(plugins.less({}))
        .pipe(plugins.autoprefixer('> 5%', 'last 2 versions'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.minifyCss())
        .pipe(gulp.dest('./dist/css'));
});
var tsProject = plugins.typescript.createProject({
    declarationFiles:  true,
    noExternalResolve: true,
    sortOutput:        true
});

gulp.task('script', function () {
    var tsResult = gulp.src([
        './client/script/**/*.ts',
        './typings/**/*.d.ts'
    ]).
        pipe(plugins.typescript(tsProject));

    return tsResult.js
        .pipe(plugins.concatSourcemap('cv.js')) // You can use other plugins that also support gulp-sourcemaps
        .pipe(plugins.sourcemaps.write()) // Now the sourcemaps are added to the .js file
        .pipe(plugins.jshint.reporter('default'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('./dist/js'))
        .pipe(plugins.notify({message: 'Scripts task complete'}));
});

gulp.task('view', function () {
    gulp.src('./client/view/index.html')
        .pipe(plugins.copy('./dist', {prefix: 2}));
});
gulp.task('assets', function () {
    gulp.src('./client/assets/**/*.*')
        .pipe(plugins.copy('./dist/assets', {prefix: 2}));
});
gulp.task('watch', ['script', 'style', 'view', 'assets'], function () {
    gulp.watch('./gulpfile.js', ['watch']);

    gulp.watch('client/script/**/*.ts', ['script']);
    gulp.watch('client/style/**/*.less', ['style']);
    gulp.watch('client/view/**/*.*', ['view']);
    gulp.watch('client/assets/**/*.*', ['assets']);
});