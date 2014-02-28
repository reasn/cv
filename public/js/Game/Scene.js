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
    levels: []
});

ACV.Game.Scene.createFromData = function (element, data, performanceSettings) {
    var levels = [], playerLayer, triggerManager, i;
    playerLayer = ACV.Game.PlayerLayer.createFromData(data.playerLayer, performanceSettings);

    for (i in data.levels) {
        if (data.levels[i].enabled) {
            levels.push(ACV.Game.Level.createFromPrefs(data.levels[i]));
        }
    }

    triggerManager = ACV.Game.TriggerManager.createFromData(data.triggers, performanceSettings);
    return new ACV.Game.Scene(element, data.prefs, levels, playerLayer, triggerManager);
};

ACV.Game.Scene.prototype.init = function (viewportDimensions) {
    var i;

    this.element.css({
        bottom: 'auto',
        height: viewportDimensions.height
    });

    this.backgroundElement = $('<div class="level-wrapper background" />');
    this.foregroundElement = $('<div class="level-wrapper foreground" />')

    for (i in this.levels) {
        this.levels[i].init(this.backgroundElement, this.foregroundElement, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight);
    }

    // Reduce draw calls by adding everything to the DOM at last
    this.element.append(this.backgroundElement);
    this.playerLayer.init(this.element, this.prefs.width, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight, this);
    this.element.append(this.foregroundElement);
};

ACV.Game.Scene.prototype.updatePositions = function (ratio, ratioBefore, viewportDimensions) {
    var offset, offsetBefore, layerRatio, layerRatioBefore, speed, i;
    var sceneX = ratio * (this.prefs.width - viewportDimensions.width);
    var sceneXBefore = ratio * (this.prefs.width - viewportDimensions.width);
    if (viewportDimensions.changed) {
        this.element.css('height', viewportDimensions.height);
        this.log('new scene height: ' + viewportDimensions.height, 'd');
    }

    for (i in this.levels) {
        this.levels[i].updatePositions(sceneX, sceneXBefore, viewportDimensions);
    }

    if (viewportDimensions.changed) {
        this._handleViewportChange(viewportDimensions);
    }
    this.playerLayer.updatePositions(sceneX, viewportDimensions);

    //Check levels and automatically show them in the DOM if necessary
    //for(i in this.levels) {
//        if()
//    }
    $('#sceneX').text(sceneX);
};

ACV.Game.Scene.prototype.handleTriggers = function (playerX, sceneX) {
    this.triggerManager.check(playerX, sceneX);
};

ACV.Game.Scene.prototype._handleViewportChange = function (viewportDimensions) {
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
    this.log('Zooming to ' + targetScale + ' within ' + duration + 'ms');

    this.element.stop('zoom', true).animate({
        transform: 'scale(' + targetScale + ')'
    }, {
        queue: 'zoom',
        duration: duration
    }).dequeue('zoom');
};
