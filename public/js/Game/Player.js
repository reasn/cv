"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

/**
 *
 * @param prefs
 * @constructor
 */
ACV.Game.Player = function (prefs) {
    this.prefs = prefs;
    this.y = prefs.position.y;
};

ACV.Game.Player.prototype = ACV.Core.createPrototype('ACV.Game.Player',
    {
        prefs: null,
        element: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        movementListener: null
    });

ACV.Game.Player.prototype.init = function (playerLayerElement, movementListener) {

    this.debug('Initializing player');

    this.movementListener = movementListener;

    this.element = $('<div class="player" />');

    this.element.css(
        {
            bottom: this.y
        });
    this.setAge(Object.keys(this.prefs.ages).shift());
    playerLayerElement.append(this.element);
    this.debug('Player initialized');
};
/**
 * @param age
 * @since 2013-11-24
 */
ACV.Game.Player.prototype.setAge = function (age) {
    this.width = this.prefs.ages[age].width;
    this.height = this.prefs.ages[age].height;
    this.element.css(
        {
            width: this.width,
            height: this.height
        });
    this.element.removeClass(Object.keys(this.prefs.ages).join(' '));
    this.element.addClass(age);
    this.debug('Player\'s age set to %s.', age);
};
/**
 *
 * @param x
 */
ACV.Game.Player.prototype.setPosition = function (x) {
    this.element.stop();

    if (x > 0 || x < 0)
        this.element.css('left', this.x = x);

};

ACV.Game.Player.prototype.jump = function () {
    this.debug('Jumping');
    var player = this;
    player.element.animate(
        {
            bottom: [this.y + 100, 'easeOutQuart']
        },
        {
            queue: false,
            duration: 200,
            complete: function () {
                player.debug('player.y = %s', player.y);
                player.element.animate(
                    {
                        'bottom': [player.y, 'easeInQuart']
                    },
                    {
                        queue: false,
                        duration: 200
                    });

            }
        });
};
/**
 *
 * @param sceneX
 * @param viewportDimensions
 */
ACV.Game.Player.prototype.updatePosition = function (sceneX, viewportDimensions) {
    var targetX, classesToAdd, classesToRemove, vieportPositionRatio, speed = 1, player = this;

    //Player is out of sight to the right. Set him right outside the left viewport boundary
    if (this.x < sceneX - this.width)
        this.setPosition(sceneX - this.width);

    //Player is out of sight to the right. Set him right outside the right hand viewport boundary
    if (this.x > sceneX + viewportDimensions.width)
        this.setPosition(sceneX + viewportDimensions.width);

    //Map player's position to a ratio from 0 (left) to 1 (right) to dynamically adapt walking speed
    vieportPositionRatio = (this.x - sceneX) / viewportDimensions.width;

    if (vieportPositionRatio < this.prefs.position.min || vieportPositionRatio > this.prefs.position.max) {
        speed = Math.abs(this.prefs.position.target - vieportPositionRatio);

        targetX = sceneX + this.prefs.position.target * viewportDimensions.width;

        //Make player run faster if he was already moving
        if (this.element.is(':animated'))
            speed *= 2;

        //Reduce redraws by adding/removing as many classes at a time as possible
        if (targetX > this.x) {
            classesToRemove = 'backwards';
            classesToAdd = 'walking forward';
        } else {
            classesToRemove = 'forward';
            classesToAdd = 'walking backwards';
        }
        this.element.stop('walk').removeClass(classesToRemove).addClass(classesToAdd).animate(
            {
                left: targetX
            },
            {
                duration: Math.abs(this.x - targetX) / speed,
                queue: 'walk',
                step: function (now) {
                    var coarseX = Math.round(now / player.prefs.movementTriggerCoarsity);
                    player.x = now;

                    if (coarseX !== player.lastCoarseX) {
                        player.lastCoarseX = coarseX;
                        player.movementListener.call(player, player.x, sceneX, viewportDimensions);
                    }
                },
                complete: function () {
                    player.element.removeClass('walking');
                }
            });
    }
};
