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
ACV.Game.Sprite = function(positions, width, height, topAligned, source)
{
    this.x = positions['0'].x;
    this.y = positions['0'].y;
    this.positions = positions;
    this.topAligned = topAligned;
    this.width = width;
    this.height = height;
    this.source = source;
};
ACV.Game.Sprite.createFromPrefs = function(data)
{
    var positions = data.positions !== undefined ? data.positions :
    {
        "0":
        {
            x: data.x,
            y: data.y
        }
    };

    return new ACV.Game.Sprite(positions, data.width, data.height, data.topAligned, data.source);
};
ACV.Game.Sprite.mockColors = ['#9932CC', '#8B0000', '#E9967A', '#8FBC8F', '#483D8B', '#2F4F4F', '#00CED1', '#9400D3', '#FF1493', '#00BFFF', '#696969', '#1E90FF', '#B22222', '#FFFAF0', '#228B22', '#FF00FF', '#DCDCDC', '#F8F8FF', '#FFD700', '#DAA520', '#808080', '#008000', '#ADFF2F', '#F0FFF0', '#FF69B4'];
ACV.Game.Sprite.mockColorIndex = 0;
ACV.Game.Sprite.prototype = ACV.Core.createPrototype('ACV.Game.Sprite',
{
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    /** @var object|string */
    source: null
});

ACV.Game.Sprite.prototype.init = function(layerElement)
{
    this.element = $('<div class="sprite" />');
    this.element.css(
    {
        left: this.x,
        width: this.width,
        height: this.height
    });
    if ( typeof (this.source) === 'string')
        this.element.css('backgroundImage', 'url("' + ACV.App.config.assetPath + '/' + this.source + '")');
    else//TODO implement combined asset files
        this.element.css('backgroundColor', ACV.Game.Sprite.mockColors[ACV.Game.Sprite.mockColorIndex++]);

    if (this.topAligned)
        this.element.css('top', this.y);
    else
        this.element.css('bottom', this.y);
    layerElement.append(this.element);

    this.log('Sprite initialized', 'd');
};
ACV.Game.Sprite.prototype.startAnimation = function(target)
{
    //  ACV.Utils.log('animating towards' + target);
};
