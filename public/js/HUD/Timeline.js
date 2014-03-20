"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};

/**
 * @type {{
 *   _appContext: AppContext
 *   _events: Array.<TimelineEvent>
 *   domNode: jQuery
 * }}
 * @param {ACV.AppContext} appContext
 * @param {Object} prefs
 * @param {Array.<TimelineEvent>} events
 * @constructor
 */
ACV.HUD.Timeline = function (appContext, prefs, events) {
    this._appContext = appContext;
    this._prefs = prefs;
    this._events = events;
};

/**
 * @param {ACV.AppContext} appContext
 * @param {Object} data
 * @returns {ACV.HUD.Timeline}
 */
ACV.HUD.Timeline.createFromData = function (appContext, data) {
    var eventIndex, timelineElements = [];

    for (eventIndex in data.events) {
        timelineElements.push(ACV.HUD.TimelineEvent.createFromData(data.events[eventIndex]));
    }
    return new ACV.HUD.Timeline(appContext, data.prefs, timelineElements);
};


ACV.HUD.Timeline.prototype = ACV.Core.createPrototype('ACV.HUD.Timeline', {
    _appContext: null,
    _prefs: null,
    _events: [],
    _domNode: null,
    _elementWrapper: null
});

/**
 *
 * @param {jQuery} hudElement
 */
ACV.HUD.Timeline.prototype.init = function (hudElement) {
    var timeline = this;

    this._domNode = $('<div id="timeline" ><div class="element-wrapper" /></div>');
    this._elementWrapper = this._domNode.children('.element-wrapper');

    hudElement.append(this._domNode);

    if (this._appContext.player === undefined) {
        throw 'player must have been instantiated before Timeline can be initialized.';
    }
    this._appContext.player.addMovementListener(function (playerX, playerXBefore) {
        timeline._update(playerX, playerXBefore);
    });

    this.debug('Timeline initialized');
};
/**
 *
 * @param {number} playerX
 * @param {number} playerXBefore
 * @private
 */
ACV.HUD.Timeline.prototype._update = function (playerX, playerXBefore) {
    var elementIndex, element;

    for (elementIndex in this._events) {
        element = this._events[elementIndex];

        if (playerX > element.playerX && playerXBefore < element.playerX && element.domNode === null) {
            element.addToDom(this._elementWrapper);
        } else if (playerX < element.playerX && playerXBefore > element.playerX && element.domNode !== null) {
            element.removeFromDom();
        }
    }
};