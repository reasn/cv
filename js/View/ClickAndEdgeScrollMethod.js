"use strict";

/**
 * @since 2014-03-26
 */
var ACV = ACV ? ACV : {};

ACV.View = ACV.View ? ACV.View : {};

ACV.View.ClickAndEdgeScrollMethod = function (viewportManager, scrollableDistance) {
    this._viewportManager = viewportManager;
    this._scrollableDistance = scrollableDistance;
};


ACV.View.ClickAndEdgeScrollMethod.prototype._clickAnimationSocket = null;

ACV.View.ClickAndEdgeScrollMethod.prototype.init = function (containerDistanceFromTop) {
    var nativeScrollMethod = this;


    var a = 0.3,
        b = 0.5,
        c = 10,
        d = 0.2;
    this._viewportManager.listenToMouseClick(function (clientX, clientY, viewportDimensions) {

        var w = viewportDimensions.width,
            offset = nativeScrollMethod._viewportManager._currentScrollOffset;

        if (clientX < w * a) {
            offset -= a * w - clientX;
        } else if (clientX > w * (1 - b)) {
            offset += clientX - (w * (1 - b));
        } else {
            return;
        }
        nativeScrollMethod._scrollToClickTarget(offset);
    });
    this._viewportManager.listenToMouseMove(function (clientX, clientY, viewportDimensions) {
        var w = viewportDimensions.width,
            offset = nativeScrollMethod._viewportManager._currentScrollOffset;
        if (clientX < c) {
            offset -= d * w;
        } else if (clientX > w - c) {
            offset += d * w;
        } else {
            return;
        }
        nativeScrollMethod._scrollToClickTarget(offset);
    });
};

ACV.View.ClickAndEdgeScrollMethod.prototype.isGameActive = function () {
    return true;
};

ACV.View.ClickAndEdgeScrollMethod.prototype.handleFixation = function (staticContainer) {
};

ACV.View.ClickAndEdgeScrollMethod.prototype._scrollToClickTarget = function (targetOffset) {

    var vpm = this._viewportManager;
    var duration = ACV.Utils.calculateAnimationDuration(vpm._currentScrollOffset, targetOffset, 1);

    if (this._clickAnimationSocket === null) {
        this._clickAnimationSocket = $('span');
    }
    this._clickAnimationSocket.stop().css('width', vpm._currentScrollOffset).animate({
            width: targetOffset
        }, {
            duration: duration,
            easing  : 'easeInOutQuad',
            step    : function (now) {
                vpm.handleScroll(now);
            }
        }
    );
};