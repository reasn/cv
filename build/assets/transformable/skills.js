var gulp            = require('gulp'),
    mergeStream     = require('merge-stream'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins         = gulpLoadPlugins({lazy: false, pattern: '*'}),
    name            = 'assets.transformable.skills';

exports.register = function () {

    gulp.task(name, function () {

        var s1 = gulp.src('./client/assets-transformable/graphics/skills/*.svg')
            .pipe(plugins.svg2png());

        var s2 = gulp.src('./client/assets-transformable/graphics/skills/*.png');

        mergeStream(s1, s2)
            .pipe(plugins.imageResize({
                width:       100,
                height:      100,
                crop:        false,
                upscale:     false,
                imageMagick: true,
                filter:      'Catrom'
            }))
            .pipe(plugins.imagemin({
                progressive: true
            }))
            .pipe(gulp.dest('./dist/assets/graphics/skills/'));
    });


};
exports.tasksForDefault = [name];
exports.watchers = {
    files: ['client/assets-transformable/graphics/skills/*.*'],
    tasks: [name]
};