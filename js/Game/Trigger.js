"use strict";

/**
 * @since 2013-11-24
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

/**
 *
 * @name TriggerAction
 * @type {Object}
 * @property {string} action- The action to take (e.g. "player.setAge")
 * @property {Array.<string>} args - The arguments to accompany the action
 */

/**
 * @type {{
 *   _range: Array.<number>
 *   _before: string
 *   _after: string
 *   relativeTo: string
 *   _currentlyInsideRange: boolean
 *   _fireOnEnter: boolean
 *   _stateBefore: boolean
 *   _in: boolean
 *   _wasIn: boolean
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
        _fireOnEnter: false,
        _stateBefore: true,
        _in: false,
        _wasIn: false
    });
/**
 *
 * @param {Object} data
 * @returns {ACV.Game.Trigger}
 */
ACV.Game.Trigger.createFromData = function (data) {

    if (typeof data.playerX === 'number') {
        return new ACV.Game.Trigger([data.playerX, data.playerX], data.before, data.after, 'player', false);
    } else if (typeof(data.playerX === 'object')) {
        if (data.playerX.length !== 2 && data.playerX.length !== 3) {
            throw 'A trigger\'s value declaration must be a number or an array consisting of two or three numbers. But is ' + JSON.stringify(data.playerX);
        }
        return new ACV.Game.Trigger(data.playerX, data.before, data.after, 'player', data.fireOnEnter);
    } else {
        throw 'Not implemented yet';
        //  return new ACV.Game.Trigger(data.playerX, data.before, data.after, 'level');
    }
};

/**
 *
 * @param {number} value
 * @param {number} lastValue
 * @param {number} targetValue This value is required for ranged trigger animations (e.g. jumps).
 * @returns {?TriggerAction}
 */
ACV.Game.Trigger.prototype.determineActionToBeExecuted = function (value, lastValue, targetValue) {
    var a = this._range[0];
    var b = this._range[this._range.length - 1];
    var m = this._range.length === 3 ? this._range[1] : null;

    var inFromLeft = value > a && lastValue < a;
    var inFromRight = value < b && lastValue > b;
    var outToLeft = value < a && lastValue > a;
    var outToRight = value > b && lastValue < b;

    if (this._fireOnEnter) {
        /*
         * These triggers can take into account targetValue to decide whether and which action
         * should be taken. For that variable m is required. It allows to check in which state
         * (before or after) the trigger should be and what action should be triggered.
         */
        this._in = (this._wasIn || inFromLeft || inFromRight) && !(outToRight || outToLeft);
        this._wasIn = this._in;

        if (targetValue > b || (m !== null && targetValue > m)) {
            if (inFromLeft || (this._in && this._stateBefore)) {
                this._stateBefore = false;
                return this._unpack(this._after);
            }
        } else if (targetValue < a || (m !== null && targetValue < m)) {
            if (inFromRight || (this._in && !this._stateBefore)) {
                this._stateBefore = true;
                return this._unpack(this._before);
            }
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
};

/**
 *
 * @param {string} action
 * @returns {?TriggerAction}
 * @private
 */
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