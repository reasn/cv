"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

/**
 * @typedef {Object} LookAroundDistortion {{
 *   x: number
 *   y: number
 * }}
 */

/**
 *
 * @type {{
 *   _appContext: ACV.AppContext
 *   prefs: Object
 *   backgroundElement: jQuery,
 *   foregroundElement: jQuery,
 *   playerLayer: ACV.Game.PlayerLayer,
 *   triggerManager: ACV.Game.TriggerManager
 *   levels: Array.<ACV.Game.Level>,
 *   _sceneViewportDimensions: ViewportDimensions
 *   _x: number
 *   _xBefore: number,
 *   _lookAroundDistortion: LookAroundDistortion
 * }}
 * @param {ACV.AppContext} appContext
 * @param {jQuery} element
 * @param {Object} prefs
 * @param {Array.<ACV.Game.Level>} levels
 * @param {ACV.Game.PlayerLayer} playerLayer
 * @param {ACV.Game.TriggerManager} triggerManager
 */
ACV.Game.Scene = function (appContext, element, prefs, levels, playerLayer, triggerManager) {
    this._appContext = appContext;
    this.element = $(element);
    this.prefs = prefs;
    this.playerLayer = playerLayer;
    this.triggerManager = triggerManager;
    this.triggerManager.scene = this;
    this.levels = levels;
};

ACV.Game.Scene.prototype = ACV.Core.createPrototype('ACV.Game.Scene', {
    _appContext: null,
    prefs: {
        width: 0,
        dynamicViewport: {
            minHeight: 300
        }
    },
    backgroundElement: null,
    foregroundElement: null,
    playerLayer: null,
    triggerManager: null,
    levels: [],
    _sceneViewportDimensions: null,
    _lookAroundDistortion: {
        x: 0,
        y: 0
    },
    _x: 0,
    _xBefore: 0
});

/**
 *
 * @param {AppContext} appContext
 * @param {jQuery} element
 * @param {Object} data
 * @returns {ACV.Game.Scene}
 */
ACV.Game.Scene.createFromData = function (appContext, element, data) {
    var levels = [], playerLayer, triggerManager, levelIndex;

    playerLayer = ACV.Game.PlayerLayer.createFromData(appContext, data.playerLayer);

    for (levelIndex in data.levels) {
        if (data.levels[levelIndex].enabled) {
            levels.push(ACV.Game.Level.createFromPrefs(appContext, data.levels[levelIndex]));
        }
    }

    triggerManager = ACV.Game.TriggerManager.createFromData(data.triggers, appContext.performanceSettings);
    return new ACV.Game.Scene(appContext, element, data.prefs, levels, playerLayer, triggerManager);
};

/**
 *
 * @param {ViewportDimensions} appViewportDimensions
 * @param {ViewportDimensions} sceneViewportDimensions
 */
ACV.Game.Scene.prototype.init = function (appViewportDimensions, sceneViewportDimensions) {
    var levelIndex, scene = this;

    this._sceneViewportDimensions = sceneViewportDimensions;

    this.element.css({
        bottom: 'auto',
        height: this._sceneViewportDimensions.height
    });

    this.backgroundElement = $('<div class="level-wrapper background" />');
    this.foregroundElement = $('<div class="level-wrapper foreground" />');

    this.foregroundElement.on('click', function (event) {
        scene._handleClick(event.clientX);
    });

    if (this._appContext.performanceSettings.lookAroundDistortion) {
        $(document).on('mousemove', function (event) {
            /*
             * We use Math.floor() instead of Math.round() to obtain a
             * continuous distribution of the results and therefore
             * reduce (probably invisible) micro-flickering.
             */
            //scene._lookAroundDistortion.x = -Math.floor(scene._appContext.prefs.maxLookAroundDistortion * 2 * (event.clientX / scene._sceneViewportDimensions.width - .5));
            //scene._lookAroundDistortion.y = -Math.floor(scene._appContext.prefs.maxLookAroundDistortion * 2 * (event.clientY / scene._sceneViewportDimensions.height - .5));
            scene._lookAroundDistortion.x = -Math.floor(scene._appContext.prefs.maxLookAroundDistortion * 2 * (event.clientX / appViewportDimensions.width - .5));
            scene._lookAroundDistortion.y = -Math.floor(scene._appContext.prefs.maxLookAroundDistortion * 2 * (event.clientY / appViewportDimensions.height - .5));
            scene.applyLookAroundDistortion();
        });
    }

    for (levelIndex in this.levels) {
        this.levels[levelIndex].init(this, this.backgroundElement, this.foregroundElement, this.prefs.dynamicViewport.minHeight, this._lookAroundDistortion, sceneViewportDimensions);
    }

    // Reduce draw calls by adding everything to the DOM at last
    this.element.append(this.backgroundElement);
    this.playerLayer.init(this.element, this.prefs.width, this.prefs.dynamicViewport.minHeight, this._lookAroundDistortion);

    this._appContext.player.addMovementListener(function (playerX, playerXBefore, targetPlayerX, sceneX) {
        $('#playerX').text(playerX);
        scene.handleTriggers(playerX, playerXBefore, targetPlayerX, sceneX);
    });

    this.element.append(this.foregroundElement);
};

/**
 *
 * @param {number} clientX
 * @private
 */
ACV.Game.Scene.prototype._handleClick = function (clientX) {
    var targetX = this._x + clientX;

    this.info('User clicked, player will walk to %s', targetX);
    this.playerLayer.player.moveTo(targetX, this._x, 0.5, this._sceneViewportDimensions);
};

/**
 *
 * @since 2014-03-18
 */
ACV.Game.Scene.prototype.applyLookAroundDistortion = function () {
    var levelIndex;

    for (levelIndex in this.levels) {
        if (this.levels[levelIndex].visible) {
            this.levels[levelIndex].applyLookAroundDistortion();
        }
    }

    this.playerLayer.applyLookAroundDistortion()
};

/**
 *
 * @param {float} ratio
 * @param {float} ratioBefore
 */
ACV.Game.Scene.prototype.updatePositions = function (ratio, ratioBefore) {
    var levelIndex;

    this._x = ratio * (this.prefs.width - this._sceneViewportDimensions.width);
    this._xBefore = ratio * (this.prefs.width - this._sceneViewportDimensions.width);

    if (this._sceneViewportDimensions.heightChanged) {
        this.element.css('height', this._sceneViewportDimensions.height);
        this.debug('New scene height: %s', this._sceneViewportDimensions.height);
    }

    for (levelIndex in this.levels) {
        this.levels[levelIndex].updatePositions(this._x, this._xBefore, this._sceneViewportDimensions);
    }

    if (this._sceneViewportDimensions.widthChanged || this._sceneViewportDimensions.heightChanged) {
        this._handleViewportChange(this._sceneViewportDimensions);
    }
    this.playerLayer.updatePositions(this._x, this._sceneViewportDimensions);

    //TODO remove:
    $('#sceneX').text(this._x);
};

/**
 *
 * @param {number} playerX
 * @param {number} playerXBefore
 * @param {number} targetPlayerX
 * @param {number} sceneX
 */
ACV.Game.Scene.prototype.handleTriggers = function (playerX, playerXBefore, targetPlayerX, sceneX) {
    this.triggerManager.check(playerX, playerXBefore, targetPlayerX, sceneX);
};

/**
 * @private
 */
ACV.Game.Scene.prototype._handleViewportChange = function () {
    var levelIndex, layerIndex, elementsToAlter;


    elementsToAlter = this.playerLayer.element;

    for (levelIndex in this.levels) {

        for (layerIndex in this.levels[levelIndex].backgroundLayers) {
            elementsToAlter = elementsToAlter.add(this.levels[levelIndex].backgroundLayers[layerIndex].element);
        }
        for (layerIndex in this.levels[levelIndex].foregroundLayers) {
            elementsToAlter = elementsToAlter.add(this.levels[levelIndex].foregroundLayers[layerIndex].element);
        }
    }

    if (this._sceneViewportDimensions.height < this.prefs.dynamicViewport.minHeight) {
        elementsToAlter.css('top', Math.round(-.5 * (this.prefs.dynamicViewport.minHeight - this._sceneViewportDimensions.height)) + 'px');

    } else {
        elementsToAlter.css('top', 0);
    }
};
