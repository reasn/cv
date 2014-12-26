var gulp        = require('gulp'),
    typescript  = require('gulp-typescript'),
    concat      = require('gulp-concat-sourcemap'),
    sourcemaps  = require('gulp-sourcemaps'),
    copy        = require('gulp-copy'),
    less        = require('gulp-less'),
    eventStream = require('event-stream');

gulp.task('style', function () {
    gulp.src('./client/style/style.less')
        .pipe(less({}))
        .pipe(gulp.dest('./dist'));
});

var tsProject = typescript.createProject({
    declarationFiles:  true,
    noExternalResolve: true,
    sortOutput:        true
});

gulp.task('script', function () {
    var tsResult = gulp.src([
        './client/script/**/*.ts',
        './typings/**/*.d.ts'
    ]).
        pipe(typescript(tsProject));

    return tsResult.js.pipe(concat('script.js')) // You can use other plugins that also support gulp-sourcemaps
        .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
        .pipe(gulp.dest('./dist'));
    /*
     return eventStream.merge(
     tsResult.dts.pipe(gulp.dest('dist/script')),
     tsResult.js.pipe(gulp.dest('dist/script'))
     );*/
});

gulp.task('view', function () {
    gulp.src('./client/view/index.html')
        .pipe(copy('./dist', {prefix: 2}));
});
gulp.task('assets', function () {
    gulp.src('./client/assets/**/*.*')
        .pipe(copy('./dist/assets', {prefix: 2}));
});
gulp.task('watch', ['script', 'style', 'view', 'assets'], function () {
    gulp.watch('./gulpfile.js', ['watch']);

    gulp.watch('client/script/**/*.ts', ['script']);
    gulp.watch('client/style/**/*.less', ['style']);
    gulp.watch('client/view/**/*.*', ['view']);
    gulp.watch('client/assets/**/*.*', ['assets']);
});