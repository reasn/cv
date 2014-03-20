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
 *   _appContext: ACV.AppContext
 *   handle: string
 *   prefs: Object
 *   animations: Array.<ACV.Game.Animation>
 *   visible: boolean
 *   backgroundLayers: Array.<ACV.Game.Layer>
 *   foregroundLayers: Array.<ACV.Game.Layer>
 *   _foregroundElement: jQuery
 *   _backgroundElement: jQuery
 *   _x: number
 *   _xBefore: number
 * }}
 * @param {ACV.AppContext} appContext
 * @param {string} handle
 * @param {Object} prefs
 * @param {Array.<Animation>} animations
 * @param {Array.<ACV.Game.Layer>} backgroundLayers
 * @param {Array.<ACV.Game.Layer>} foregroundLayers
 * @constructor
 */
ACV.Game.Level = function (appContext, handle, prefs, animations, backgroundLayers, foregroundLayers) {
    this._appContext = appContext;
    this.handle = handle;
    this.prefs = prefs;
    this.animations = animations;
    this.backgroundLayers = backgroundLayers;
    this.foregroundLayers = foregroundLayers;
};

/**
 *
 * @param {ACV.AppContext} appContext
 * @param {Object} data
 * @returns {ACV.Game.Level}
 */
ACV.Game.Level.createFromPrefs = function (appContext, data) {

    var backgroundLayers = [], foregroundLayers = [], layerIndex, layer, animationIndex, animations = [];

    for (layerIndex in data.layers.background) {
        layer = ACV.Game.Layer.createFromPrefs(appContext, data.layers.background[layerIndex]);
        layer.prefs.offset += data.prefs.offset;
        backgroundLayers.push(layer);
    }
    for (layerIndex in data.layers.foreground) {
        layer = ACV.Game.Layer.createFromPrefs(appContext, data.layers.foreground[layerIndex]);
        layer.prefs.offset += data.prefs.offset;
        foregroundLayers.push(layer);
    }
    for (animationIndex in data.animations) {
        animations.push(ACV.Game.Animation.createFromPrefs(data.animations[animationIndex]));
    }

    return new ACV.Game.Level(appContext, data.handle, data.prefs, animations, backgroundLayers, foregroundLayers);
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
        animations: [],
        _x: 0,
        _xBefore: 0
    });
/**
 *
 * @param {ACV.Game.Scene} scene
 * @param {jQuery} backgroundWrapper
 * @param {jQuery} foregroundWrapper
 * @param {!number} minHeight
 * @param {!number} maxHeight
 * @returns void
 */
ACV.Game.Level.prototype.init = function (scene, backgroundWrapper, foregroundWrapper, minHeight, maxHeight) {
    var layerIndex, animationIndex;

    this._backgroundElement = $('<div class="level background level-' + this.handle.substr(0, this.handle.indexOf('-')) + '"data-handle="' + this.handle + '" />');
    this._backgroundElement.css('max-width', this.prefs.clip.x2, 0);

    this._foregroundElement = $('<div class="level foreground level-' + this.handle.substr(0, this.handle.indexOf('-')) + '" data-handle="' + this.handle + '" />');
    this._foregroundElement.css('max-width', this.prefs.clip.x2, 0);

    for (layerIndex in this.backgroundLayers) {
        //TODO remove children() from loop
        this.backgroundLayers[layerIndex].init(this._backgroundElement, minHeight, maxHeight);
    }
    for (layerIndex in this.foregroundLayers) {
        //TODO remove children() from loop
        this.foregroundLayers[layerIndex].init(this._foregroundElement, minHeight, maxHeight);
    }

    for (animationIndex in this.animations) {
        this.animations[animationIndex].init(scene, this);
    }

    //Add to DOM at last to reduce draw calls
    backgroundWrapper.append(this._backgroundElement);
    foregroundWrapper.append(this._foregroundElement);
    this.info('Level initialized with ' + this.foregroundLayers.length + ' foreground layers and ' + this.backgroundLayers.length + ' background layers', 'd');
};


/**
 *
 * @param {number} x
 * @param {number} y
 * @since 2014-03-18
 */
ACV.Game.Level.prototype.applyLookAroundDistortion = function (x, y) {
    var layerIndex;
    for (layerIndex in this.foregroundLayers) {
        this.foregroundLayers[layerIndex].applyLookAroundDistortion(x, y);
    }
    for (layerIndex in this.backgroundLayers) {
        this.backgroundLayers[layerIndex].applyLookAroundDistortion(x, y);
    }
};

/**
 *
 * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {!number} sceneXBefore
 * @param {ViewportDimensions} viewportDimensions
 * @returns void
 */
ACV.Game.Level.prototype.updatePositions = function (sceneX, sceneXBefore, viewportDimensions) {

    this._x = sceneX - this.prefs.offset;
    this._XBefore = sceneXBefore - this.prefs.offset;

    this._updateVisibility(sceneX, sceneXBefore, viewportDimensions);
    this._applyClippingAndUpdateLayerPositions(sceneX, sceneXBefore);
    this._handleAnimations(sceneX, sceneXBefore, viewportDimensions, false);
};


/**
 * Hides or shows the level if appropriate.
 *
 * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {!number} sceneXBefore
 * @param {ViewportDimensions} viewportDimensions
 * @returns void
 * @private
 * @version 2014-03-05
 * @since 2014-03-05
 * @author Alexander Thiel
 */
ACV.Game.Level.prototype._updateVisibility = function (sceneX, sceneXBefore, viewportDimensions) {
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
        //Makes sure that all animations are in the right state right after the level is added to the DOM
        this._handleAnimations(sceneX, sceneXBefore, viewportDimensions, true)
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

    for (layerIndex in this.backgroundLayers) {
        this.backgroundLayers[layerIndex].updatePositions(this.prefs.offset, this._x, this._xBefore, distanceBetweenLeftViewportMarginAndLevelBegin);
    }
    for (layerIndex in this.foregroundLayers) {
        this.foregroundLayers[layerIndex].updatePositions(this.prefs.offset, this._x, this._xBefore, distanceBetweenLeftViewportMarginAndLevelBegin);
    }
};


/**
 * Handle animations.
 *
 * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {!number} sceneXBefore
 * @param {!ViewportDimensions} viewportDimensions
 * @param {!boolean} executeOutOfRangeAnimation Set to true to suppress all animation's range checks (useful to have all animations triggered when the level is added to the DOM).
 * @returns void
 * @private
 * @version 2014-03-05
 * @since 2014-03-05
 * @author Alexander Thiel
 */
ACV.Game.Level.prototype._handleAnimations = function (sceneX, sceneXBefore, viewportDimensions, executeOutOfRangeAnimation) {

    var animationIndex, animation, coarseLevelX;

    //handle animations that are dependent on levelX
    for (animationIndex in this.animations) {

        animation = this.animations[animationIndex];
        if (animation.dependency === 'levelX') {
            if (!executeOutOfRangeAnimation && (this._x < animation.enabledRange[0] || this._x > animation.enabledRange[1])) {
                continue;
            }
            coarseLevelX = Math.round(this._x / animation.granularity);

            if (coarseLevelX !== animation.lastCoarseLevelX) {
                animation.lastCoarseLevelX = coarseLevelX;
                animation.viewportDimensions = viewportDimensions;
                animation.levelX = this._x;
                animation.levelXBefore = this._XBefore;
                animation.action.apply(animation);
            }
        }
    }
};