"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

/**
 *
 * @param {Object} element
 * @param {Object} prefs
 * @param {ACV.Game.Foreground} Foreground
 * @param ACV.Game.Layer[] layers
 */
ACV.Game.Scene = function(element, prefs, foreground, layers, triggerManager)
{
    this.element = $(element);
    this.prefs = prefs;
    this.foreground = foreground;
    this.layers = layers;
    this.triggerManager = triggerManager;
    this.triggerManager.scene = this;
};

ACV.Game.Scene.prototype = ACV.Core.createPrototype('ACV.Game.Scene',
{
    prefs:
    {
        width: 0,
        dynamicViewport:
        {
            minHeight: 300,
            maxHeight: 1000
        }
    },
    foreground: null,
    layers: [],
    triggerManager: null
});

ACV.Game.Scene.createFromData = function(element, data)
{
    var foreground, layers = [], triggerManager;
    foreground = new ACV.Game.Foreground.createFromData(data.foreground);

    for (var i in data.layers)
    {
        layers.push(new ACV.Game.Layer.createFromPrefs(data.layers[i]));
    }
    triggerManager = ACV.Game.TriggerManager.createFromData(data.triggers);
    return new ACV.Game.Scene(element, data.prefs, foreground, layers, triggerManager);
};

ACV.Game.Scene.prototype.init = function(sceneDimensions)
{
    var instance = this;

    this.element.css(
    {
        bottom: 'auto',
        height: sceneDimensions.height
    });
    for (var i in this.layers)
    {
        this.layers[i].init(this.element, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight);
        if (this.layers[i].prefs.justBehindPlayerLayer === true)
            this.foreground.init(this.layers[i].element, this.prefs.width, this.prefs.dynamicViewport.minHeight, this.prefs.dynamicViewport.maxHeight, this);
    }

};

ACV.Game.Scene.prototype.updatePositions = function(ratio, ratioBefore, sceneDimensions)
{
    var offset, offsetBefore, layerRatio, layerRatioBefore, speed;
    var sceneX = ratio * (this.prefs.width - sceneDimensions.width);
    var sceneXBefore = ratio * (this.prefs.width - sceneDimensions.width);
    if (sceneDimensions.changed)
    {
        this.element.css('height', sceneDimensions.height);
        this.log('new scene height: ' + sceneDimensions.height, 'd');
    }

    for (var i in this.layers)
    {
        this.layers[i].updatePositions(sceneX, sceneXBefore, sceneDimensions.width);
    }

    if (sceneDimensions.changed)
    {
        this._handleViewportChange(sceneDimensions);
    }
    this.foreground.updatePositions(sceneX, sceneDimensions);
    $('#sceneX').text(sceneX);
};

ACV.Game.Scene.prototype.handleTriggers = function(playerX, sceneX)
{
    this.triggerManager.check(playerX, sceneX);
};

ACV.Game.Scene.prototype._handleViewportChange = function(sceneDimensions)
{
    var elementsToAlter = this.foreground.element;
    for (var i in this.layers)
    {
        elementsToAlter = elementsToAlter.add(this.layers[i].element);
    }

    if (sceneDimensions.height < this.prefs.dynamicViewport.minHeight)
    {
        elementsToAlter.css('top', Math.round(-.5 * (this.prefs.dynamicViewport.minHeight - sceneDimensions.height )) + 'px');

    } else if (sceneDimensions.height > this.prefs.dynamicViewport.maxHeight)
    {
        elementsToAlter.css('top', Math.round(.5 * (sceneDimensions.height - this.prefs.dynamicViewport.maxHeight )) + 'px');

    } else
    {
        elementsToAlter.css('top', 0);
    }
};
