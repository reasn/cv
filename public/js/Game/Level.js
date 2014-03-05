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

/**
 * @type {{
 *   handle: string
 *   prefs: Object
 *   animations: Array.<Object>
 *   visible: boolean
 *   backgroundLayers: Array.<ACV.Game.Layer>
 *   foregroundLayers: Array.<ACV.Game.Layer>
 *   _foregroundElement: jQuery
 *   _backgroundElement: jQuery
 *   _animationScope: ACV.Game.AnimationScope
 * }}
 * @param handle
 * @param prefs
 * @param {Array.<Object>} animations
 * @param {Array.<ACV.Game.Layer>} backgroundLayers
 * @param {Array.<ACV.Game.Layer>} foregroundLayers
 * @constructor
 */
ACV.Game.Level = function (handle, prefs, animations, backgroundLayers, foregroundLayers) {
    this.handle = handle;
    this.prefs = prefs;
    this.animations = animations;
    this.backgroundLayers = backgroundLayers;
    this.foregroundLayers = foregroundLayers;
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
        _foregroundElement: null,
        _backgroundElement: null,
        _animationScope: null
    });
/**
 *
 * @param {jQuery} backgroundWrapper
 * @param {jQuery} foregroundWrapper
 * @param {!number} minHeight
 * @param {!number} maxHeight
 * @returns void
 */
ACV.Game.Level.prototype.init = function (backgroundWrapper, foregroundWrapper, minHeight, maxHeight) {
    var layerIndex;

    this._foregroundElement = $('<div class="level" data-handle="' + this.handle + '" />');
    this._foregroundElement.css('max-width', this.prefs.clip.x2, 0);


    this._backgroundElement = $('<div class="level" data-handle="' + this.handle + '" />');
    this._backgroundElement.css('max-width', this.prefs.clip.x2, 0);

    for (layerIndex in this.backgroundLayers) {
        this.backgroundLayers[layerIndex].init(this._backgroundElement, minHeight, maxHeight);
    }
    for (layerIndex in this.foregroundLayers) {
        this.foregroundLayers[layerIndex].init(this._foregroundElement, minHeight, maxHeight);
    }
    //Add to DOM at last to reduce draw calls
    backgroundWrapper.append(this._backgroundElement);
    foregroundWrapper.append(this._foregroundElement);
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
    this._applyClippingAndUpdateLayerPositions(sceneX, sceneXBefore);
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
        this._foregroundElement.removeClass('visible');
        this._backgroundElement.removeClass('visible');

    } else if (!this.visible && (sceneX >= showLevelSceneX && sceneX <= hideLevelSceneX)) {
        this.info('Showing level ' + this.handle, 'i');
        this.visible = true;
        this._foregroundElement.addClass('visible');
        this._backgroundElement.addClass('visible');
    }
};


/**
 * Apply clipping to the left and right
 * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {!number} sceneXBefore
 * @returns void
 * @private
 * @version 2014-03-05
 * @since 2014-03-05
 * @author Alexander Thiel
 */
ACV.Game.Level.prototype._applyClippingAndUpdateLayerPositions = function (sceneX, sceneXBefore) {
    var layerIndex, distanceBetweenLeftViewportMarginAndLevelBegin;

    distanceBetweenLeftViewportMarginAndLevelBegin = this.prefs.offset - sceneX + this.prefs.clip.x1;

    this._backgroundElement.css('margin-left', distanceBetweenLeftViewportMarginAndLevelBegin + 'px');
    this._foregroundElement.css('margin-left', distanceBetweenLeftViewportMarginAndLevelBegin + 'px');

    var levelX = sceneX - this.prefs.offset;
    var levelXBefore = sceneXBefore - this.prefs.offset;

    for (layerIndex in this.backgroundLayers) {
        this.backgroundLayers[layerIndex].updatePositions(this.prefs.offset, levelX, levelXBefore, distanceBetweenLeftViewportMarginAndLevelBegin);
    }
    for (layerIndex in this.foregroundLayers) {
        this.foregroundLayers[layerIndex].updatePositions(this.prefs.offset, levelX, levelXBefore, distanceBetweenLeftViewportMarginAndLevelBegin);
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