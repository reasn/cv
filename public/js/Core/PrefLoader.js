"use strict";

/**
 * @since 2014-02-26
 */
var ACV = ACV ? ACV : {};

ACV.Core = ACV.Core ? ACV.Core : {};

ACV.Core.PrefLoader = {};

ACV.Core.PrefLoader.load = function (qFx) {
    $.getJSON('assets/game.json', function (gameData) {
        ACV.Core.PrefLoader._loadLevels(gameData, qFx);
    });
};
/**
 *
 * @param gameData
 * @param qFx
 * @private
 * @todo make load asynchronously
 */
ACV.Core.PrefLoader._loadLevels = function (gameData, qFx) {
    var levelName, layers, powerUps, triggers;
    for (var i in gameData.scene.levels) {
        levelName = gameData.scene.levels[i];

        layers = $.ajax('assets/world/' + levelName + '/layers.json', {
            async: false
        }).responseJSON;
        triggers = $.ajax('assets/world/' + levelName + '/triggers.json', {
            async: false
        }).responseJSON;
        powerUps = $.ajax('assets/world/' + levelName + '/powerUps.json', {
            async: false
        }).responseJSON;

        for (var layerIndex in layers) {
            gameData.scene.layers.push(layers[layerIndex]);
        }
        for (var triggerIndex in triggers) {
            gameData.scene.triggers.push(triggers[triggerIndex]);
        }
        for (var powerUpIndex in powerUps) {
            gameData.scene.foreground.powerups.push(powerUps[powerUpIndex]);
        }
    }
    qFx(gameData);
};
