"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

/**
 * @typedef {function} SpriteCallback
 * @param {number} maxLookAroundDistortion
 * @param {number} viewportHeight
 * @param {Object.<string, {top: number, bottom: number}> } sprites
 * @returns number
 */

/**
 *
 * @param {ACV.AppContext} appContext
 * @param {string} id
 * @param {string} handle
 * @param {number} x
 * @param {number|string|SpriteCallback} y
 * @param {number} width
 * @param {number|string|SpriteCallback} height
 * @param {bool} topAligned
 * @param {string} source
 * @param {string} color
 * @param {boolean} blurred
 */
ACV.Game.Sprite = function (appContext, id, handle, x, y, width, height, topAligned, source, color, blurred) {

    if (typeof handle !== 'string' || handle.length === 0) {
        throw new Error('Handle must be string of positive length.');
    }

    this._appContext = appContext;
    this.id = id;
    this.handle = handle;
    this.x = x;
    this.y = y;
    this.topAligned = topAligned;
    this.width = width;
    this.height = height;
    this.source = source;
    this.color = color;
    this.blurred = blurred;
};

/**
 * Somehow the code gets immediately executed upon creation (therefore the initial if condition).
 * @todo find out why, fix if possible
 * @type {string}
 */
ACV.Game.Sprite.CODE_WRAPPER = "if(sprites === undefined) return; try { return %expression; } catch(e) { ACV.Core.Log.warn('ACV.Game.Sprite', 'Error code of dynamic sprite expression %handle.%property (\"%expression\").'); throw e; }";

ACV.Game.Sprite.createFromPrefs = function (appContext, data) {
    var y, height;

    y = ACV.Game.Sprite._unpackDynamicExpression(appContext, data.y, data.handle, 'y');
    height = ACV.Game.Sprite._unpackDynamicExpression(appContext, data.height, data.handle, 'height');

    return new ACV.Game.Sprite(appContext, data.id, data.handle, data.x, y, data.width, height, data.topAligned, data.source, data.color, data.blurred);
};

/**
 *
 * @param {AppContext} appContext
 * @param {string} expression
 * @param {string} spriteHandle
 * @param {string} propertyName
 * @returns {string|number|SpriteCallback}
 * @private
 */
ACV.Game.Sprite._unpackDynamicExpression = function (appContext, expression, spriteHandle, propertyName) {
    var code;

    if (typeof expression !== 'string') {
        return expression;
    }

    //Reduces number of dynamic expressions
    expression = expression.replace(/maxLookAroundDistortion/g, appContext.prefs.maxLookAroundDistortion);
    expression = expression.replace(' ', '');

    if (expression.match(/[^0-9\%px\-]+/) === null) {
        return expression;
    }

    code = ACV.Game.Sprite.CODE_WRAPPER.replace(/\%expression/g, expression);
    code = code.replace(/\%handle/, spriteHandle);
    code = code.replace(/\%property/, propertyName);
    return new Function(['maxLookAroundDistortion', 'viewportHeight', 'sprites'], code);


};

ACV.Game.Sprite.mockColors = ['#9932CC', '#8B0000', '#E9967A', '#8FBC8F', '#483D8B', '#2F4F4F', '#00CED1', '#9400D3', '#FF1493', '#00BFFF', '#696969', '#1E90FF', '#B22222', '#FFFAF0', '#228B22', '#FF00FF', '#DCDCDC', '#F8F8FF', '#FFD700', '#DAA520', '#808080', '#008000', '#ADFF2F', '#F0FFF0', '#FF69B4'];
ACV.Game.Sprite.mockColorIndex = 0;

ACV.Game.Sprite.prototype = ACV.Core.createPrototype('ACV.Game.Sprite',
    {
        id: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        source: null,
        color: null,
        blurred: false
    });

/**
 *
 * @param {jQuery} layerElement
 */
ACV.Game.Sprite.prototype.init = function (layerElement) {
    this.element = $('<div class="sprite" data-handle="' + this.handle + '" />');
    if (this.id) {
        this.element.attr('id', this.id);
    }
    this.element.css(
        {
            left: this.x + 'px',
            width: this.width + 'px',
            height: this.height
        });

    //TODO implement combined asset files
    if (typeof (this.source) === 'string') {
        this.element.css('backgroundImage', 'url("' + this._appContext.prefs.assetPath + '/' + this.source + '")');
        this.element.addClass('image-background')
    } else if (typeof(this.color) === 'string') {
        this.element.addClass('colored').addClass(this.color);
    } else {
        this.element.css('backgroundColor', ACV.Game.Sprite.mockColors[ACV.Game.Sprite.mockColorIndex++]);
    }

    if (this.blurred) {
        this.element.addClass('blurred');
    }

    layerElement.append(this.element);

    this.debug('Sprite initialized');
};