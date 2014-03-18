"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};
/**
 * @type {{
 *   prefs: Object
 *   element: jQuery
 *   player: ACV.Game.Player
 *   powerUps: Array.<ACV.Game.PowerUp>
 *   lastCollisionDetection: number
 *   playerLayer: ACV.Game.PlayerLayer
 *   zoomWrapper: jQuery
 * }}
 * @param prefs
 * @param player
 * @param powerUps
 * @constructor
 */
ACV.Game.PlayerLayer = function (prefs, player, powerUps) {
    this.prefs = prefs;
    this.player = player;
    this.powerUps = powerUps;
};

ACV.Game.PlayerLayer.createFromData = function (data, performanceSettings) {
    var player, powerUpIndex, powerUps = [];

    player = new ACV.Game.Player(data.player);
    for (powerUpIndex in data.powerUps) {
        powerUps.push(new ACV.Game.PowerUp(data.powerUps[powerUpIndex].x, data.powerUps[powerUpIndex].y, data.powerUps[powerUpIndex].type));
    }
    return new ACV.Game.PlayerLayer(data.prefs, player, powerUps);
};

ACV.Game.PlayerLayer.prototype = ACV.Core.createPrototype('ACV.Game.PlayerLayer',
    {
        prefs: null,
        element: null,
        player: null,
        powerUps: [],
        lastCollisionDetection: 0,
        playerLayer: null,
        zoomWrapper: null
    });

ACV.Game.PlayerLayer.prototype.init = function (wrapperElement, width, minHeight, maxHeight, scene) {
    var powerUpIndex, playerLayer = this;

    this.element = $('<div class="player-layer"><div class="zoom-wrapper"/></div>');
    this.zoomWrapper = this.element.children('.zoom-wrapper');
    this.element.css(
        {
            width: width,
            minHeight: minHeight,
            maxHeight: maxHeight
        });

    for (powerUpIndex in this.powerUps) {
        this.powerUps[powerUpIndex].init(this.zoomWrapper);
    }

    //enclose variable here to reduce calls and improve performance

    this.player.init(this.zoomWrapper, function (playerX, targetPlayerX, sceneX, viewportDimensions) {
        $('#playerX').text(playerX);
        playerLayer._detectCollisions(playerX, sceneX, viewportDimensions);
        scene.handleTriggers(playerX, targetPlayerX, sceneX);
    });
    //Add to DOM at last to reduce draw calls
    wrapperElement.append(this.element);
};

/**
 *
 * @param {number} sceneX
 * @param {ViewportDimensions} viewportDimensions
 */
ACV.Game.PlayerLayer.prototype.updatePositions = function (sceneX, viewportDimensions) {
    var granularSceneX = Math.round(sceneX / this.prefs.collisionDetectionGridSize);

    //Set wrapper position to have the player stay at the same point of the scrolling scenery
    this.element.css('left', -sceneX);

    this.player.updatePosition(sceneX, viewportDimensions);

};

/**
 *
 * @param {number} playerX
 * @param {number} sceneX
 * @param {ViewportDimensions} viewportDimensions
 * @private
 */
ACV.Game.PlayerLayer.prototype._detectCollisions = function (playerX, sceneX, viewportDimensions) {
    var powerUpIndex;
    var testX = playerX + this.prefs.hitBox + .5 * this.player.width;
    for (powerUpIndex in this.powerUps) {
        if (this.powerUps[powerUpIndex].hasJustBeenCollected(testX)) {
            this._collectPowerUp(powerUpIndex, sceneX, viewportDimensions);
            powerUpIndex--;
        }
    }

};

/**
 *
 * @param {number} powerUpIndex
 * @param {number} sceneX
 * @param {ViewportDimensions} viewportDimensions
 * @private
 */
ACV.Game.PlayerLayer.prototype._collectPowerUp = function (powerUpIndex, sceneX, viewportDimensions) {
    var playerLayer = this;
    var powerUp = this.powerUps[powerUpIndex];
    var p = powerUp.element.position();

    this.powerUps.splice(powerUpIndex, 1);

    powerUp.element.css(
        {
            position: 'fixed',
            left: p.left - sceneX,
            bottom: viewportDimensions.height - p.top
        });
    powerUp.element.animate(
        {
            bottom: [viewportDimensions.height - p.top + 100, 'easeOutQuad']
        },
        {
            duration: 200,
            complete: function () {
                var targetPosition = playerLayer.skillBasket.getPowerUpAnimationTarget();
                powerUp.element.animate(
                    {
                        left: [targetPosition.left, 'easeInQuad'],
                        bottom: [targetPosition.bottom, 'easeInQuad']
                    },
                    {
                        duration: 800,
                        complete: function () {
                            playerLayer.skillBasket.improve(powerUp.skillType);
                            powerUp.element.remove();
                        }
                    });
            }
        });

    //this.powerUps[powerUpIndex].element.remove();
    //powerUp.element.animate({
    //left:
    //})
};
