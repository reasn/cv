"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

ACV.Game.Layer = function (caption, prefs, sprites) {
    this.caption = caption;
    this.prefs = prefs;
    this.sprites = sprites;
};

ACV.Game.Layer.createFromPrefs = function (data) {
    var sprites = [];
    for (var i in data.sprites) {
        sprites.push(new ACV.Game.Sprite.createFromPrefs(data.sprites[i]));
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
    var spriteWrapper;

    //TODO remove captions in productive environment
    this.element = $('<div class="layer" data-caption="' + this.caption + '"><div class="sprite-wrapper" /></div>');
    this.element.css(
        {
            width: this.prefs.width + 'px',
            minHeight: minHeight,
            maxHeight: maxHeight
        });

    spriteWrapper = this.element.children('.sprite-wrapper');

    for (var i in this.sprites) {
        this.sprites[i].init(spriteWrapper);
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
    var i, sprite, position = null, positionBefore = null;

    var adjustedSceneX = sceneX - this.prefs.offset;
    var adjustedSceneXBefore = sceneXBefore - this.prefs.offset;

    var x = -this.prefs.speed * adjustedSceneX - levelClipOffset;
    var xBefore = -this.prefs.speed * adjustedSceneXBefore - levelClipOffset;

    //this.info('Layer : ' + (x - this.prefs.offset ));
    this.element.css('left', x + 'px');

    //Trigger sprite animations
    for (i in this.sprites) {
        sprite = this.sprites[i];
        for (var leftThreshold in sprite.positions) {
            if (x > leftThreshold && position === null)
                position = sprite.positions[leftThreshold];
            if (xBefore > leftThreshold && positionBefore === null)
                positionBefore = sprite.positions[leftThreshold];
        }
        if (xBefore !== x)
            sprite.startAnimation(position);
    }
    return;

    //TODO dynamic sprite toggling
    for (var i in this.sprites) {
        sprite = this.sprites[i];
    }
};
