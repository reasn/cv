var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins         = gulpLoadPlugins({lazy: false, pattern: '*'}),
    name            = 'assets.transformable.icons';

exports.register = function () {

    gulp.task(name, function () {

        gulp.src('./client/assets-transformable/font-symbols/flaticon/**/*.*')
            .pipe(gulp.dest('./dist/assets/font-symbols/flaticon'));

        gulp.src('./client/assets-transformable/font-symbols/flaticon/flaticon.css')
            .pipe(plugins.replace(/\[[^}]+}/, ''))
            .pipe(gulp.dest('dist/assets/font-symbols/flaticon'))
            .pipe(plugins.livereload());
    });
};
exports.tasksForDefault = [name];
exports.watchers = {
    files: ['client/assets-transformable/font-symbols/flaticon/**/*.*'],
    tasks: [name]
};