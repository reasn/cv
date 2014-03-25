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
 *   _containerFixedToViewport: boolean
 *   _staticContainer: jQuery
 *   _currentScrollOffset: number
 *   _listeners: Array<ViewportListener>
 *   _dimensions: ViewportDimensions
 *   _lastViewportDimensions: { width: number, height: number }
 *   _moveMethod: number
 *   _touch: { virtualPosition: number, lastY: number }
 * }}
 * @param {jQuery} staticContainer
 * @param {number} scrollableDistance
 * @param {number} _moveMethod
 * @constructor
 */
ACV.ViewportManager = function (staticContainer, scrollableDistance, _moveMethod) {
    this._staticContainer = staticContainer;
    this.scrollableDistance = scrollableDistance;
    this._moveMethod = _moveMethod;
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
    _dimensions: {
        width: 0,
        height: 0,
        widthChanged: false,
        heightChanged: false
    },
    _lastViewportDimensions: {
        width: 0,
        height: 0
    },
    _moveMethod: -1,
    _touch: {
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

    if (this._moveMethod === ACV.ViewportManager.SCROLL_DRAG) {
        body.on('touchmove', function (e) {
            var y = e.originalEvent.changedTouches[0].screenY;
            if (vpm._touch.lastY !== null && y > 0) {
                vpm._touch.virtualPosition = Math.max(0, vpm._touch.virtualPosition - (y - vpm._touch.lastY));
                vpm._handleScroll(Math.min(vpm.scrollableDistance, vpm._currentScrollOffset + vpm._touch.virtualPosition));
            }
            vpm._touch.lastY = y;
        });
        body.on('touchend', function () {
            vpm._touch.lastY = null;
        });
    } else if (this._moveMethod === ACV.ViewportManager.SCROLL_NATIVE) {
        body.css('height', this.scrollableDistance + 'px');
        $(document).on('scroll', function () {
            vpm._handleScroll(Math.min(vpm.scrollableDistance, $(document).scrollTop()));
        });

    } else if (this._moveMethod === ACV.ViewportManager.SCROLL_WHEEL) {

        body.on('mousewheel DOMMouseScroll', function (event) {
            vpm._handleScroll(Math.min(vpm.scrollableDistance, vpm._currentScrollOffset + event.originalEvent.deltaY));
        });
    } else {
        throw new Error('Unknown movement method "' + this._moveMethod + '".');
    }

    w.on('resize', function () {
        vpm._handleResize();
        vpm._fire();
    });
    vpm._dimensions.width = w.width();
    vpm._dimensions.height = w.height();

    this.info('ViewportManager initialized');
};

ACV.ViewportManager.prototype.fireAllTriggers = function () {
    this._handleResize();
    this._fire();
};

ACV.ViewportManager.prototype._handleScroll = function (newOffset) {
    this._currentScrollOffset = newOffset;
    this._dimensions.widthChanged = false;
    this._dimensions.heightChanged = false;
    this._updateFixationStatus();
    if (this._containerFixedToViewport) {
        this._fire();
    }
};

/**
 * Note: _dimensions is never changed, only its properties are being set. That allows the entire
 * application to keep references to it.
 *
 * @private
 */
ACV.ViewportManager.prototype._handleResize = function () {

    this._updateDimensions();
    this._updateFixationStatus();
};

ACV.ViewportManager.prototype._updateDimensions = function () {
    if (!this._containerFixedToViewport) {
        this._staticContainer.css('height', $(window).height());
    }

    this._dimensions.width = this._staticContainer.width();
    this._dimensions.height = this._staticContainer.height();

    this._dimensions.widthChanged = this._dimensions.width !== this._lastViewportDimensions.width;
    this._dimensions.heightChanged = this._dimensions.height !== this._lastViewportDimensions.height;

    if (this._dimensions.widthChanged) {
        this.debug('viewport width changed from %s to %s', this._lastViewportDimensions.width, this._dimensions.width);
    }
    if (this._dimensions.heightChanged) {
        this.debug('viewport height changed from %s to %s', this._lastViewportDimensions.height, this._dimensions.height);
    }

    this._lastViewportDimensions.width = this._dimensions.width;
    this._lastViewportDimensions.height = this._dimensions.height;
};

ACV.ViewportManager.prototype._updateFixationStatus = function () {

//Automatically start and stop to play when container touches top of the viewport

    if (!this._containerFixedToViewport && this._currentScrollOffset > this._containerDistanceFromTop) {
        this._containerFixedToViewport = true;
        this._staticContainer.addClass('fixed');
        this._staticContainer.css('height', 'auto');
        if (this._moveMethod === ACV.ViewportManager.SCROLL_WHEEL) {
            //Required to have a smooth transition between textual content and game container
            $(window).scrollTop(this._containerDistanceFromTop);
        }

    } else if (this._containerFixedToViewport && this._currentScrollOffset < this._containerDistanceFromTop) {
        this._containerFixedToViewport = false;
        this._staticContainer.removeClass('fixed');
        if (this._moveMethod === ACV.ViewportManager.SCROLL_WHEEL) {
            //Required to have a smooth transition between textual content and game container
            $(window).scrollTop(this._containerDistanceFromTop);
        }
        this._updateDimensions();
    }
};

ACV.ViewportManager.prototype._fire = function () {
    var ratioBefore, listenerIndex, distance;

    distance = Math.max(0, this._currentScrollOffset - this._containerDistanceFromTop);

    ratioBefore = this.lastRatio;
    this.lastRatio = Math.min(1, distance / Math.max(0, this.scrollableDistance - this._dimensions.height));

    for (listenerIndex in this._listeners) {
        this._listeners[listenerIndex].call(window, this.lastRatio, ratioBefore, this._dimensions);
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
 *
 * @returns {ViewportDimensions}
 * @since 2014-03-25
 */
ACV.ViewportManager.prototype.getDimensions = function () {
    return this._dimensions;
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

