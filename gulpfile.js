var gulp            = require('gulp'),
    del             = require('del'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins         = gulpLoadPlugins({
        lazy:    false,
        pattern: '*'
    });


gulp.task('default', ['clean'], function () {
    gulp.start('script', 'bower', 'style', 'view', 'assets');
});

gulp.task('clean', function (cb) {
    del(['./dist/assets', './dist/css', './dist/js', './dist/index.html'], cb)
});

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
    sortOutput:        true,
    noImplicitAny:     true,
    target:            'ES5'
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

gulp.task("bower", function () {
    gulp.src(plugins.mainBowerFiles())
        .pipe(plugins.concat('vendor.js'))
        .pipe(gulp.dest("./dist/js"))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.uglify())
        .pipe(gulp.dest("./dist/js"));
});

gulp.task('view', function () {
    gulp.src('./client/view/index.html')
        .pipe(plugins.copy('./dist', {prefix: 2}));
});
gulp.task('assets', function () {
    gulp.src('./client/assets/**/*.*')
        .pipe(plugins.copy('./dist/assets', {prefix: 2}));
});
gulp.task('watch', ['default'], function () {
    gulp.watch('./gulpfile.js', ['watch']);

    gulp.watch(['bower_components/**/*.*', '.bowerrec', 'bower.json'], ['bower']);

    gulp.watch('client/script/**/*.ts', ['script']);
    gulp.watch('client/style/**/*.less', ['style']);
    gulp.watch('client/view/**/*.*', ['view']);
    gulp.watch('client/assets/**/*.*', ['assets']);
});