"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};

/**
 * @type {function} {{
 *   visible: boolean
 *   playerX: number
 *   timestamp: Date
 *   type: string
 *   data: Object
 *   element: jQuery
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

ACV.HUD.TimelineEvent.prototype = ACV.Core.createPrototype('ACV.HUD.TimelineEvent', {
    visible: false,
    playerX: 0,
    _timestamp: null,
    _type: '',
    _data: null,
    element: null
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
 */
ACV.HUD.TimelineEvent.prototype.removeFromDom = function () {
    this.element.remove();
    this.element = null;
    this.debug('removed event %s from dom', this._data.message);
};

/**
 * This method directly deserializes HTML because that leverages the browsers DOM parser
 * and therefore results in the best performance.
 *
 * @returns {jQuery}
 * @private
 */
ACV.HUD.TimelineEvent.prototype.getElement = function () {

    if (this.element !== null) {
        return this.element;
    }
    this.debug('creating element for event %s', this._data.message);
    switch (this._type) {
        case 'post':
            return this.element = $('<div class="event"><h1>' + this._data.message + '</h1></div>');
        case 'activity':
            return this.element = $('<div class="event"><h1>' + this._data.message + '</h1></div>');
        default:
            throw 'Invalid timeline element type' + this._type;
    }
};

