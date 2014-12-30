var gulp            = require('gulp'),
    del             = require('del'),
    fs              = require('fs'),
    tasksForDefault = [],
    watchers        = [];

function registerDir(directory) {
    fs.readdirSync(directory).forEach(function (item) {
        var fullPath = directory + '/' + item,
            module;
        if (fs.fstatSync(fs.openSync(fullPath, 'r')).isDirectory()) {
            registerDir(fullPath);
        } else {
            module = require(fullPath.replace(/\.js$/, ''));
            if (!module.register) {
                console.log(module);
                throw new Error('Task ' + fullPath + ' did export no register function.');
            }
            module.register();
            if (module.tasksForDefault) {
                tasksForDefault = tasksForDefault.concat(module.tasksForDefault);
            }
            if (module.watchers) {
                watchers = watchers.concat(module.watchers);
            }
        }
    });
}

registerDir('./build');

gulp.task('default', ['clean'], function () {
    gulp.start.apply(gulp, tasksForDefault);
});

gulp.task('clean', function (cb) {
    del(['./dist'], cb)
});

gulp.task('watch', ['default'], function () {

    //gulp.watch(['./gulpfile.js', './build/**/*.js'], ['watch']);

    watchers.forEach(function (watcher) {
        gulp.watch(watcher.files, watcher.tasks);
    });
});