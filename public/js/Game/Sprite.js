"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

/**
 *
 * @param {Array} positions
 * @param {int} width
 * @param {int} height
 * @param {bool} topAligned
 */
ACV.Game.Sprite = function (id, caption, positions, width, height, topAligned, source, color, blurred) {
    this.id = id;
    this.caption = caption;
    this.x = positions['0'].x;
    this.y = positions['0'].y;
    this.positions = positions;
    this.topAligned = topAligned;
    this.width = width;
    this.height = height;
    this.source = source;
    this.color = color;
    this.blurred = blurred;
};
ACV.Game.Sprite.createFromPrefs = function (data) {
    //TODO currently never used. deprecated?
    var positions = data.positions !== undefined ? data.positions :
    {
        "0": {
            x: data.x,
            y: data.y
        }
    };

    return new ACV.Game.Sprite(data.id, data.caption, positions, data.width, data.height, data.topAligned, data.source, data.color, data.blurred);
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
        /** @var string|string */
        source: null,
        /** @var string|string */
        color: null,
        blurred: false
    });

ACV.Game.Sprite.prototype.init = function (layerElement) {
    this.element = $('<div class="sprite" data-caption="' + this.caption + '" />');
    if(this.id){
        this.element.attr('id', this.id);
    }
    this.element.css(
        {
            left: this.x,
            width: this.width,
            height: this.height
        });

    //TODO implement combined asset files
    if (typeof (this.source) === 'string') {
        this.element.css('backgroundImage', 'url("' + ACV.App.config.assetPath + '/' + this.source + '")');
        this.element.addClass('image-background')
    } else if (typeof(this.color) === 'string') {
        this.element.addClass('colored').addClass(this.color);
    } else {
        this.element.css('backgroundColor', ACV.Game.Sprite.mockColors[ACV.Game.Sprite.mockColorIndex++]);
    }


    if (this.blurred)
        this.element.addClass('blurred');

    if (this.topAligned)
        this.element.css('top', this.y);
    else
        this.element.css('bottom', this.y);
    layerElement.append(this.element);

    this.debug('Sprite initialized');
};
ACV.Game.Sprite.prototype.startAnimation = function (target) {
    //  this.info('animating towards %s', target);
};
