"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

/**
 *
 * @type {{
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
 *
 * @param {jQuery} element
 * @param {Object} prefs
 * @param {Array.<ACV.Game.Level>} levels
 * @param {ACV.Game.PlayerLayer} playerLayer
 * @param {ACV.Game.TriggerManager} triggerManager
 */
ACV.Game.Scene = function (element, prefs, levels, playerLayer, triggerManager) {
    this.element = $(element);
    this.prefs = prefs;
    this.playerLayer = playerLayer;
    this.triggerManager = triggerManager;
    this.triggerManager.scene = this;
    this.levels = levels;
};

ACV.Game.Scene.prototype = ACV.Core.createPrototype('ACV.Game.Scene', {
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

ACV.Game.Scene.createFromData = function (element, data, performanceSettings) {
    var levels = [], playerLayer, triggerManager, levelIndex;
    playerLayer = ACV.Game.PlayerLayer.createFromData(data.playerLayer, performanceSettings);

    for (levelIndex in data.levels) {
        if (data.levels[levelIndex].enabled) {
            levels.push(ACV.Game.Level.createFromPrefs(data.levels[levelIndex]));
        }
    }

    triggerManager = ACV.Game.TriggerManager.createFromData(data.triggers, performanceSettings);
    return new ACV.Game.Scene(element, data.prefs, levels, playerLayer, triggerManager);
};

ACV.Game.Scene.prototype.init = function (viewportDimensions) {
    var levelIndex;
    var scene = this;

    this.element.css({
        bottom: 'auto',
        height: viewportDimensions.height
    });

    this.backgroundElement = $('<div class="level-wrapper background" />');
    this.foregroundElement = $('<div class="level-wrapper foreground" />');

    this.foregroundElement.on('click', function (event) {
        scene._handleClick(event.clientX);
    });

    for (levelIndex in this.levels) {
        this.levels[levelIndex].init(this, this.backgroundElement, this.foregroundElement, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight);
    }

    // Reduce draw calls by adding everything to the DOM at last
    this.element.append(this.backgroundElement);
    this.playerLayer.init(this.element, this.prefs.width, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight, this);
    this.element.append(this.foregroundElement);
};

ACV.Game.Scene.prototype._handleClick = function (clientX) {
    var targetX = this._x + clientX;
    this.info('User clicked, player will walk to %s', targetX);
    this.playerLayer.player.moveTo(targetX, this._x, 0.5, this._viewportDimensions);
};

ACV.Game.Scene.prototype.updatePositions = function (ratio, ratioBefore, viewportDimensions) {
    var levelIndex;
    this._x = ratio * (this.prefs.width - viewportDimensions.width);
    this._xBefore = ratio * (this.prefs.width - viewportDimensions.width);

    if (viewportDimensions.changed) {
        this.element.css('height', viewportDimensions.height);
        this.debug('New scene height: %s', viewportDimensions.height);
    }

    for (levelIndex in this.levels) {
        this.levels[levelIndex].updatePositions(this._x, this._xBefore, viewportDimensions);
    }

    if (viewportDimensions.changed) {
        this._handleViewportChange(viewportDimensions);
    }
    this.playerLayer.updatePositions(this._x, viewportDimensions);

    //TODO remove:
    $('#sceneX').text(this._x);
};

ACV.Game.Scene.prototype.handleTriggers = function (playerX, targetPlayerX, sceneX) {
    this.triggerManager.check(playerX, targetPlayerX, sceneX);
};

ACV.Game.Scene.prototype._handleViewportChange = function (viewportDimensions) {
    var levelIndex, layerIndex;
    var elementsToAlter = this.playerLayer.element;

    this._viewportDimensions = viewportDimensions;

    for (levelIndex in this.levels) {

        for (layerIndex in this.levels[levelIndex].backgroundLayers) {
            elementsToAlter = elementsToAlter.add(this.levels[levelIndex].backgroundLayers[layerIndex].element);
        }
        for (layerIndex in this.levels[levelIndex].foregroundLayers) {
            elementsToAlter = elementsToAlter.add(this.levels[levelIndex].foregroundLayers[layerIndex].element);
        }
    }

    if (viewportDimensions.height < this.prefs.dynamicViewport.minHeight) {
        elementsToAlter.css('top', Math.round(-.5
            * (this.prefs.dynamicViewport.minHeight - viewportDimensions.height))
            + 'px');

    } else if (viewportDimensions.height > this.prefs.dynamicViewport.maxHeight) {
        elementsToAlter.css('top', Math
            .round(.5 * (viewportDimensions.height - this.prefs.dynamicViewport.maxHeight))
            + 'px');

    } else {
        elementsToAlter.css('top', 0);
    }
};

ACV.Game.Scene.prototype.startZoom = function (targetScale, duration) {
    this.debug('Zooming to %s within %sms', targetScale, duration);

    this.element.stop('zoom', true).animate({
        transform: 'scale(' + targetScale + ')'
    }, {
        queue: 'zoom',
        duration: duration
    }).dequeue('zoom');
};
