var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins         = gulpLoadPlugins({lazy: false, pattern: '*'}),
    name            = 'script.bower';

exports.register = function () {

    gulp.task(name, function () {
        gulp.src([
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js'
        ])
            //Plugin does not work on Alex' local deployment vm (works on windows though - wtf?!^^)
        //gulp.src(plugins.mainBowerFiles())
            .pipe(plugins.concat('vendor.js'))
            .pipe(gulp.dest("./dist/js"))
            .pipe(plugins.rename({suffix: '.min'}))
            .pipe(plugins.uglify())
            .pipe(gulp.dest("./dist/js"));
    });
};
exports.tasksForDefault = [name];
exports.watchers = {
    files: ['.bowerrec', 'bower.json'],
    tasks: [name]
};