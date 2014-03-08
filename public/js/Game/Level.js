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
 *   animations: Array.<ACV.Game.Animation>
 *   visible: boolean
 *   backgroundLayers: Array.<ACV.Game.Layer>
 *   foregroundLayers: Array.<ACV.Game.Layer>
 *   _foregroundElement: jQuery
 *   _backgroundElement: jQuery
 *   _currentZoom: number
 *   _zoomWrappers: jQuery
 * }}
 * @param {string} handle
 * @param {Object} prefs
 * @param {Array.<Animation>} animations
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
};

/**
 *
 * @param {Object} data
 * @returns {ACV.Game.Level}
 */
ACV.Game.Level.createFromPrefs = function (data) {

    var backgroundLayers = [], foregroundLayers = [], layerIndex, layer, animationIndex, animations = [];

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
    for (animationIndex in data.animations) {
        animations.push(ACV.Game.Animation.createFromPrefs(data.animations[animationIndex]));
    }

    return new ACV.Game.Level(data.handle, data.prefs, animations, backgroundLayers, foregroundLayers);
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
        _currentZoom: 1,
        _zoomWrappers: null
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
    var layerIndex, animationIndex, backgroundZoomWrapper, foregroundZoomWrapper;

    this._foregroundElement = $('<div class="level foreground level-' + this.handle.substr(0, this.handle.indexOf('-')) + '" data-handle="' + this.handle + '"><div class="zoom-wrapper" /></div>');
    this._foregroundElement.css('max-width', this.prefs.clip.x2, 0);


    this._backgroundElement = $('<div class="level background level-' + this.handle.substr(0, this.handle.indexOf('-')) + '"data-handle="' + this.handle + '"><div class="zoom-wrapper" /></div>');
    this._backgroundElement.css('max-width', this.prefs.clip.x2, 0);

    backgroundZoomWrapper = this._backgroundElement.children('.zoom-wrapper');
    foregroundZoomWrapper = this._foregroundElement.children('.zoom-wrapper');

    this._zoomWrappers = backgroundZoomWrapper.add(foregroundZoomWrapper);

    for (layerIndex in this.backgroundLayers) {
        //TODO remove children() from loop
        this.backgroundLayers[layerIndex].init(backgroundZoomWrapper, minHeight, maxHeight);
    }
    for (layerIndex in this.foregroundLayers) {
        //TODO remove children() from loop
        this.foregroundLayers[layerIndex].init(foregroundZoomWrapper, minHeight, maxHeight);
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
 * @param {number} target
 * @param {number} speed
 * @returns void
 * @since 2014-03-08
 */
ACV.Game.Level.prototype.zoomTo = function (target, speed) {
    var duration;
    var level = this;
    var start = this._currentZoom;

    duration = ACV.Utils.calculateAnimationDuration(this._currentZoom, target, speed);
    this.debug('Zooming to %s', target);
    this._backgroundElement.stop('zoom', true).animate({
        textIndent: target * 100
    }, {
        queue: 'zoom',
        duration: duration,
        easing: 'easeInOutSine',
        step: function (now, tween) {
            level._currentZoom = (1 - tween.pos ) * start + tween.pos * target;
            level._zoomWrappers.css('transform', 'scale('+level._currentZoom+')');

        }
    }).dequeue('zoom');
};

/**
 *
 * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {!number} sceneXBefore
 * @param {ViewportDimensions} viewportDimensions
 * @returns void
 */
ACV.Game.Level.prototype.updatePositions = function (sceneX, sceneXBefore, viewportDimensions) {

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
    var levelX = sceneX - this.prefs.offset;
    var levelXBefore = sceneXBefore - this.prefs.offset;

    //handle animations that are dependent on levelX
    for (animationIndex in this.animations) {

        animation = this.animations[animationIndex];
        if (animation.dependency === 'levelX') {
            if (!executeOutOfRangeAnimation && (levelX < animation.enabledRange[0] || levelX > animation.enabledRange[1])) {
                continue;
            }
            coarseLevelX = Math.round(levelX / animation.granularity);

            if (coarseLevelX !== animation.lastCoarseLevelX) {
                animation.lastCoarseLevelX = coarseLevelX;
                animation.viewportDimensions = viewportDimensions;
                animation.levelX = levelX;
                animation.levelXBefore = levelXBefore;
                animation.action.apply(animation);
            }
        }
    }
};