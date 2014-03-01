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
 * @param int x The amount of pixels that already left the viewport on the left side. Positive integer
 * @param int width The width of the current viewport
 */
ACV.Game.Layer.prototype.updatePositions = function (sceneX, sceneXBefore, levelClipOffset, width) {
    var spriteIndex, sprite, position = null, positionBefore = null;

    var adjustedSceneX = sceneX - this.prefs.offset;
    var adjustedSceneXBefore = sceneXBefore - this.prefs.offset;

    var x = -this.prefs.speed * adjustedSceneX - levelClipOffset;
    var xBefore = -this.prefs.speed * adjustedSceneXBefore - levelClipOffset;

    //this.info('Layer : ' + (x - this.prefs.offset ));
    this.element.css('left', x + 'px');

    //Trigger sprite animations
    for (spriteIndex in this.sprites) {
        sprite = this.sprites[spriteIndex];
        for (var leftThreshold in sprite.positions) {
            if (x > leftThreshold && position === null)
                position = sprite.positions[leftThreshold];
            if (xBefore > leftThreshold && positionBefore === null)
                positionBefore = sprite.positions[leftThreshold];
        }
        if (xBefore !== x)
            sprite.startAnimation(position);
    }

    //TODO dynamic sprite toggling
    /*for (spriteIndex in this.sprites) {
     sprite = this.sprites[spriteIndex];
     }*/
};
