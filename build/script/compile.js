var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins         = gulpLoadPlugins({lazy: false, pattern: '*'}),
    name            = 'script.compile';

exports.register = function () {
    var tsProject = plugins.typescript.createProject({
        declarationFiles:  true,
        noExternalResolve: true,
        sortOutput:        true,
        noImplicitAny:     true,
        target:            'ES5'
    });

    gulp.task(name, function () {

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


};
exports.tasksForDefault = [name];
exports.watchers = {
    files: ['./client/script/**/*.ts'],
    tasks: [name]
};

