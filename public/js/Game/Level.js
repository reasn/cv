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
    var layerIndex;

    this.foregroundElement = $('<div class="level" data-handle="' + this.handle + '" />');
    this.foregroundElement.css('max-width', this.prefs.clip.x2, 0);


    this.backgroundElement = $('<div class="level" data-handle="' + this.handle + '" />');
    this.backgroundElement.css('max-width', this.prefs.clip.x2, 0);

    for (layerIndex in this.backgroundLayers) {
        this.backgroundLayers[layerIndex].init(this.backgroundElement, minHeight, maxHeight);
    }
    for (layerIndex in this.foregroundLayers) {
        this.foregroundLayers[layerIndex].init(this.foregroundElement, minHeight, maxHeight);
    }
    //Add to DOM at last to reduce draw calls
    backgroundWrapper.append(this.backgroundElement);
    foregroundWrapper.append(this.foregroundElement);
    this.info('Level initialized with ' + this.foregroundLayers.length + ' foreground layers and ' + this.backgroundLayers.length + ' background layers', 'd');
};

/**
 *
 * @param int x The amount of pixels that already left the viewport on the left side. Positive integer
 * @param int width The width of the current viewport
 */
ACV.Game.Level.prototype.updatePositions = function (sceneX, sceneXBefore, viewportDimensions) {
    var layerIndex;
    var distanceBetweenLeftViewportMarginAndLevelBegin;
    var showLevelSceneX = this.prefs.offset + this.prefs.visibility.x1;
    var hideLevelSceneX = this.prefs.offset + this.prefs.visibility.x2;

    if (this.visible && (sceneX < showLevelSceneX || sceneX > hideLevelSceneX)) {
        this.info('Hiding level ' + this.handle, 'i');
        this.visible = false;
        this.foregroundElement.removeClass('visible');
        this.backgroundElement.removeClass('visible');
    }

    distanceBetweenLeftViewportMarginAndLevelBegin = this.prefs.offset - sceneX + this.prefs.clip.x1;

    this.backgroundElement.css('margin-left', distanceBetweenLeftViewportMarginAndLevelBegin + 'px');
    this.foregroundElement.css('margin-left', distanceBetweenLeftViewportMarginAndLevelBegin + 'px');

    if (!this.visible && (sceneX >= showLevelSceneX && sceneX <= hideLevelSceneX)) {
        this.info('Showing level ' + this.handle, 'i');
        this.visible = true;
        this.foregroundElement.addClass('visible');
        this.backgroundElement.addClass('visible');
    }

    for (layerIndex in this.backgroundLayers) {
        this.backgroundLayers[layerIndex].updatePositions(sceneX, sceneXBefore, distanceBetweenLeftViewportMarginAndLevelBegin, viewportDimensions.width);
    }
    for (layerIndex in this.foregroundLayers) {
        this.foregroundLayers[layerIndex].updatePositions(sceneX, sceneXBefore, distanceBetweenLeftViewportMarginAndLevelBegin, viewportDimensions.width);
    }
};
