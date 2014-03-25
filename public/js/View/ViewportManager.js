"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

/**
 * @typedef {function(this:window, lastRatio: float, ratioBefore: float, interval: number, viewportDimensions: ViewportDimensions)} ViewportListener
 */


/**
 * @name ViewportDimensions
 * @type {Object}
 * @property {number} width - the viewport's width
 * @property {number} height - the viewport's height
 * @property {boolean} widthChanged - A flag whether the viewport width has just changed
 * @property {boolean} heightChanged - A flag whether the viewport height has just changed
 */

/**
 * @type {Object} {{
 *   _listeners: Array<ViewportListener>
 * }}
 * @param {jQuery} staticContainer
 * @param {number} scrollableDistance
 * @param {number} moveMethod
 * @constructor
 */
ACV.ViewportManager = function (staticContainer, scrollableDistance, moveMethod) {
    this._staticContainer = staticContainer;
    this.scrollableDistance = scrollableDistance;
    this.moveMethod = moveMethod;
};

ACV.ViewportManager.SCROLL_DRAG = 0x01;
ACV.ViewportManager.SCROLL_NATIVE = 0x02;
ACV.ViewportManager.SCROLL_WHEEL = 0x03;

ACV.ViewportManager.maxInterval = 1000;

ACV.ViewportManager.prototype = ACV.Core.createPrototype('ACV.ViewportManager', {
    _containerFixedToViewport: false,
    _staticContainer: null,
    _currentScrollOffset: 0,
    _listeners: [],
    viewportDimensions: {
        width: 0,
        height: 0,
        widthChanged: false,
        heightChanged: false
    },
    _lastViewportDimensions: {
        width: 0,
        height: 0
    },
    lastTrigger: null,
    moveMethod: true,
    touch: {
        virtualPosition: 0,
        lastY: null
    }
});

ACV.ViewportManager.prototype.init = function () {
    var vpm, w, body;

    vpm = this;
    w = $(window);
    body = $('body');

    this._containerDistanceFromTop = this._staticContainer.position().top;

    if (this.moveMethod === ACV.ViewportManager.SCROLL_DRAG) {
        body.on('touchmove', function (e) {
            var y = e.originalEvent.changedTouches[0].screenY;
            if (vpm.touch.lastY !== null && y > 0) {
                vpm.touch.virtualPosition = Math.max(0, vpm.touch.virtualPosition - (y - vpm.touch.lastY));
                vpm._handleScroll(Math.min(vpm.scrollableDistance, vpm._currentScrollOffset + vpm.touch.virtualPosition));
            }
            vpm.touch.lastY = y;
        });
        body.on('touchend', function (e) {
            vpm.touch.lastY = null;
        });
    } else if (this.moveMethod === ACV.ViewportManager.SCROLL_NATIVE) {
        body.css('height', this.scrollableDistance + 'px');
        $(document).on('scroll', function (event) {
            vpm._handleScroll(Math.min(vpm.scrollableDistance, $(document).scrollTop()));
        });

    } else if (this.moveMethod === ACV.ViewportManager.SCROLL_WHEEL) {

        body.on('mousewheel DOMMouseScroll', function (event) {
            vpm._handleScroll(Math.min(vpm.scrollableDistance, vpm._currentScrollOffset + event.originalEvent.deltaY));
        });
    } else {
        throw new Error('Unknown movement method "' + this.moveMethod + '".');
    }

    w.on('resize', function () {
        vpm._handleResize(false);
    });
    vpm.viewportDimensions.width = w.width();
    vpm.viewportDimensions.height = w.height();

    this.info('ViewportManager initialized');
};

ACV.ViewportManager.prototype.fireAllTriggers = function () {
    this._handleResize(true);
};

ACV.ViewportManager.prototype._handleScroll = function (newOffset) {
    this._currentScrollOffset = newOffset;
    this.viewportDimensions.widthChanged = false;
    this.viewportDimensions.heightChanged = false;
    this._handleChange(false);
};

/**
 * Note: viewportDimensions is never changed, only its properties are being set. That allows the entire
 * application to keep references to it.
 *
 * @param {boolean} keepFixationStatus
 * @private
 */
ACV.ViewportManager.prototype._handleResize = function (keepFixationStatus) {
    if (!this._containerFixedToViewport) {
        this._staticContainer.css('height', $(window).height());
    }

    this.viewportDimensions.width = this._staticContainer.width();
    this.viewportDimensions.height = this._staticContainer.height();

    this.viewportDimensions.widthChanged = this.viewportDimensions.width !== this._lastViewportDimensions.width;
    this.viewportDimensions.heightChanged = this.viewportDimensions.height !== this._lastViewportDimensions.height;

    if (this.viewportDimensions.widthChanged) {
        this.debug('viewport width changed from %s to %s', this._lastViewportDimensions.width, this.viewportDimensions.width);
    }
    if (this.viewportDimensions.heightChanged) {
        this.debug('viewport height changed from %s to %s', this._lastViewportDimensions.height, this.viewportDimensions.height);
    }

    this._lastViewportDimensions.width = this.viewportDimensions.width;
    this._lastViewportDimensions.height = this.viewportDimensions.height;

    this._handleChange(keepFixationStatus);
};

/**
 *
 * @param {boolean} keepFixationStatus
 * @private
 */
ACV.ViewportManager.prototype._handleChange = function (keepFixationStatus) {
    var now, interval, ratioBefore, listenerIndex, distance;

    distance = this._currentScrollOffset;

    if (!keepFixationStatus) {
        //Automatically start and stop to play when container touches top of the viewport
        if (!this._containerFixedToViewport && distance > this._containerDistanceFromTop) {
            this._containerFixedToViewport = true;
            this._staticContainer.addClass('fixed');
            this._staticContainer.css('height', 'auto');
            if (this.moveMethod === ACV.ViewportManager.SCROLL_WHEEL) {
                //Required to have a smooth transition between textual content and game container
                $(window).scrollTop(this._containerDistanceFromTop);
            }

        } else if (this._containerFixedToViewport && distance < this._containerDistanceFromTop) {
            this._containerFixedToViewport = false;
            this._staticContainer.removeClass('fixed');
            if (this.moveMethod === ACV.ViewportManager.SCROLL_WHEEL) {
                //Required to have a smooth transition between textual content and game container
                $(window).scrollTop(this._containerDistanceFromTop);
            }
            this._handleResize();
            return;
        } else if (!this._containerFixedToViewport) {
            return;
        }
        distance -= this._containerDistanceFromTop;
    }

    now = new Date().getTime();
    if (this.lastTrigger === null) {
        interval = null;
    }
    else {
        interval = now - this.lastTrigger;
        if (interval > ACV.ViewportManager.maxInterval)
            interval = null;
    }
    this.lastTrigger = now;

    ratioBefore = this.lastRatio;
    this.lastRatio = Math.min(1, distance / Math.max(0, this.scrollableDistance - this.viewportDimensions.height));


    for (listenerIndex in this._listeners) {
        this._listeners[listenerIndex].call(window, this.lastRatio, ratioBefore, interval, this.viewportDimensions);
    }
};

/**
 *
 * @param {ViewportListener} callback
 */
ACV.ViewportManager.prototype.listen = function (callback) {
    this._listeners.push(callback);
};

/**
 * @param {ViewportListener} callback
 */
ACV.ViewportManager.prototype.stopListening = function (callback) {
    var listenerIndex;

    for (listenerIndex in this._listeners) {
        if (this._listeners[listenerIndex] === callback) {
            this._listeners = this._listeners.splice(listenerIndex, 1);
            return;
        }
    }
};

