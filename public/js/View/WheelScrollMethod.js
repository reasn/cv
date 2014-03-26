"use strict";

/**
 * @since 2014-03-26
 */
var ACV = ACV ? ACV : {};

ACV.View = ACV.View ? ACV.View : {};

ACV.View.WheelScrollMethod = function (viewportManager, scrollableDistance) {
    this._viewportManager = viewportManager;
    this._scrollableDistance = scrollableDistance;
};

ACV.View.WheelScrollMethod.prototype = ACV.Core.createPrototype('ACV.View.WheelScrollMethod', {
    _viewportManager         : null,
    _scrollableDistance      : 0,
    _containerFixedToViewport: false,
    _containerDistanceFromTop: 0,
    _offset                  : 0
});


ACV.View.WheelScrollMethod.prototype.init = function (containerDistanceFromTop) {

    this._containerDistanceFromTop = containerDistanceFromTop;

    var wheelScrollMethod = this;

    console.log(containerDistanceFromTop);


    $('body').on('mousewheel DOMMouseScroll', function (event) {
        var delta = event.originalEvent.deltaY !== undefined ? event.originalEvent.deltaY : event.originalEvent.detail * 30;
        wheelScrollMethod._offset = Math.min(wheelScrollMethod._scrollableDistance, Math.max(0, wheelScrollMethod._offset + delta));
        wheelScrollMethod._viewportManager.handleScroll(wheelScrollMethod._offset - wheelScrollMethod._containerDistanceFromTop);
    });
};

ACV.View.WheelScrollMethod.prototype.isGameActive = function () {
    return this._containerFixedToViewport;
};

ACV.View.WheelScrollMethod.prototype.handleFixation = function (staticContainer) {

//Automatically start and stop to play when container touches top of the viewport

    var topScrollOffset = $(window).scrollTop();

    //this.debug('%s %s', this._offset, this._containerDistanceFromTop);

    if (!this._containerFixedToViewport && topScrollOffset > this._containerDistanceFromTop) {
        this.debug('Fixing game container to viewport %s %s', topScrollOffset, this._containerDistanceFromTop);
        this._containerFixedToViewport = true;
        staticContainer.addClass('fixed');
        //this._offset = 1;

    } else if (this._containerFixedToViewport && this._offset < this._containerDistanceFromTop) {
        this.debug('Defixing game container from viewport %s %s', topScrollOffset, this._containerDistanceFromTop);
        this._containerFixedToViewport = false;
        staticContainer.removeClass('fixed');
        this._viewportManager._updateDimensions();
        $(window).scrollTop(this._containerDistanceFromTop - 1);
    }
};