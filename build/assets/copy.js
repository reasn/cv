var gulp = require('gulp'),
    name = 'assets.copy';

exports.register = function () {

    gulp.task(name, function () {
        gulp.src('./client/assets/**/*.*')
            .pipe(gulp.dest('./dist/assets'));
    });
};

exports.tasksForDefault = [name];
exports.watchers = {
    files: ['./client/assets/**/*.*'],
    tasks: [name]
};