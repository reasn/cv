"use strict";

/**
 * @since 2014-02-26
 */
var ACV = ACV ? ACV : {};

ACV.Core = ACV.Core ? ACV.Core : {};

ACV.Core.PrefLoader = {};

ACV.Core.PrefLoader = function () {
};


ACV.Core.PrefLoader.prototype = ACV.Core.createPrototype('ACV.Core.PrefLoader',
    {
        gameData: null
    });

ACV.Core.PrefLoader.prototype.load = function (qFx) {
    var pl = this;
    $.getJSON('assets/game.json', function (gameData) {
        pl.gameData = gameData;

        pl._loadLevels(gameData.scene.levels, function () {
            this.log('Preferences and levels loaded.');
            qFx(this.gameData);
        });
    });
};
/**
 * @param levels
 * @param qFx
 * @private
 */
ACV.Core.PrefLoader.prototype._loadLevels = function (levels, qFx) {
    var pl = this, loadNextLevel;

    loadNextLevel = function () {
        pl._loadLevel(levels.shift(), function () {
            if (levels.length > 0) {
                loadNextLevel();
            }
            else {
                qFx.apply(this, [pl.gameData]);
            }
        });
    };
    loadNextLevel();
};
ACV.Core.PrefLoader.prototype._loadLevel = function (levelDescriptor, qFx) {
    var pl = this, filesToLoad = 3;
    this.log('Loading level ' + levelDescriptor.handle);

    var wrappedQfx = function () {
        if (--filesToLoad === 0) {
            qFx.apply(this);
        }
    };

    $.getJSON('assets/world/' + levelDescriptor.handle + '/layers.json', function (layers) {
        pl._loadLayers(levelDescriptor.offset, layers, wrappedQfx);
    });
    $.getJSON('assets/world/' + levelDescriptor.handle + '/triggers.json', function (triggers) {
        pl._loadTriggers(levelDescriptor.offset, triggers, wrappedQfx);
    });
    $.getJSON('assets/world/' + levelDescriptor.handle + '/powerUps.json', function (powerUps) {
        pl._loadPowerUps(levelDescriptor.offset, powerUps, wrappedQfx);
    });
};

ACV.Core.PrefLoader.prototype._loadLayers = function (levelOffset, layers, qFx) {

    var layer, layerIndex;
    for (layerIndex in layers.background) {
        layer = layers.background[layerIndex];
        layer.prefs.offset += levelOffset;
        this.gameData.scene.layers.background.push(layer);
    }
    for (layerIndex in layers.foreground) {
        layer = layers.foreground[layerIndex];
        layer.prefs.offset += levelOffset;
        this.gameData.scene.layers.foreground.push(layer);
    }
    qFx.apply(this);
};

ACV.Core.PrefLoader.prototype._loadTriggers = function (levelOffset, triggers, qFx) {
    var triggerIndex;
    for (triggerIndex in triggers) {
        this.gameData.scene.triggers.push(triggers[triggerIndex]);
    }
    qFx.apply(this);
};

ACV.Core.PrefLoader.prototype._loadPowerUps = function (levelOffset, powerUps, qFx) {
    var powerUpIndex;
    for (powerUpIndex in powerUps) {
        this.gameData.scene.playerLayer.powerups.push(powerUps[powerUpIndex]);
    }
    qFx.apply(this);
};