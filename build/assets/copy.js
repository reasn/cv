var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins         = gulpLoadPlugins({lazy: false, pattern: '*'}),
    name = 'assets.copy';

exports.register = function () {

    gulp.task(name, function () {
        gulp.src('./client/assets/**/*.*')
            .pipe(gulp.dest('./dist/assets'))
            .pipe(plugins.livereload());
    });
};

exports.tasksForDefault = [name];
exports.watchers = {
    files: ['./client/assets/**/*.*'],
    tasks: [name]
};