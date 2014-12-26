"use strict";

/**
 * @since 2014-02-26
 */

var ACV = ACV ? ACV : {};
ACV.Core = ACV.Core ? ACV.Core : {};
ACV.Core.PrefLoader = {};

/**
 * Default constructor.
 *
 * @constructor
 */
ACV.Core.PrefLoader = function () {
};


ACV.Core.PrefLoader.prototype = ACV.Core.createPrototype('ACV.Core.PrefLoader',
    {
        gameData: null
    });

ACV.Core.PrefLoader.FORCE_UNCACHED_DATA = true;

/**
 * Loads general game data and dependent resources for all levels via asynchronous requests to the server.
 *
 * @param {function(this:ACV.Core.PrefLoader, object)} qFx The function to be called when loading is complete
 * @returns void
 * @version 2014-02-28
 * @since 2014-02-28
 * @author Alexander Thiel
 */
ACV.Core.PrefLoader.prototype.load = function (qFx) {
    var pl = this;
    $.getJSON(this._createUrl('game.json'), function (gameData) {
        pl.gameData = gameData;

        pl._loadLevels(gameData.scene.levels, function () {
            pl.info('Preferences and levels loaded.');
            qFx.apply(pl, [pl.gameData]);
        });
    });
};

/**
 * Loads all levels as described in the given array of level descriptors.
 *
 * @param {string} url The url to enhance.
 * @returns string
 * @private
 * @version 2014-02-28
 * @since 2014-02-28
 * @author Alexander Thiel
 */
ACV.Core.PrefLoader.prototype._createUrl = function (url) {
    url = 'assets/' + url;
    if (ACV.Core.PrefLoader.FORCE_UNCACHED_DATA)
        url += '?timestamp=' + (new Date()).getTime();
    return url;
};

/**
 * Loads all levels as described in the given array of level descriptors.
 *
 * @param {Array.<object>} levels The level descriptors
 * @param {function(this:ACV.Core.PrefLoader, object)} qFx
 * @returns void
 * @private
 * @version 2014-02-28
 * @since 2014-02-28
 * @author Alexander Thiel
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

/**
 * Loads dependent resources for a given level
 *
 * @param {object} level
 * @param {function(this:ACV.Core.PrefLoader)} qFx
 * @returns void
 * @private
 * @version 2014-02-28
 * @since 2014-02-28
 * @author Alexander Thiel
 */
ACV.Core.PrefLoader.prototype._loadLevel = function (level, qFx) {
    var pl = this, filesToLoad = 4;

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
    $.get(this._createUrl('map/' + level.handle + '/animations.js'), function (animationSource) {
        pl._loadAnimations(level, animationSource, wrappedQfx);
    });
};

/**
 * Loads all trgiggers for a specific level.
 *
 * @param {number} levelOffset
 * @param {Array.<object>} triggers
 * @param {function(this:ACV.Core.PrefLoader)} qFx
 * @returns void
 * @private
 * @version 2014-02-28
 * @since 2014-02-28
 * @author Alexander Thiel
 */
ACV.Core.PrefLoader.prototype._loadTriggers = function (levelOffset, triggers, qFx) {
    var triggerIndex;
    for (triggerIndex in triggers) {
        this.gameData.scene.triggers.push(triggers[triggerIndex]);
    }
    qFx.apply(this);
};

/**
 * Loads all power ups for a specific level.
 *
 * @param {number} levelOffset
 * @param {Array.<object>} powerUps
 * @param {function(this:ACV.Core.PrefLoader)} qFx
 * @returns void
 * @private
 * @version 2014-02-28
 * @since 2014-02-28
 * @author Alexander Thiel
 */
ACV.Core.PrefLoader.prototype._loadPowerUps = function (levelOffset, powerUps, qFx) {
    var powerUpIndex;
    for (powerUpIndex in powerUps) {
        this.gameData.scene.playerLayer.powerUps.push(powerUps[powerUpIndex]);
    }
    qFx.apply(this);
};

/**
 * Loads animations consisting of parameters and function bodies.
 *
 * This function uses "new Function" instead of "eval" as a security measure in order
 * to make sure that the code executed cannot get a reference to any of the game's objects.
 *
 * @param {object} level
 * @param {string} animationSource
 * @param {function(this:ACV.Core.PrefLoader)} qFx
 * @returns void
 * @private
 * @version 2014-03-05
 * @since 2014-03-05
 * @author Alexander Thiel
 */
ACV.Core.PrefLoader.prototype._loadAnimations = function (level, animationSource, qFx) {
    var customScope, animations;

    customScope = new Function([], animationSource + 'return animations;');
    level.animations = customScope.apply(null);
    qFx.apply(this);
};