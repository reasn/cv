"use strict";

/**
 * @since 2014-02-28
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

ACV.Game.Level = function (handle, prefs, backgroundLayers, foregreoundLayers) {
    this.handle = handle;
    this.prefs = prefs;
    this.backgroundLayers = backgroundLayers;
    this.foregroundLayers = foregreoundLayers;
};

ACV.Game.Level.createFromPrefs = function (data) {

    var backgroundLayers = [], foregroundLayers = [], layerIndex, layer;

    for (layerIndex in data.layers.background) {
        layer = ACV.Game.Layer.createFromPrefs(data.layers.background[layerIndex]);
        layer.prefs.offset += data.prefs.offset;
        backgroundLayers.push(layer);
    }
    for (layerIndex in data.layers.foreground) {
        layer = ACV.Game.Layer.createFromPrefs(data.layers.foreground[layerIndex]);
        layer.prefs.offset += data.prefs.offset;
        foregroundLayers.push(layer);
    }

    return new ACV.Game.Level(data.handle, data.prefs, backgroundLayers, foregroundLayers);
};

ACV.Game.Level.prototype = ACV.Core.createPrototype('ACV.Game.Level',
    {
        handle: '',
        prefs: null,
        backgroundLayers: [],
        foregroundLayers: [],
        visible: false,
        foregroundElement: null,
        backgroundElement: null
    });

ACV.Game.Level.prototype.init = function (backgroundWrapper, foregroundWrapper, minHeight, maxHeight) {
    var i;

    this.foregroundElement = $('<div class="level" />');
    this.backgroundElement = $('<div class="level" />');

    for (i in this.backgroundLayers) {
        this.backgroundLayers[i].init(this.foregroundElement, minHeight, maxHeight);
    }
    for (i in this.foregroundLayers) {
        this.foregroundLayers[i].init(this.backgroundElement, minHeight, maxHeight);
    }
    //Add to DOM at last to reduce draw calls
    backgroundWrapper.prepend(this.foregroundElement);
    foregroundWrapper.append(this.backgroundElement);
    this.log('Level initialized with ' + this.foregroundLayers.length + ' foreground layers and ' + this.backgroundLayers.length + ' background layers', 'd');
};

/**
 *
 * @param int x The amount of pixels that already left the viewport on the left side. Positive integer
 * @param int width The width of the current viewport
 */
ACV.Game.Level.prototype.updatePositions = function (sceneX, sceneXBefore, viewportDimensions) {
    var i;

    var vX1 = this.prefs.offset + this.prefs.visibility.x1;
    var vX2 = this.prefs.offset + this.prefs.visibility.x2;

    if (this.visible && (sceneX < vX1 || sceneX > vX2)) {
        this.log('Hidding level ' + this.handle, 'i');
        this.visible = false;
        this.foregroundElement.removeClass('visible');
        this.backgroundElement.removeClass('visible');
    }


    var visibleLeft, visibleWidth;

    visibleLeft = this.prefs.offset + this.prefs.clip.x1 - sceneX;
    visibleWidth = this.prefs.offset + this.prefs.clip.x2 - sceneX;

    //if (visibleLeft >= 0) {
    if (visibleWidth > viewportDimensions.width)
        this.foregroundElement.css('width', '100%');
    else
        this.foregroundElement.css('width', Math.max(visibleWidth, 0));
    //}
    console.log(visibleLeft);


    if (!this.visible && (sceneX >= vX1 && sceneX <= vX2)) {
        this.log('Showing level ' + this.handle, 'i');
        this.visible = true;
        this.foregroundElement.addClass('visible');
        this.backgroundElement.addClass('visible');
    }

    for (i in this.backgroundLayers) {
        this.backgroundLayers[i].updatePositions(sceneX, sceneXBefore, viewportDimensions.width);
    }
    for (i in this.foregroundLayers) {
        this.foregroundLayers[i].updatePositions(sceneX, sceneXBefore, viewportDimensions.width);
    }
};
