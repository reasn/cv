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

/**
 * @type {number}
 * @since 2014-03-01
 */
ACV.Game.Player.JUMP_DURATION = 200;

/**
 * @type {number}
 * @since 2014-03-01
 */
ACV.Game.Player.JUMP_DISTANCE = 100;

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
    this.setAge(this.prefs.initialAge);
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
    this.element.stop('walk');

    if (x > 0 || x < 0) {
        this.element.css('left', this.x = x);
    }

};

/**
 * @param targetY
 * @return void
 * @since 2014-03-01
 */
ACV.Game.Player.prototype.jumpAndStay = function (targetY) {
    this.debug('Jumping from %s to %s to stay there', this.y, targetY);
    this._jump(targetY);
};

/**
 * @return void
 * @since 2014-03-01
 */
ACV.Game.Player.prototype.jumpUpAndDown = function () {
    this.debug('Jumping up and down (player.y = %s', this.y);
    this._jump(this.y);
};


/**
 *
 * History:
 * 2014-03-01 Now correctly puts the animation into a queue and cancels ongoing jumps before jumping.
 *
 * @param targetY
 * @return void
 * @version 2014-03-01
 */
ACV.Game.Player.prototype._jump = function (targetY) {
    var player = this;
    player.element.stop('jump', true, false).animate(
        {
            bottom: [ACV.Game.Player.JUMP_DISTANCE + Math.max(targetY, this.y), 'easeOutQuart']
        },
        {
            queue: 'jump',
            duration: ACV.Game.Player.JUMP_DURATION,
            complete: function () {

                player.element.animate(
                    {
                        'bottom': [targetY, 'easeInQuart']
                    },
                    {
                        queue: 'jump',
                        duration: ACV.Game.Player.JUMP_DURATION,
                        complete: function () {
                            player.y = targetY;
                        }
                    }).dequeue('jump');

            }
        }).dequeue('jump');
};

/**
 *
 * @param sceneX
 * @param viewportDimensions
 */
ACV.Game.Player.prototype.updatePosition = function (sceneX, viewportDimensions) {
    var targetX, classesToAdd, classesToRemove, viewportPositionRatio, speed = 1, player = this;

    //Player is out of sight to the right. Set him right outside the left viewport boundary
    if (this.x < sceneX - this.width)
        this.setPosition(sceneX - this.width);

    //Player is out of sight to the right. Set him right outside the right hand viewport boundary
    if (this.x > sceneX + viewportDimensions.width)
        this.setPosition(sceneX + viewportDimensions.width);

    //Map player's position to a ratio from 0 (left) to 1 (right) to dynamically adapt walking speed
    viewportPositionRatio = (this.x - sceneX) / viewportDimensions.width;

    if (viewportPositionRatio < this.prefs.position.min || viewportPositionRatio > this.prefs.position.max) {
        speed = Math.abs(this.prefs.position.target - viewportPositionRatio);

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
        this.element.stop('walk', true, false).removeClass(classesToRemove).addClass(classesToAdd).animate(
            {
                left: targetX
            },
            {
                duration: Math.abs(this.x - targetX) / speed,
                queue: 'walk',
                step: function (now) {
                    var coarseX = Math.round(now / player.prefs.movementTriggerGranularity);
                    player.x = now;

                    if (coarseX !== player.lastCoarseX) {
                        player.lastCoarseX = coarseX;
                        player.movementListener.call(player, player.x, sceneX, viewportDimensions);
                    }
                },
                complete: function () {
                    player.element.removeClass('walking');
                }
            }).dequeue('walk');
    }
};
