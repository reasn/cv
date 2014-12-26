"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.View = ACV.View ? ACV.View : {};

/**
 * @typedef {function(this:window, lastRatio: float, ratioBefore: float, viewportDimensions: ViewportDimensions)} ViewportScrollListener
 * @typedef {function(this:window, clientX: number, clientY: number, viewportDimensions: ViewportDimensions)} ViewportMouseClickListener
 * @typedef {function(this:window, clientX: number, clientY: number, viewportDimensions: ViewportDimensions)} ViewportMouseMoveListener
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
 *   _staticContainer: jQuery
 *   _currentScrollOffset: number
 *   _scrollListeners: Array<ViewportScrollListener>
 *   _clickListeners: Array<ViewportMouseClickListener>
 *   _moveListeners: Array<ViewportMouseMoveListener>
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

ACV.ViewportManager.SCROLL_CLICK_AND_EDGE = 0x01;
ACV.ViewportManager.SCROLL_NATIVE = 0x02;
ACV.ViewportManager.SCROLL_WHEEL = 0x03;

ACV.ViewportManager.maxInterval = 1000;

ACV.ViewportManager.prototype = ACV.Core.createPrototype('ACV.ViewportManager', {
    _staticContainer       : null,
    _currentScrollOffset   : 0,
    _scrollListeners       : [],
    _clickListeners        : [],
    _moveListeners         : [],
    _dimensions            : {
        width        : 0,
        height       : 0,
        widthChanged : false,
        heightChanged: false
    },
    _lastViewportDimensions: {
        width : 0,
        height: 0
    },
    _moveMethod            : -1,
    _touch                 : {
        virtualPosition: 0,
        lastY          : null
    },
    _scrollMethod          : null
});

ACV.ViewportManager.prototype.init = function () {
    var vpm, w, body;

    vpm = this;
    w = $(window);
    body = $('body');

    this._containerDistanceFromTop = this._staticContainer.position().top;

    if (this._moveMethod === ACV.ViewportManager.SCROLL_CLICK_AND_EDGE) {
        this._scrollMethod = new ACV.View.ClickAndEdgeScrollMethod(this, this.scrollableDistance);

    } else if (this._moveMethod === ACV.ViewportManager.SCROLL_NATIVE) {
        this._scrollMethod = new ACV.View.NativeScrollMethod(this, this.scrollableDistance);

    } else if (this._moveMethod === ACV.ViewportManager.SCROLL_WHEEL) {
        this._scrollMethod = new ACV.View.WheelScrollMethod(this, this.scrollableDistance);

    } else {
        throw new Error('Unknown movement method "' + this._moveMethod + '".');
    }

    this._scrollMethod.init(this._containerDistanceFromTop);

    w.on('resize', function () {
        vpm._handleResize();
        vpm._fire();
    });

    w.on('mousemove', function (event) {
        var listenerIndex;
        for (listenerIndex in vpm._moveListeners) {
            vpm._moveListeners[listenerIndex](event.clientX, event.clientY, vpm._dimensions);
        }
    });

    w.on('click', function (event) {
        var listenerIndex;
        for (listenerIndex in vpm._clickListeners) {
            vpm._clickListeners[listenerIndex](event.clientX, event.clientY, vpm._dimensions);
        }
    });

    vpm._dimensions.width = w.width();
    vpm._dimensions.height = w.height();

    this.info('ViewportManager initialized');
};

ACV.ViewportManager.prototype.start = function () {
    this.debug('Scroll to top and firing all triggers');
    $(window).scrollTop(0);
    this._handleResize();
    this._fire();
};

ACV.ViewportManager.prototype.handleScroll = function (newOffset) {
    this._currentScrollOffset = Math.min(this.scrollableDistance, newOffset);
    this._dimensions.widthChanged = false;
    this._dimensions.heightChanged = false;
    this._scrollMethod.handleFixation(this._staticContainer);
    if (this._scrollMethod.isGameActive()) {
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
    this._scrollMethod.handleFixation(this._staticContainer);
};

ACV.ViewportManager.prototype._updateDimensions = function () {

    this._staticContainer.css('height', $(window).height());

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

ACV.ViewportManager.prototype._fire = function () {
    var ratioBefore, listenerIndex, distance;

    ratioBefore = this.lastRatio;
    this.lastRatio = Math.max(0, Math.min(1, this._currentScrollOffset / Math.max(0, this.scrollableDistance - this._dimensions.height)));

    for (listenerIndex in this._scrollListeners) {
        this._scrollListeners[listenerIndex].call(window, this.lastRatio, ratioBefore, this._dimensions);
    }
};

/**
 *
 * @param {ViewportScrollListener} callback
 */
ACV.ViewportManager.prototype.listenToScroll = function (callback) {
    this._scrollListeners.push(callback);
};

/**
 *
 * @param {ViewportMouseClickListener} callback
 */
ACV.ViewportManager.prototype.listenToMouseClick = function (callback) {
    this._clickListeners.push(callback);
};

/**
 *
 * @param {ViewportMouseMoveListener} callback
 */
ACV.ViewportManager.prototype.listenToMouseMove = function (callback) {
    this._moveListeners.push(callback);
};

/**
 *
 * @returns {ViewportDimensions}
 * @since 2014-03-25
 */
ACV.ViewportManager.prototype.getDimensions = function () {
    return this._dimensions;
};
