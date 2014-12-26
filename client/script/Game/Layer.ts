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
 * @typedef {Object} FlySprite {{
 *   y: number
 *   height: number
 *   static: boolean
 * }}
 */

/**
 * @type {{
 *   _appContext: ACV.AppContext
 *   handle: string
 *   _x: number
 *   prefs: Object
 *   sprites: Array.<ACV.Game.Sprite>
 *   element: jQuery
 *   _lookAroundDistortion: LookAroundDistortion
 * }}
 * @param {ACV.AppContext} appContext
 * @param {string} handle
 * @param {Object} prefs
 * @param {Array.<ACV.Game.Sprite>} sprites
 * @constructor
 */
ACV.Game.Layer = function (appContext, handle, prefs, sprites) {
    if (typeof handle !== 'string' || handle.length === 0) {
        throw new Error('Handle must be string of positive length.');
    }
    this._appContext = appContext;
    this._handle = handle;
    this.prefs = prefs;
    this.sprites = sprites;
};

ACV.Game.Layer.createFromPrefs = function (appContext, data) {
    var spriteIndex, sprites = [];
    for (spriteIndex in data.sprites) {
        sprites.push(new ACV.Game.Sprite.createFromPrefs(appContext, data.sprites[spriteIndex]));
    }
    return new ACV.Game.Layer(appContext, data.handle, data.prefs, sprites);
};

ACV.Game.Layer.prototype = ACV.Core.createPrototype('ACV.Game.Layer', {
    _appContext: null,
    _handle: '',
    _x: 0,
    prefs: null,
    sprites: [],
    element: null,
    _lookAroundDistortion: {
        x: 0,
        y: 0
    }
});

ACV.Game.Layer.prototype.init = function (sceneElement, minHeight, viewportDimensions, flySprites) {
    var spriteIndex, spriteWrapper;

    //TODO remove handles in productive environment
    this.element = $('<div class="layer" data-handle="' + this._handle + '"><div class="sprite-wrapper" /></div>');
    this.element.css({
        minHeight: minHeight
    });

    spriteWrapper = this.element.children('.sprite-wrapper');

    for (spriteIndex in this.sprites) {
        this.sprites[spriteIndex].init(spriteWrapper);
        this._positionSprite(this.sprites[spriteIndex], viewportDimensions, flySprites);
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
 * @param {!number} levelOffset
 * @param {!number} levelX The amount of pixels that already left the viewport on the left side. Positive integer
 * @param {!number} levelXBefore
 * @param {!number} levelClipOffset
 * @param {!Array<FlySprite>} flySprites
 * @param {!ViewportDimensions}  viewportDimensions

 * @version 2014-03-05
 */
ACV.Game.Layer.prototype.updatePositions = function (levelOffset, levelX, levelXBefore, levelClipOffset, viewportDimensions, flySprites) {

    if (viewportDimensions.heightChanged) {
        this._recalculateSpritePositions(viewportDimensions, flySprites);
    }
    this._x = -1 * (levelOffset + levelClipOffset + this.prefs.speed * levelX - this.prefs.offset);
    this.element.css('left', (this._x + this._lookAroundDistortion.x) + 'px');
};

/**
 * Is only invoked once for static sprites (from init()).
 *
 * @param {ACV.Game.Sprite} sprite
 * @param {ViewportDimensions} viewportDimensions
 * @param {Array.<FlySprite>} flySprites
 * @private
 */
ACV.Game.Layer.prototype._positionSprite = function (sprite, viewportDimensions, flySprites) {

    /* flySprite is a flyweight representation of a Sprite */
    var flySprite = {}, cssProps = {};

    flySprite.static = true;

    if (typeof sprite.y === 'function') {
        flySprite.y = sprite.y.apply(flySprite, [this._appContext.prefs.maxLookAroundDistortion, viewportDimensions.height, flySprites]);
        flySprite.static = false;

    } else if (typeof sprite.y === 'number') {
        flySprite.y = sprite.y;

    } else {
        flySprite.y = sprite.y.indexOf('%') === -1 ? parseInt(sprite.y) : viewportDimensions.height / 100 * parseInt(sprite.y);
    }

    if (sprite.topAligned) {
        cssProps.top = flySprite.y + 'px';
    } else {
        cssProps.bottom = flySprite.y + 'px';
    }

    //Calculate height
    if (typeof sprite.height === 'function') {
        flySprite.height = sprite.height.apply(flySprite, [this._appContext.prefs.maxLookAroundDistortion, viewportDimensions.height, flySprites]);
        flySprite.static = false;

    } else if (typeof sprite.height === 'number') {
        flySprite.height = sprite.height;

    } else {
        flySprite.height = sprite.height.indexOf('%') === -1 ? parseInt(sprite.height) : viewportDimensions.height / 100 * parseInt(sprite.height);
    }

    cssProps.height = flySprite.height;

    if (flySprites[this._handle] === undefined) {
        flySprites[this._handle] = {};
    }
    flySprites[this._handle][sprite.handle] = flySprite;

    sprite.element.css(cssProps);
};


/**
 *
 * @param {ViewportDimensions} viewportDimensions
 * @param {Array.<FlySprite>} flySprites
 * @private
 */
ACV.Game.Layer.prototype._recalculateSpritePositions = function (viewportDimensions, flySprites) {
    var spriteIndex, sprite;
    this.info('Recalculating y positions of all sprites');
    for (spriteIndex in this.sprites) {
        sprite = this.sprites[spriteIndex];
        //Recalculate sprites y-positions if necessary
        if (typeof sprite.y === 'function' || typeof sprite.height === 'function') {
            this._positionSprite(sprite, viewportDimensions, flySprites);
        }
    }
};

/**
 *
 * @param {LookAroundDistortion} lookAroundDistortion
 * @since 2014-03-18
 */
ACV.Game.Layer.prototype.applyLookAroundDistortion = function (lookAroundDistortion) {

    /*
     * We use Math.floor() instead of Math.round() to obtain a
     * continuous distribution of the results and therefore
     * reduce (probably invisible) micro-flickering.
     */
    this._lookAroundDistortion.x = Math.floor(lookAroundDistortion.x * this.prefs.speed);
    this._lookAroundDistortion.y = Math.floor(lookAroundDistortion.y * this.prefs.speed);

    this.element.css({
        top: this._lookAroundDistortion.y + 'px',
        left: (this._x + this._lookAroundDistortion.x) + 'px'
    });
};