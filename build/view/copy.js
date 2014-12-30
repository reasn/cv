var gulp = require('gulp'),
    name = 'view.copy';

exports.register = function () {

    gulp.task(name, function () {
        gulp.src('./client/view/index.html')
            .pipe(gulp.dest('./dist'));
    });
};
exports.tasksForDefault = [name];
exports.watchers = {
    files: ['./client/view/index.html'],
    tasks: [name]
};

