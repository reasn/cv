"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

ACV.Game.Foreground = function(prefs, player, powerups)
{
    this.prefs = prefs;
    this.player = player;
    this.powerups = powerups;
};

ACV.Game.Foreground.createFromData = function(data)
{
    var player, powerups = [];

    player = new ACV.Game.Player(data.player);
    for (var i in data.powerups)
    {
        powerups.push(new ACV.Game.Powerup(data.powerups[i].x, data.powerups[i].y, data.powerups[i].type));
    }
    return new ACV.Game.Foreground(data.prefs, player, powerups);
};

ACV.Game.Foreground.prototype = ACV.Core.createPrototype('ACV.Game.Layer',
{
    prefs: null,
    element: null,
    player: null,
    powerups: [],
    lastCollisionDetection: 0,
    skillImprovementCallback: null
});

ACV.Game.Foreground.prototype.init = function(sceneElement, width, minHeight, maxHeight)
{
    this.element = $('<div class="foreground" />');
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
    var foreground = this;
    this.player.init(this.element, function(playerX, sceneX, viewportDimensions)
    {
        $('#playerX').text(playerX);
        foreground._detectCollisions(playerX, sceneX, viewportDimensions);
    });
    //Add to DOM at last to reduce draw calls
    sceneElement.append(this.element);
};

ACV.Game.Foreground.prototype.setSkillImprovementCallback = function(skillImprovementCallback)
{
    this.skillImprovementCallback = skillImprovementCallback;
};

/**
 *
 * @param int x The amount of pixels that already left the viewport on the left side. Positive integer
 * @param int width The width of the current viewport
 */
ACV.Game.Foreground.prototype.updatePositions = function(sceneX, viewportDimensions)
{
    var coarsedSceneX = Math.round(sceneX / this.prefs.collisionDetectionGridSize);
    //Set wrapper position to have the player stay at the same point of the scrolling scenery
    this.element.css('left', -sceneX);

    this.player.updatePosition(sceneX, viewportDimensions);

};
ACV.Game.Foreground.prototype._detectCollisions = function(playerX, sceneX, viewportDimensions)
{
    var testX = playerX + this.prefs.hitBox + .5 * this.player.prefs.box.width;
    for (var i in this.powerups)
    {
        if (this.powerups[i].hasJustBeenCollected(testX))
        {
            this._collectPowerup(i, sceneX, viewportDimensions);
            i--;
        }
    }

};
ACV.Game.Foreground.prototype._collectPowerup = function(powerupIndex, sceneX, viewportDimensions)
{
    var foreground = this;
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
            powerup.element.animate(
            {
                left: [300, 'easeInQuad'],
                bottom: [100, 'easeInQuad']
            },
            {
                duration: 800,
                complete: function()
                {
                    foreground.skillImprovementCallback(powerup.skillType);
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
