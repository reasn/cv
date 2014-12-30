var gulp = require('gulp'),
    fs   = require('fs'),
    name = 'style.generated.values';

exports.register = function () {

    gulp.task(name, function () {
        var data = JSON.parse(fs.readFileSync('./client/assets/game.json')),
            vars = {},
            varName,
            source = '';

        vars = {
            dHudHeight: data.hud.prefs.height + 'px'
        };

        for (varName in vars) {
            source += '@' + varName + ': ' + vars[varName] + ';' + "\n";
        }
        fs.writeFileSync('./client/style/generated/values.less', source);
    });
};
exports.watchers = {
    files: ['./client/assets/game.json'],
    tasks: [name]
};