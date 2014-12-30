var gulp = require('gulp'),
    fs   = require('fs'),
    name = 'style.generated.skills';

exports.register = function () {

    gulp.task(name, function () {
        var rules = [];
        fs.readdirSync('./client/assets-transformable/graphics/skills').forEach(function (fileName) {
            var name = fileName.replace(/\..*$/, '');
            if (fileName === 'Thumbs.db') {
                return;
            }
            rules.push('.skill-' + name + ' { background-image: url("../assets/graphics/skills/' + name + '.png") }');
        });
        fs.writeFileSync('./client/style/generated/skills.less', rules.join("\n"));
    });
};

exports.watchers = {
    files: ['client/assets-transformable/graphics/skills/*.*'],
    tasks: [name]
};