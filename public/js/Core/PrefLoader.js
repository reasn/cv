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
            this.info('Preferences and levels loaded.');
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
    var levelIndex = 0;
    this.info('Loading ' + levels.length + ' levels.');

    loadNextLevel = function () {

        pl._loadLevel(levels[levelIndex], function () {

            if (++levelIndex < levels.length) {
                loadNextLevel();
            } else {
                qFx.apply(this, [pl.gameData]);
            }
        });
    };
    loadNextLevel();
};
ACV.Core.PrefLoader.prototype._loadLevel = function (level, qFx) {
    var pl = this, filesToLoad = 3;

    if (!level.enabled) {
        this.info('Loading level ' + level.handle + ' because it is disabled.', 'i');
    }

    this.info('Loading level ' + level.handle, 'i');

    var wrappedQfx = function () {
        if (--filesToLoad === 0) {
            qFx.apply(this);
        }
    };

    $.getJSON('assets/world/' + level.handle + '/layers.json', function (layers) {
        level.layers = layers;
        wrappedQfx.apply(pl);
    });

    $.getJSON('assets/world/' + level.handle + '/triggers.json', function (triggers) {
        pl._loadTriggers(level.offset, triggers, wrappedQfx);
    });
    $.getJSON('assets/world/' + level.handle + '/powerUps.json', function (powerUps) {
        pl._loadPowerUps(level.offset, powerUps, wrappedQfx);
    });
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