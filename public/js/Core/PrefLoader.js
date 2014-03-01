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

ACV.Core.PrefLoader.FORCE_UNCACHED_DATA = true;

ACV.Core.PrefLoader.prototype.load = function (qFx) {
    var pl = this;
    $.getJSON(this._createUrl('game.json'), function (gameData) {
        pl.gameData = gameData;

        pl._loadLevels(gameData.scene.levels, function () {
            this.info('Preferences and levels loaded.');
            qFx(this.gameData);
        });
    });
};

ACV.Core.PrefLoader.prototype._createUrl = function (url) {
    url = 'assets/' + url;
    if (ACV.Core.PrefLoader.FORCE_UNCACHED_DATA)
        url += '?timestamp=' + (new Date()).getTime();
    return url;
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
        qFx.apply(this);
        return;
    }

    this.info('Loading level ' + level.handle, 'i');

    var wrappedQfx = function () {
        if (--filesToLoad === 0) {
            qFx.apply(this);
        }
    };

    $.getJSON(this._createUrl('map/' + level.handle + '/layers.json'), function (layers) {
        level.layers = layers;
        wrappedQfx.apply(pl);
    });

    $.getJSON(this._createUrl('map/' + level.handle + '/triggers.json'), function (triggers) {
        pl._loadTriggers(level.prefs.offset, triggers, wrappedQfx);
    });
    $.getJSON(this._createUrl('map/' + level.handle + '/powerUps.json'), function (powerUps) {
        pl._loadPowerUps(level.prefs.offset, powerUps, wrappedQfx);
    });
};

ACV.Core.PrefLoader.prototype._loadTriggers = function (levelOffset, triggers, qFx) {
    var triggerIndex, trigger;
    for (triggerIndex in triggers) {
        trigger = triggers[triggerIndex];
        //TODO make cleaner
        trigger.playerX = trigger.playerX.substr(0, 1) + (levelOffset + parseInt(trigger.playerX.substr(1)));
        this.gameData.scene.triggers.push(trigger);
    }
    qFx.apply(this);
};

ACV.Core.PrefLoader.prototype._loadPowerUps = function (levelOffset, powerUps, qFx) {
    var powerUpIndex;
    for (powerUpIndex in powerUps) {
        this.gameData.scene.playerLayer.powerUps.push(powerUps[powerUpIndex]);
    }
    qFx.apply(this);
};