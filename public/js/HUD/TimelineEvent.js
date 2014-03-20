"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};

/**
 * @type {function} {{
 *   playerX: number
 *   timestamp: Date
 *   type: string
 *   data: Object
 *   domNode: jQuery
 * }}
 * @param {number} playerX
 * @param {Date} timestamp
 * @param {string} type
 * @param {string} data
 * @constructor
 */
ACV.HUD.TimelineEvent = function (playerX, timestamp, type, data) {
    this.playerX = playerX;
    this._timestamp = timestamp;
    this._type = type;
    this._data = data;
};

ACV.HUD.TimelineEvent.prototype = ACV.Core.createPrototype('ACV.HUD.Timeline', {
    playerX: 0,
    _timestamp: null,
    _type: '',
    _data: null,
    domNode: null
});

/**
 *
 * @param {Object} rawElement
 * @returns {ACV.HUD.TimelineEvent}
 */
ACV.HUD.TimelineEvent.createFromData = function (rawElement) {
    return new ACV.HUD.TimelineEvent(rawElement.playerX, new Date(rawElement.timestamp), rawElement.type, rawElement.data);
};

/**
 *
 * @param {jQuery} wrapperElement
 */
ACV.HUD.TimelineEvent.prototype.addToDom = function (wrapperElement) {
    this.domNode = this._createElement();
    wrapperElement.append(this.domNode);
};

/**
 *
 */
ACV.HUD.TimelineEvent.prototype.removeFromDom = function () {
    this.domNode.remove();
    this.domNode = null;
};

/**
 * This method directly deserializes HTML because that leverages the browsers DOM parser
 * and therefore results in the best performance.
 *
 * @returns {jQuery}
 * @private
 */
ACV.HUD.TimelineEvent.prototype._createElement = function () {

    switch (this._type) {
        case 'post':
            return $('<h1>Test</h1>');
        case 'activity':
            return $('<h1>Activity</h1>');
        default:
            throw 'Invalid timeline element type' + this._type;
    }
};

