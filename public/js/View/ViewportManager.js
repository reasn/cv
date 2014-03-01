"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.ViewportManager = function(staticContainer, scrollableDistance, moveByDrag)
{
    this.staticContainer = $(staticContainer);
    this.scrollableDistance = scrollableDistance;
    this.moveByDrag = moveByDrag;
};

ACV.ViewportManager.maxInterval = 1000;

ACV.ViewportManager.prototype = ACV.Core.createPrototype('ACV.ViewportManager',
{
    staticContainer: null,
    listeners: [],
    viewportDimensions:
    {
        width: 0,
        height: 0,
        changed: false
    },
    lastTrigger: null,
    moveByDrag: true,
    touch:
    {
        virtualPosition: 0,
        lastY: null
    }
});

ACV.ViewportManager.prototype.init = function()
{
    var vpm = this, w = $(window), body = $('body');

    this.staticContainer.css(
    {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        position: 'fixed'
    });

    if (this.moveByDrag)
    {
        body.on('touchmove', function(e)
        {
            var y = e.originalEvent.changedTouches[0].screenY;
            if (vpm.touch.lastY !== null && y > 0)
            {
                vpm.touch.virtualPosition = Math.max(0, vpm.touch.virtualPosition - (y - vpm.touch.lastY));
                vpm._trigger(vpm.touch.virtualPosition);
            }
            vpm.touch.lastY = y;
        });
        body.on('touchend', function(e)
        {
            vpm.touch.lastY = null;
        });
    } else
    {
        body.css('height', this.scrollableDistance + 'px');
        $(document).on('scroll', function()
        {
            vpm._trigger($(document).scrollTop());
        });

    }

    w.on('resize', function()
    {
        vpm.triggerAll();
    });
    vpm.viewportDimensions.width = w.width();
    vpm.viewportDimensions.height = w.height();

    this.info('ViewportManager initialized');
};

ACV.ViewportManager.prototype.triggerAll = function()
{
    var w = $(window);
    this.viewportDimensions.width = w.width();
    this.viewportDimensions.height = w.height();
    this.viewportDimensions.changed = true;
    if (this.moveByDrag)
        this._trigger(this.touch.virtualPosition);
    else
        this._trigger($(document).scrollTop());
};
ACV.ViewportManager.prototype._trigger = function(distance)
{
    var now, interval, ratioBefore;
    now = new Date().getTime();
    if (this.lastTrigger === null)
        interval = null;
    else
    {
        interval = now - this.lastTrigger;
        if (interval > ACV.ViewportManager.maxInterval)
            interval = null;
    }
    this.lastTrigger = now;

    ratioBefore = this.lastRatio;
    this.lastRatio = Math.min(1, distance / Math.max(0, this.scrollableDistance - this.viewportDimensions.height));

    for (var i in this.listeners)
    {
        this.listeners[i].call(window, this.lastRatio, ratioBefore, interval, this.viewportDimensions);
    }
    this.viewportDimensions.changed = false;

};
ACV.ViewportManager.prototype.listen = function(callback)
{
    this.listeners.push(callback);
};

ACV.ViewportManager.prototype.stopListening = function(callback)
{
    for (var i in this.listeners)
    {
        if (this.listeners[i] === callback)
        {
            this.listeners = this.listeners.splice(i, 1);
            return;
        }
    }
};

