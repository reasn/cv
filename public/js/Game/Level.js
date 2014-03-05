"use strict";

/**
 * @since 2014-02-28
 */

/**
 *
 * @name ViewportDimensions
 * @type {Object}
 * @property {number} width - the viewport's width
 * @property {number} height - the viewport's height
 * @property {boolean} changed - A flag whether the viewport has just changed
 */

var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

ACV.Game.Level = function (handle, prefs, animations, backgroundLayers, foregreoundLayers) {
    this.handle = handle;
    this.prefs = prefs;
    this.animations = animations;
    this.backgroundLayers = backgroundLayers;
    this.foregroundLayers = foregreoundLayers;
    this._animationScope = new ACV.Game.AnimationScope(this);
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

    return new ACV.Game.Level(data.handle, data.prefs, data.animations, backgroundLayers, foregroundLayers);
};

ACV.Game.Level.prototype = ACV.Core.createPrototype('ACV.Game.Level',
    {
        handle: '',
        prefs: null,
        backgroundLayers: [],
        foregroundLayers: [],
        visible: false,
        foregroundElement: null,
        backgroundElement: null,
        _animationScope: null
    });
/**
 *
 * @param {HTMLElement} backgroundWrapper
 * @param {HTMLElement} foregroundWrapper
 * @param {!number} minHeight
 * @param {!number} maxHeight
 * @returns void
 */
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
 * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {!number} sceneXBefore
 * @param {ViewportDimensions} viewportDimensions
 * @returns void
 */
ACV.Game.Level.prototype.updatePositions = function (sceneX, sceneXBefore, viewportDimensions) {

    this._updateVisibility(sceneX);
    this._applyClippingAndUpdateLayerPositions(sceneX, sceneXBefore, viewportDimensions);
    this._handleAnimations(sceneX, sceneXBefore, viewportDimensions);
};


/**
 * Hides or shows the level if appropriate.
 *
 * @param {number} sceneX
 * @returns void
 * @private
 * @version 2014-03-05
 * @since 2014-03-05
 * @author Alexander Thiel
 */
ACV.Game.Level.prototype._updateVisibility = function (sceneX) {
    var showLevelSceneX = this.prefs.offset + this.prefs.visibility.x1;
    var hideLevelSceneX = this.prefs.offset + this.prefs.visibility.x2;

    if (this.visible && (sceneX < showLevelSceneX || sceneX > hideLevelSceneX)) {
        this.info('Hiding level ' + this.handle, 'i');
        this.visible = false;
        this.foregroundElement.removeClass('visible');
        this.backgroundElement.removeClass('visible');

    } else if (!this.visible && (sceneX >= showLevelSceneX && sceneX <= hideLevelSceneX)) {
        this.info('Showing level ' + this.handle, 'i');
        this.visible = true;
        this.foregroundElement.addClass('visible');
        this.backgroundElement.addClass('visible');
    }
};


/**
 * Apply clipping to the left and right
 * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {!number} sceneXBefore
 * @param {ViewportDimensions} viewportDimensions
 * @returns void
 * @private
 * @version 2014-03-05
 * @since 2014-03-05
 * @author Alexander Thiel
 */
ACV.Game.Level.prototype._applyClippingAndUpdateLayerPositions = function (sceneX, sceneXBefore, viewportDimensions) {
    var layerIndex, distanceBetweenLeftViewportMarginAndLevelBegin;

    distanceBetweenLeftViewportMarginAndLevelBegin = this.prefs.offset - sceneX + this.prefs.clip.x1;

    this.backgroundElement.css('margin-left', distanceBetweenLeftViewportMarginAndLevelBegin + 'px');
    this.foregroundElement.css('margin-left', distanceBetweenLeftViewportMarginAndLevelBegin + 'px');

    for (layerIndex in this.backgroundLayers) {
        this.backgroundLayers[layerIndex].updatePositions(sceneX, sceneXBefore, distanceBetweenLeftViewportMarginAndLevelBegin);
    }
    for (layerIndex in this.foregroundLayers) {
        this.foregroundLayers[layerIndex].updatePositions(sceneX, sceneXBefore, distanceBetweenLeftViewportMarginAndLevelBegin);
    }
};


/**
 * Handle animations.
 * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {!number} sceneXBefore
 * @param {ViewportDimensions} viewportDimensions
 * @returns void
 * @private
 * @version 2014-03-05
 * @since 2014-03-05
 * @author Alexander Thiel
 */
ACV.Game.Level.prototype._handleAnimations = function (sceneX, sceneXBefore, viewportDimensions) {

    var animationIndex, animation, coarseLevelX;
    this._animationScope.levelX = sceneX - this.prefs.offset;
    this._animationScope.levelXBefore = sceneXBefore - this.prefs.offset;
    this._animationScope.viewportDimensions = viewportDimensions;


    //handle animations that are dependent on levelX
    for (animationIndex in this.animations.levelDependent) {
        animation = this.animations.levelDependent[animationIndex];
        coarseLevelX = Math.round(this._animationScope.levelX / animation.granularity);

        if (animation.lastCoarseLevelX === undefined || coarseLevelX !== animation.lastCoarseLevelX) {
            this._animationScope.firstInvocation = animation.lastCoarseLevelX === undefined;
            animation.lastCoarseLevelX = coarseLevelX;
            animation.action.apply(this._animationScope, []);
        }
    }
};