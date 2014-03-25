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
 *   _element: jQuery
 *   _numberOfEventsVisible: number
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
    _element: null,
    _eventWrapper: null,
    _numberOfEventsVisible: 0
});

/**
 *
 * @param {jQuery} hudElement
 */
ACV.HUD.Timeline.prototype.init = function (hudElement) {
    var timeline = this;

    this._element = $('<div class="timeline" ><div class="event-wrapper" /></div>');
    this._eventWrapper = this._element.children('.event-wrapper');

    hudElement.append(this._element);

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
    var eventIndex, event, lastIndexRemoved = -1;

    for (eventIndex in this._events) {
        event = this._events[eventIndex];

        if (playerX > event.playerX && playerXBefore < event.playerX && !event.visible) {
            this._prepend(event);

        } else if (playerX < event.playerX && playerXBefore > event.playerX && event.visible) {
            this._remove(event);
            lastIndexRemoved = eventIndex;
        }
    }
    if (this._numberOfEventsVisible > this._prefs.maxVisibleEvents) {
        //Assume that the events are in ascending order
        for (eventIndex in this._events) {
            event = this._events[eventIndex];
            if (event.visible) {
                this.debug('Too many timeline events visible, removing lowermost');
                this._remove(event);
                break;
            }
        }
    }
    if (lastIndexRemoved !== -1 && this._numberOfEventsVisible < this._prefs.minVisibleEvents) {
        //Assume that the events are in ascending order
        for (eventIndex = lastIndexRemoved - 1; eventIndex >= 0; eventIndex--) {
            //Find the first element that is invisible moving downwards starting at lastIndexRemoved
            event = this._events[eventIndex];

            if (!event.visible) {
                this._append(event);
                break;
            }
        }
    }
};
ACV.HUD.Timeline.prototype._remove = function (event) {
    var timeline = this;
    event.visible = false;
    timeline._numberOfEventsVisible--;
    event.element.animate({
        opacity: 0
    }, 400, 'easeInCirc', function () {
        event.element.animate({
            height: 0,
            margin: 0
        }, 500, 'easeOutCirc', function () {
            event.removeFromDom();
        });
    });
};

ACV.HUD.Timeline.prototype._prepend = function (event) {
    var eventElement, timeline = this;
    event.visible = true;
    timeline._numberOfEventsVisible++;
    eventElement = event.getElement();

    this._eventWrapper.prepend(eventElement);

    var height = eventElement.height();
    //alert(height);
    eventElement.css({opacity: 0, height: 0});


    eventElement.animate({height: height}, 'easeOutCirc', function () {
        eventElement.animate({
            opacity: 1
        }, 500, 'easeOutCirc')
    });
};

ACV.HUD.Timeline.prototype._append = function (event) {
    event.visible = true;
    this._eventWrapper.append(event.getElement());
    this._numberOfEventsVisible++;
};