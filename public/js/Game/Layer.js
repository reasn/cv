"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

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
        element: null,
        prefs: null,
        sprites: []
    });

ACV.Game.Layer.prototype.init = function (sceneElement, minHeight, maxHeight) {
    var spriteIndex, spriteWrapper;

    //TODO remove captions in productive environment
    this.element = $('<div class="layer" data-caption="' + this.caption + '"><div class="sprite-wrapper" /></div>');
    this.element.css(
        {
            width: this.prefs.width + 'px',
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
 * @param {number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {number} sceneXBefore
 * @param {number} levelClipOffset
 * @version 2014-03-05
 */
ACV.Game.Layer.prototype.updatePositions = function (sceneX, sceneXBefore, levelClipOffset) {
    var spriteIndex, sprite, position = null, positionBefore = null;
    var levelX = sceneX - this.prefs.offset;
    var levelXBefore = sceneXBefore - this.prefs.offset;

    var x = -levelClipOffset - this.prefs.speed * levelX;
    var xBefore = -levelClipOffset - this.prefs.speed * levelXBefore;

    this.element.css('left', x + 'px');
};
