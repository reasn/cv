var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins         = gulpLoadPlugins({lazy: false, pattern: '*'}),
    name            = 'style.compile';

exports.register = function () {

    gulp.task(name, function () {

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
};

exports.tasksForDefault = [
    'style.generated.colors',
    'style.generated.skills',
    'style.generated.values',
    name
];
exports.watchers = {
    files: ['client/style/**/*.less'],
    tasks: [name]
};