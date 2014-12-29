var gulp            = require('gulp'),
    del             = require('del'),
    fs              = require('fs'),
    mergeStream     = require('merge-stream'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    pngquant        = require('imagemin-pngquant'),
    plugins         = gulpLoadPlugins({
        lazy:    false,
        pattern: '*'
    });


gulp.task('default', ['clean'], function () {
    gulp.start('script', 'bower', 'style', 'view', 'assets', 'assets-transformable');
});

gulp.task('clean', function (cb) {
    del(['./dist/assets', './dist/css', './dist/js', './dist/index.html'], cb)
});

gulp.task('style-colors', function () {
    var colors = JSON.parse(fs.readFileSync('./client/assets/game.json')).prefs.colors,
        colorName,
        varName,
        vars = [],
        rules = [];

    for (colorName in colors) {
        varName = '@c' + colorName.charAt(0).toUpperCase() + colorName.slice(1);
        vars.push(varName + ': ' + colors[colorName] + ';');
        rules.push('.' + colorName + ' { color: ' + varName + '; background-color:' + varName + '}');
    }
    fs.writeFileSync('./client/style/generated/colors.less', vars.join("\n") + "\n\n" + rules.join("\n"));
});

gulp.task('style-skills', function () {
    var rules = [];
    fs.readdirSync('./client/assets-transformable/graphics/skills').forEach(function (fileName) {
        var name = fileName.replace(/\..*$/, '');
        rules.push('.skill-' + name + ' { background-image: url("../assets/graphics/skills/' + name + '.png") }');
    });
    fs.writeFileSync('./client/style/generated/skills.less', rules.join("\n"));
});

gulp.task('style', ['style-colors', 'style-skills'], function () {

    gulp.src('./client/style/style.less')
        .pipe(plugins.less({
            paths: ['./client/style']
        }))
        .on('error', plugins.notify.onError(function (error) {
            console.error(error.message);
            return 'Could not compile LESS.';
        }))
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

    //var r = plugins.typescript.reporter.defaultReporter();

    var tsResult = gulp.src(['./client/script/**/*.ts', './typings/**/*.d.ts'])
        .pipe(plugins.typescript(tsProject));

    var errorDisplayed = false;

    tsResult.on("error", plugins.notify.onError(function (error) {
        if (errorDisplayed) {
            return null;
        }
        errorDisplayed = true;
        return 'Typescript compilation failed.';
    }));

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
gulp.task('assets-transformable', ['transformable-skills']);

gulp.task('transformable-skills', function () {

    var s1 = gulp.src('./client/assets-transformable/graphics/skills/*.svg')
        .pipe(plugins.svg2png());

    var s2 = gulp.src('./client/assets-transformable/graphics/skills/*.png');

    mergeStream(s1, s2)
        .pipe(plugins.imageResize({
            width:       100,
            height:      100,
            crop:        false,
            upscale:     false,
            imageMagick: true
        }))
        .pipe(plugins.imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('./dist/assets/graphics/skills/'));
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
    gulp.watch('client/assets/**/*', ['assets']);
    gulp.watch('client/assets-transformable/**/*', ['assets-transformable', 'style-skills']);
});