"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

ACV.Game.PlayerLayer = function(prefs, player, powerups)
{
    this.prefs = prefs;
    this.player = player;
    this.powerups = powerups;
};

ACV.Game.PlayerLayer.createFromData = function(data, performanceSettings)
{
    var player, powerups = [];

    player = new ACV.Game.Player(data.player);
    for (var i in data.powerups)
    {
        powerups.push(new ACV.Game.Powerup(data.powerups[i].x, data.powerups[i].y, data.powerups[i].type));
    }
    return new ACV.Game.PlayerLayer(data.prefs, player, powerups);
};

ACV.Game.PlayerLayer.prototype = ACV.Core.createPrototype('ACV.Game.PlayerLayer',
{
    prefs: null,
    element: null,
    player: null,
    powerups: [],
    lastCollisionDetection: 0,
    playerLayer: null
});

ACV.Game.PlayerLayer.prototype.init = function(wrapperElement, width, minHeight, maxHeight, scene)
{
    this.element = $('<div class="player-layer" />');
    this.element.css(
    {
        width: width,
        minHeight: minHeight,
        maxHeight: maxHeight
    });

    for (var i in this.powerups)
    {
        this.powerups[i].init(this.element);
    }

    //enclose variable here to reduce calls and improve performance
    var playerLayer = this;
    this.player.init(this.element, function(playerX, sceneX, viewportDimensions)
    {
        $('#playerX').text(playerX);
        playerLayer._detectCollisions(playerX, sceneX, viewportDimensions);
        scene.handleTriggers(playerX, sceneX);
    });
    //Add to DOM at last to reduce draw calls
    wrapperElement.append(this.element);
};

/**
 *
 * @param int x The amount of pixels that already left the viewport on the left side. Positive integer
 * @param int width The width of the current viewport
 */
ACV.Game.PlayerLayer.prototype.updatePositions = function(sceneX, viewportDimensions)
{
    var coarsedSceneX = Math.round(sceneX / this.prefs.collisionDetectionGridSize);
    //Set wrapper position to have the player stay at the same point of the scrolling scenery
    this.element.css('left', -sceneX);

    this.player.updatePosition(sceneX, viewportDimensions);

};
ACV.Game.PlayerLayer.prototype._detectCollisions = function(playerX, sceneX, viewportDimensions)
{
    var testX = playerX + this.prefs.hitBox + .5 * this.player.width;
    for (var i in this.powerups)
    {
        if (this.powerups[i].hasJustBeenCollected(testX))
        {
            this._collectPowerup(i, sceneX, viewportDimensions);
            i--;
        }
    }

};
ACV.Game.PlayerLayer.prototype._collectPowerup = function(powerupIndex, sceneX, viewportDimensions)
{
    var playerLayer = this;
    var powerup = this.powerups[powerupIndex];
    var p = powerup.element.position();

    this.powerups.splice(powerupIndex, 1);

    powerup.element.css(
    {
        position: 'fixed',
        left: p.left - sceneX,
        bottom: viewportDimensions.height - p.top
    });
    powerup.element.animate(
    {
        bottom: [viewportDimensions.height - p.top + 100, 'easeOutQuad'],
    },
    {
        duration: 200,
        complete: function()
        {
            var targetPosition = playerLayer.skillBasket.getPowerupAnimationTarget();
            powerup.element.animate(
            {
                left: [targetPosition.left, 'easeInQuad'],
                bottom: [targetPosition.bottom, 'easeInQuad']
            },
            {
                duration: 800,
                complete: function()
                {
                    playerLayer.skillBasket.improve(powerup.skillType);
                    powerup.element.remove();
                }
            });
        }
    });

    //this.powerups[powerupIndex].element.remove();
    //powerup.element.animate({
    //left:
    //})
};
