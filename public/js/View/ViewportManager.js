"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};
/**
 * @param {jQuery} staticContainer
 * @param {number} scrollableDistance
 * @param {boolean} moveByDrag
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

ACV.ViewportManager.prototype = ACV.Core.createPrototype('ACV.ViewportManager',
    {
        _containerFixedToViewport: false,
        _staticContainer: null,
        _currentScrollOffset: 0,
        listeners: [],
        viewportDimensions: {
            width: 0,
            height: 0,
            changed: false
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
                vpm._currentScrollOffset = vpm.touch.virtualPosition;
                vpm._handleScroll(false);
            }
            vpm.touch.lastY = y;
        });
        body.on('touchend', function (e) {
            vpm.touch.lastY = null;
        });
    } else if (this.moveMethod === ACV.ViewportManager.SCROLL_NATIVE) {
        body.css('height', this.scrollableDistance + 'px');
        $(document).on('scroll', function (event) {
            vpm._currentScrollOffset = $(document).scrollTop();
            vpm._handleScroll(false);
        });

    } else if (this.moveMethod === ACV.ViewportManager.SCROLL_WHEEL) {

        body.on('mousewheel DOMMouseScroll', function (event) {
            vpm._currentScrollOffset += event.originalEvent.deltaY;
            vpm._handleScroll(false);
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

ACV.ViewportManager.prototype._handleResize = function (forceFire) {
    var w = $(window);
    this.viewportDimensions.width = this._staticContainer.width();
    this.viewportDimensions.height = w.height();
    this.viewportDimensions.changed = true;

    if (!this._containerFixedToViewport) {
        this._staticContainer.css({
            height: this.viewportDimensions.height
        });
    }
    this._handleScroll(forceFire);
};

/**
 *
 * @param {number} forceFire
 * @private
 */
ACV.ViewportManager.prototype._handleScroll = function (forceFire) {
    var now, interval, ratioBefore;

    var distance = this._currentScrollOffset;

    if (!forceFire) {
        //Automatically start and stop to play when container touches top of the viewport
        if (!this._containerFixedToViewport && distance > this._containerDistanceFromTop) {
            this._containerFixedToViewport = true;
            this._staticContainer.addClass('fixed');
            if (this.moveMethod === ACV.ViewportManager.SCROLL_WHEEL) {
                //Required to have a smooth transition between textual content and game container
                $(window).scrollTop(this._containerDistanceFromTop);
            }

        } else if (this._containerFixedToViewport && distance < this._containerDistanceFromTop) {
            this._containerFixedToViewport = false;
            this.warn('%s && %s < %s ', this._containerFixedToViewport ? 'true' : 'false', distance, this._containerDistanceFromTop);
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


    for (var i in this.listeners) {
        this.listeners[i].call(window, this.lastRatio, ratioBefore, interval, this.viewportDimensions);
    }
    this.viewportDimensions.changed = false;

};
ACV.ViewportManager.prototype.listen = function (callback) {
    this.listeners.push(callback);
};

ACV.ViewportManager.prototype.stopListening = function (callback) {
    for (var i in this.listeners) {
        if (this.listeners[i] === callback) {
            this.listeners = this.listeners.splice(i, 1);
            return;
        }
    }
};

