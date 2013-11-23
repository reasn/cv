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
ACV.Game.Player = function(prefs)
{
    this.prefs = prefs;
    this.y = prefs.position.y;
};

ACV.Game.Player.prototype = ACV.Core.createPrototype('ACV.Game.Player',
{
    prefs: null,
    element: null,
    x: 0,
    y: 0,
    movementListener: null
});

ACV.Game.Player.prototype.init = function(foregroundElement, movementListener)
{

    this.log('Initializing player', 'd');

    this.movementListener = movementListener;

    this.element = $('<div class="player" />');
    this.element.css(
    {
        width: this.prefs.box.width,
        height: this.prefs.box.height,
        bottom: this.y
    });
    foregroundElement.append(this.element);
    this.log('Player initialized', 'd');
};
/**
 *
 * @param int x Set to null or leave out to not update it
 * @param int y Set to null or leave out to not update it
 */
ACV.Game.Player.prototype.setPosition = function(x, y)
{
    this.element.stop();

    var newStyle = new Object();
    if (x > 0 || x < 0)
        newStyle.left = this.x = x;

    if (y > 0 || y < 0)
        newStyle.top = this.y = y;

    this.element.css(newStyle);

};

ACV.Game.Player.prototype.updatePosition = function(sceneX, viewportDimensions)
{
    var targetX, classesToAdd, classesToRemove, vieportPositionRatio, speed = 1;

    //Player is out of sight to the right. Set him right outside the left viewport boundary
    if (this.x < sceneX - this.prefs.box.width)
        this.setPosition(sceneX - this.prefs.box.width);

    //Player is out of sight to the right. Set him right outside the right hand viewport boundary
    if (this.x > sceneX + viewportDimensions.width)
        this.setPosition(sceneX + viewportDimensions.width);

    //Map player's position to a ratio from 0 (left) to 1 (right) to dynamically adapt walking speed
    vieportPositionRatio = (this.x - sceneX) / viewportDimensions.width;

    if (vieportPositionRatio < this.prefs.position.min || vieportPositionRatio > this.prefs.position.max)
    {
        speed = Math.abs(this.prefs.position.target - vieportPositionRatio);

        targetX = sceneX + this.prefs.position.target * viewportDimensions.width;
        var player = this;

        //Make player run faster if he was already moving
        if (this.element.is(':animated'))
            speed *= 2;

        //Reduce redraws by adding/removing as many classes at a time as possible
        if (targetX > this.x)
        {
            classesToRemove = 'backwards';
            classesToAdd = 'walking forward';
        } else
        {
            classesToRemove = 'forward';
            classesToAdd = 'walking backwards';
        }
        this.element.stop().removeClass(classesToRemove).addClass(classesToAdd).animate(
        {
            left: targetX
        },
        {
            duration: Math.abs(this.x - targetX) / speed,
            step: function(now)
            {
                var coarseX = Math.round(now / player.prefs.movemenTriggerCoarsity);
                player.x = now;

                if (coarseX !== player.lastCoarseX)
                {
                    player.lastCoarseX = coarseX;
                    player.movementListener.call(player, player.x, sceneX, viewportDimensions);
                }
            },
            complete: function()
            {
                player.element.removeClass('walking');
            }
        });

        this.log('Moving player to ' + targetX + '     ( is: ' + vieportPositionRatio + ')', 'd');
        //this.element.css('left', targetX + 'px');
    }
};
