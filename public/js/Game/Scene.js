"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

/**
 *
 * @param {Object}
 *            element
 * @param {Object}
 *            prefs
 * @param {ACV.Game.PlayerLayer}
 *            PlayerLayer
 * @param ACV.Game.Layer[]
 *            layers
 */
ACV.Game.Scene = function (element, prefs, playerLayer, backgroundLayers, foregroundLayers, triggerManager) {
    this.element = $(element);
    this.prefs = prefs;
    this.playerLayer = playerLayer;
    this.backgroundLayers = backgroundLayers;
    this.foregroundLayers = foregroundLayers;
    this.triggerManager = triggerManager;
    this.triggerManager.scene = this;
};

ACV.Game.Scene.prototype = ACV.Core.createPrototype('ACV.Game.Scene', {
    prefs: {
        width: 0,
        dynamicViewport: {
            minHeight: 300,
            maxHeight: 1000
        }
    },
    playerLayer: null,
    backgroundLayers: [],
    foregroundLayers: [],
    triggerManager: null
});

ACV.Game.Scene.createFromData = function (element, data, performanceSettings) {
    var playerLayer, backgroundLayers = [], foregroundLayers = [], triggerManager, i;
    playerLayer = ACV.Game.PlayerLayer.createFromData(data.playerLayer, performanceSettings);

    for (i in data.layers.background) {
        backgroundLayers.push(new ACV.Game.Layer.createFromPrefs(data.layers.background[i]));
    }
    for (i in data.layers.foreground) {
        foregroundLayers.push(new ACV.Game.Layer.createFromPrefs(data.layers.foreground[i]));
    }

    triggerManager = ACV.Game.TriggerManager.createFromData(data.triggers, performanceSettings);
    return new ACV.Game.Scene(element, data.prefs, playerLayer, backgroundLayers, foregroundLayers, triggerManager);
};

ACV.Game.Scene.prototype.init = function (sceneDimensions) {
    var instance = this;

    this.element.css({
        bottom: 'auto',
        height: sceneDimensions.height
    });
    for (var i in this.backgroundLayers) {
        this.backgroundLayers[i].init(this.element, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight);
    }
    this.playerLayer.init(this.element, this.prefs.width, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight, this);

    for (var i in this.foregroundLayers) {
        this.foregroundLayers[i].init(this.element, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight);
    }

};

ACV.Game.Scene.prototype.updatePositions = function (ratio, ratioBefore, sceneDimensions) {
    var offset, offsetBefore, layerRatio, layerRatioBefore, speed;
    var sceneX = ratio * (this.prefs.width - sceneDimensions.width);
    var sceneXBefore = ratio * (this.prefs.width - sceneDimensions.width);
    if (sceneDimensions.changed) {
        this.element.css('height', sceneDimensions.height);
        this.log('new scene height: ' + sceneDimensions.height, 'd');
    }

    for (var i in this.backgroundLayers) {
        this.backgroundLayers[i].updatePositions(sceneX, sceneXBefore, sceneDimensions.width);
    }
    for (var i in this.foregroundLayers) {
        this.foregroundLayers[i].updatePositions(sceneX, sceneXBefore, sceneDimensions.width);
    }

    if (sceneDimensions.changed) {
        this._handleViewportChange(sceneDimensions);
    }
    this.playerLayer.updatePositions(sceneX, sceneDimensions);
    $('#sceneX').text(sceneX);
};

ACV.Game.Scene.prototype.handleTriggers = function (playerX, sceneX) {
    this.triggerManager.check(playerX, sceneX);
};

ACV.Game.Scene.prototype._handleViewportChange = function (sceneDimensions) {
    var elementsToAlter = this.playerLayer.element;
    for (var i in this.backgroundLayers) {
        elementsToAlter = elementsToAlter.add(this.backgroundLayers[i].element);
    }
    for (var i in this.foregroundLayers) {
        elementsToAlter = elementsToAlter.add(this.foregroundLayers[i].element);
    }

    if (sceneDimensions.height < this.prefs.dynamicViewport.minHeight) {
        elementsToAlter.css('top', Math.round(-.5
            * (this.prefs.dynamicViewport.minHeight - sceneDimensions.height))
            + 'px');

    } else if (sceneDimensions.height > this.prefs.dynamicViewport.maxHeight) {
        elementsToAlter.css('top', Math
            .round(.5 * (sceneDimensions.height - this.prefs.dynamicViewport.maxHeight))
            + 'px');

    } else {
        elementsToAlter.css('top', 0);
    }
};

ACV.Game.Scene.prototype.startZoom = function (targetScale, duration) {
    this.log('Zooming to ' + targetScale + ' within ' + duration + 'ms');

    this.element.stop('zoom', true).animate({
        transform: 'scale(' + targetScale + ')'
    }, {
        queue: 'zoom',
        duration: duration
    }).dequeue('zoom');
};
