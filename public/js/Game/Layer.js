"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

/**
 * @type {{
 *   caption: string
 *   prefs: Object
 *   sprites: Array.<ACV.Game.Sprite>
 *   element: jQuery
 * }}
 * @param {string} caption
 * @param {Object} prefs
 * @param {Array.<ACV.Game.Sprite>} sprites
 * @constructor
 */
ACV.Game.Layer = function (caption, prefs, sprites) {
    this.caption = caption;
    this.prefs = prefs;
    this.sprites = sprites;
};

ACV.Game.Layer.createFromPrefs = function (data) {
    var spriteIndex, sprites = [];
    for (spriteIndex in data.sprites) {
        sprites.push(new ACV.Game.Sprite.createFromPrefs(data.sprites[spriteIndex]));
    }
    return new ACV.Game.Layer(data.caption, data.prefs, sprites);
};

ACV.Game.Layer.prototype = ACV.Core.createPrototype('ACV.Game.Layer',
    {
        caption: '',
        prefs: null,
        sprites: [],
        element: null
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

    var x = levelOffset + levelClipOffset + this.prefs.speed * levelX - this.prefs.offset;
    this.element.css('left', (-x) + 'px');
};
