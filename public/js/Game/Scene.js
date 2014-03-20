"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

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
 *   _viewportDimensions: ViewportDimensions
 *   _x: number
 *   _xBefore: number
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
            minHeight: 300,
            maxHeight: 1000
        }
    },
    backgroundElement: null,
    foregroundElement: null,
    playerLayer: null,
    triggerManager: null,
    levels: [],
    _viewportDimensions: null,
    _x: 0,
    _xBefore: 0
});

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

ACV.Game.Scene.prototype.init = function (viewportDimensions) {
    var levelIndex;
    var scene = this;

    this._viewportDimensions = viewportDimensions;

    this.element.css({
        bottom: 'auto',
        height: this._viewportDimensions.height
    });

    this.backgroundElement = $('<div class="level-wrapper background" />');
    this.foregroundElement = $('<div class="level-wrapper foreground" />');

    this.foregroundElement.on('click', function (event) {
        scene._handleClick(event.clientX);
    });

    if (this._appContext.performanceSettings.lookAroundDistortion) {
        this.foregroundElement.on('mousemove', function (event) {
            scene._handleMouseMove(event.clientX, event.clientY);
        });
    }

    for (levelIndex in this.levels) {
        this.levels[levelIndex].init(this, this.backgroundElement, this.foregroundElement, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight);
    }

    // Reduce draw calls by adding everything to the DOM at last
    this.element.append(this.backgroundElement);
    this.playerLayer.init(this.element, this.prefs.width, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight, this);

    this._appContext.player.addMovementListener(function (playerX, playerXBefore, targetPlayerX, sceneX) {
        $('#playerX').text(playerX);
        scene.handleTriggers(playerX, targetPlayerX, sceneX);
    });

    this.element.append(this.foregroundElement);
};

ACV.Game.Scene.prototype._handleClick = function (clientX) {
    var targetX = this._x + clientX;
    this.info('User clicked, player will walk to %s', targetX);
    this.playerLayer.player.moveTo(targetX, this._x, 0.5, this._viewportDimensions);
};

/**
 *
 * @param {number} clientX
 * @param {number} clientY
 * @private
 * @since 2014-03-18
 */
ACV.Game.Scene.prototype._handleMouseMove = function (clientX, clientY) {
    var levelIndex, x, y;

    x = -Math.round(this.prefs.lookAroundDistortionIntensity * 2 * (clientX / this._viewportDimensions.width - .5));
    y = -Math.round(this.prefs.lookAroundDistortionIntensity * 2 * (clientY / this._viewportDimensions.height - .5));

    for (levelIndex in this.levels) {
        if (this.levels[levelIndex].visible) {
            this.levels[levelIndex].applyLookAroundDistortion(x, y);
        }
    }
    this.playerLayer.applyLookAroundDistortion(x, y)
};

ACV.Game.Scene.prototype.updatePositions = function (ratio, ratioBefore) {
    var levelIndex;
    this._x = ratio * (this.prefs.width - this._viewportDimensions.width);
    this._xBefore = ratio * (this.prefs.width - this._viewportDimensions.width);

    if (this._viewportDimensions.changed) {
        this.element.css('height', this._viewportDimensions.height);
        this.debug('New scene height: %s', this._viewportDimensions.height);
    }

    for (levelIndex in this.levels) {
        this.levels[levelIndex].updatePositions(this._x, this._xBefore, this._viewportDimensions);
    }

    if (this._viewportDimensions.changed) {
        this._handleViewportChange(this._viewportDimensions);
    }
    this.playerLayer.updatePositions(this._x, this._viewportDimensions);

    //TODO remove:
    $('#sceneX').text(this._x);
};

ACV.Game.Scene.prototype.handleTriggers = function (playerX, targetPlayerX, sceneX) {
    this.triggerManager.check(playerX, targetPlayerX, sceneX);
};

ACV.Game.Scene.prototype._handleViewportChange = function () {
    var levelIndex, layerIndex;
    var elementsToAlter = this.playerLayer.element;


    for (levelIndex in this.levels) {

        for (layerIndex in this.levels[levelIndex].backgroundLayers) {
            elementsToAlter = elementsToAlter.add(this.levels[levelIndex].backgroundLayers[layerIndex].element);
        }
        for (layerIndex in this.levels[levelIndex].foregroundLayers) {
            elementsToAlter = elementsToAlter.add(this.levels[levelIndex].foregroundLayers[layerIndex].element);
        }
    }

    if (this._viewportDimensions.height < this.prefs.dynamicViewport.minHeight) {
        elementsToAlter.css('top', Math.round(-.5
            * (this.prefs.dynamicViewport.minHeight - this._viewportDimensions.height))
            + 'px');

    } else if (this._viewportDimensions.height > this.prefs.dynamicViewport.maxHeight) {
        elementsToAlter.css('top', Math
            .round(.5 * (this._viewportDimensions.height - this.prefs.dynamicViewport.maxHeight))
            + 'px');

    } else {
        elementsToAlter.css('top', 0);
    }
};
