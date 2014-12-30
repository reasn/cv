var gulp = require('gulp'),
    fs   = require('fs'),
    name = 'style.generated.colors';

exports.register = function () {

    gulp.task(name, function () {
        var colors = JSON.parse(fs.readFileSync('./client/assets/game.json')).prefs.colors,
            colorName,
            varName,
            vars = [],
            rules = [];

        for (colorName in colors) {
            varName = '@c' + colorName.charAt(0).toUpperCase() + colorName.slice(1);
            vars.push(varName + ': ' + colors[colorName] + ';');
            rules.push('.' + colorName + ' { color: ' + varName + '; background-color:' + varName + '}');
        }
        fs.writeFileSync('./client/style/generated/colors.less', vars.join("\n") + "\n\n" + rules.join("\n"));
    });

};
exports.watchers = {
    files: './client/assets/games.json',
    tasks: [name]
};