"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

/**
 * @typedef {Object} LookAroundDistortion {{
 *   x: number - Between -50 and +50
 *   y: number - Between -50 and +50
 * }}
 */

/**
 * @type {{
 *   _appContext: ACV.AppContext
 *   caption: string
 *   _x: number
 *   prefs: Object
 *   sprites: Array.<ACV.Game.Sprite>
 *   element: jQuery
 *   _lookAroundDistortion: LookAroundDistortion
 * }}
 * @param {ACV.AppContext} appContext
 * @param {string} caption
 * @param {Object} prefs
 * @param {Array.<ACV.Game.Sprite>} sprites
 * @constructor
 */
ACV.Game.Layer = function (appContext, caption, prefs, sprites) {
    this._appContext = appContext;
    this.caption = caption;
    this.prefs = prefs;
    this.sprites = sprites;
};

ACV.Game.Layer.createFromPrefs = function (appContext, data) {
    var spriteIndex, sprites = [];
    for (spriteIndex in data.sprites) {
        sprites.push(new ACV.Game.Sprite.createFromPrefs(appContext, data.sprites[spriteIndex]));
    }
    return new ACV.Game.Layer(appContext, data.caption, data.prefs, sprites);
};

ACV.Game.Layer.prototype = ACV.Core.createPrototype('ACV.Game.Layer',
    {
        _appContext: null,
        caption: '',
        _x: 0,
        prefs: null,
        sprites: [],
        element: null,
        _lookAroundDistortion: {
            x: 0,
            y: 0
        }
    });

ACV.Game.Layer.prototype.init = function (sceneElement, minHeight, maxHeight) {
    var spriteIndex, spriteWrapper;

    //TODO remove captions in productive environment
    this.element = $('<div class="layer" data-caption="' + this.caption + '"><div class="sprite-wrapper" /></div>');
    this.element.css(
        {
            minHeight: minHeight,
            maxHeight: maxHeight
        });

    spriteWrapper = this.element.children('.sprite-wrapper');

    for (spriteIndex in this.sprites) {
        this.sprites[spriteIndex].init(spriteWrapper);
    }
    //Add to DOM at last to reduce draw calls
    sceneElement.append(this.element);
    this.info('Layer initialized with ' + this.sprites.length + ' sprites', 'd');
};

/**
 *
 * History:
 * 2014-03-05 Improved variable naming to clearly indicate levelX and levelXBefore
 *
 * @param {number} levelOffset
 * @param {number} levelX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {number} levelXBefore
 * @param {number} levelClipOffset
 * @version 2014-03-05
 */
ACV.Game.Layer.prototype.updatePositions = function (levelOffset, levelX, levelXBefore, levelClipOffset) {

    this._x = -1 * (levelOffset + levelClipOffset + this.prefs.speed * levelX - this.prefs.offset);
    this.element.css('left', (this._x + this._lookAroundDistortion.x) + 'px');
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @since 2014-03-18
 */
ACV.Game.Layer.prototype.applyLookAroundDistortion = function (x, y) {

    this._lookAroundDistortion.x = Math.round(x * this.prefs.speed);
    this._lookAroundDistortion.y = Math.round(y * this.prefs.speed);

    this.element.css({
        top: this._lookAroundDistortion.y + 'px',
        left: (this._x + this._lookAroundDistortion.x) + 'px'
    });
};