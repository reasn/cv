"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};
/**
 * @type {{
 *   _appContext: ACV.AppContext
 *   prefs: Object
 *   element: jQuery
 *   player: ACV.Game.Player
 *   powerUps: Array.<ACV.Game.PowerUp>
 *   lastCollisionDetection: number
 *   playerLayer: ACV.Game.PlayerLayer
 *   zoomWrapper: jQuery
 *   _lookAroundDistortion: LookAroundDistortion
 * }}
 * @param {ACV.AppContext} appContext
 * @param {PlayerLayerPrefs} prefs
 * @param {ACV.Game.Player} player
 * @param {Array.<ACV.Game.PowerUp>} powerUps
 * @constructor
 */
ACV.Game.PlayerLayer = function (appContext, prefs, player, powerUps) {

    appContext.player = player;

    this._appContext = appContext;
    this.prefs = prefs;
    this.player = player;
    this.powerUps = powerUps;
};

ACV.Game.PlayerLayer.createFromData = function (appContext, data) {
    var player, powerUpIndex, powerUps = [];

    player = new ACV.Game.Player(data.player);
    for (powerUpIndex in data.powerUps) {
        powerUps.push(new ACV.Game.PowerUp(data.powerUps[powerUpIndex].x, data.powerUps[powerUpIndex].y, data.powerUps[powerUpIndex].type));
    }
    return new ACV.Game.PlayerLayer(appContext, data.prefs, player, powerUps);
};

ACV.Game.PlayerLayer.prototype = ACV.Core.createPrototype('ACV.Game.PlayerLayer',
    {
        _appContext: null,
        prefs: null,
        element: null,
        player: null,
        powerUps: [],
        lastCollisionDetection: 0,
        playerLayer: null,
        _lookAroundDistortion: null
    });

/**
 *
 * @param {jQuery} wrapperElement
 * @param {number} width
 * @param {number} minHeight
 * @param {LookAroundDistortion} lookAroundDistortion
 */
ACV.Game.PlayerLayer.prototype.init = function (wrapperElement, width, minHeight, lookAroundDistortion) {
    var powerUpIndex, playerLayer = this;

    this._lookAroundDistortion = lookAroundDistortion;

    this.element = $('<div class="player-layer" />');
    this.element.css(
        {
            width: width,
            minHeight: minHeight
        });

    for (powerUpIndex in this.powerUps) {
        this.powerUps[powerUpIndex].init(this.element);
    }

    //enclose variable here to reduce calls and improve performance

    this.player.init(this.element);

    this.player.addMovementListener(function (playerX, playerXBefore, targetPlayerX, sceneX, viewportDimensions) {
        playerLayer._detectCollisions(playerX, playerXBefore, sceneX, viewportDimensions);
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
//    var granularSceneX = Math.round(sceneX / this.prefs.collisionDetectionGridSize);

    //Set wrapper position to have the player stay at the same point of the scrolling scenery
    this._x = -sceneX;
    this.element.css('left', (this._x + this._lookAroundDistortion.x) + 'px');
    this.player.updatePosition(sceneX, viewportDimensions);
};


/**
 *
 * @since 2014-03-18
 */
ACV.Game.PlayerLayer.prototype.applyLookAroundDistortion = function () {

    this.element.css({
        top: this._lookAroundDistortion.y + 'px',
        left: (this._x + this._lookAroundDistortion.x) + 'px'
    });
};


/**
 *
 * @param {number} playerX
 * @param {number} playerXBefore
 * @param {number} sceneX
 * @param {ViewportDimensions} viewportDimensions
 * @private
 */
ACV.Game.PlayerLayer.prototype._detectCollisions = function (playerX, playerXBefore, sceneX, viewportDimensions) {
    var testX, powerUpIndex, powerUp;
    testX = playerX + this.prefs.hitBox + .5 * this.player.width;
    for (powerUpIndex in this.powerUps) {
        powerUp = this.powerUps[powerUpIndex];
        if (!powerUp.collected && playerX > powerUp.x && playerXBefore < powerUp.x) {
            this.skillBasket.collectPowerUp(this.powerUps.splice(powerUpIndex, 1)[0], sceneX, viewportDimensions);
            powerUpIndex--;
        }
    }

};

