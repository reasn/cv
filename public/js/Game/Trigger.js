"use strict";

/**
 * @since 2013-11-24
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

/**
 * @type {{
 *   _range: Array.<number>
 *   _before: string
 *   _after: string
 *   relativeTo: string
 *   _currentlyInsideRange: boolean
 *   _fireOnEnter: boolean
 * }}
 * @param {Array.<number>} range
 * @param {?string} before
 * @param {?string} after
 * @param {string} relativeTo
 * @param {boolean} fireOnEnter
 * @constructor
 */
ACV.Game.Trigger = function (range, before, after, relativeTo, fireOnEnter) {
    this._range = range;
    this._before = before ? before : null;
    this._after = after ? after : null;
    this.relativeTo = relativeTo;
    this._fireOnEnter = !!fireOnEnter;
};

ACV.Game.Trigger.PATTERN = /([a-zA-Z\.]+)\(([^\)]+)\)/;

ACV.Game.Trigger.prototype = ACV.Core.createPrototype('ACV.Game.Trigger',
    {
        _range: [0, 0],
        _before: null,
        _after: null,
        relativeTo: 'player',
        _currentlyInsideRange: false,
        _fireOnEnter: false
    });

ACV.Game.Trigger.createFromData = function (data) {

    if (typeof data.playerX === 'number') {
        return new ACV.Game.Trigger([data.playerX, data.playerX], data.before, data.after, 'player', false);
    } else if (typeof(data.playerX === 'object')) {
        if (data.playerX.length !== 2) {
            throw 'A trigger\'s value declaration must be a number or an array consisting of two numbers. But is ' + JSON.stringify(data.playerX);
        }
        return new ACV.Game.Trigger(data.playerX, data.before, data.after, 'player', data.fireOnEnter);
    } else {
        throw 'Not implemented yet';
        //  return new ACV.Game.Trigger(data.playerX, data.before, data.after, 'level');
    }
}
;

ACV.Game.Trigger.prototype.determineActionToBeExecuted = function (value, lastValue) {
    var inFromLeft, inFromRight;
    var outToLeft = value < this._range[0] && lastValue > this._range[0];
    var outToRight = value > this._range[1] && lastValue < this._range[1];

    /**
     *
     *  If this flag is set the trigger's actions are fired when entering and not when leaving the range.
     *
     *  Deprecated if not reused after 2014-03-20:
     *  Some actions need to be triggered at both boundaries of a range. E.g. if the player jumps up:
     *  The player should start to jump if playerX became larger than 1000 to stand on a higher plane
     *  when playerX is 1200. When moving backwards the player should start to jump when playerX just
     *  became lower than 1200 to be standing at the lower plane when playerX is 1000.
     *  If now the player turns around during the jump the appropriate counter-action has to be triggered.
     *  Example trigger:
     *  {
     *    "playerX": [1400, 1600],
     *    "before": "player.jumpAndStay(270)",
     *    "after": "player.jumpAndStay(150)",
     *    "fireOnEnter": true
     *  }
     *  If the player now turns around while in the air (e.g. at playerX=1500) the appropriate action is
     *  triggered to make sure that before and after always hold when the player is outside the specified
     *  range (1400-1600).
     */
    if (this._fireOnEnter) {
        inFromLeft = value > this._range[0] && lastValue < this._range[0];
        inFromRight = value < this._range[1] && lastValue > this._range[1];

        if (inFromLeft && this._after) {
            return this._unpack(this._after);
        }
        if (inFromRight && this._before) {
            return this._unpack(this._before);
        }
    } else {
        if (outToLeft && this._before !== null) {
            return this._unpack(this._before);
        }
        if (outToRight && this._after !== null) {
            return this._unpack(this._after);
        }
    }


    return null;
}
;

ACV.Game.Trigger.prototype._unpack = function (action) {

    var matches = ACV.Game.Trigger.PATTERN.exec(action);
    if (matches.length < 2) {
        this.warn('Invalid trigger "%s".', action);
        return null;
    }
    return {
        action: matches[1],
        args: matches[2].split(',')
    };

};