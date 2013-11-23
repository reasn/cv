"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

ACV.Game.Powerup = function(x, y, skillType)
{
    this.x = x;
    this.y = y;
    this.skillType = skillType;
};
ACV.Game.Powerup.prototype = ACV.Core.createPrototype('ACV.Game.Powerup',
{
    x: 0,
    y: 0,
    skillType: '',
    element: null
});

ACV.Game.Powerup.prototype.init = function(foregroundElement)
{
    this.element = $('<div class="powerup" />');
    this.element.css(
    {
        left: this.x,
        bottom: this.y
    });
    this.element.text(this.x);

    foregroundElement.append(this.element);

    this.log('Powerup initialized', 'd');
};
ACV.Game.Powerup.prototype.hasJustBeenCollected = function(playerX)
{
    return playerX >= this.x;
};
