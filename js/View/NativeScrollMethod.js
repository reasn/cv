"use strict";

/**
 * @since 2014-03-26
 */
var ACV = ACV ? ACV : {};

ACV.View = ACV.View ? ACV.View : {};

ACV.View.NativeScrollMethod = function (viewportManager, scrollableDistance) {
    this._viewportManager = viewportManager;
    this._scrollableDistance = scrollableDistance;
};

ACV.View.NativeScrollMethod.prototype = ACV.Core.createPrototype('ACV.View.NativeScrollMethod', {
    _viewportManager         : null,
    _scrollableDistance      : 0,
    _containerFixedToViewport: false,
    _containerDistanceFromTop: 0
});

ACV.View.NativeScrollMethod.prototype.init = function (containerDistanceFromTop) {
    this._containerDistanceFromTop = containerDistanceFromTop;

    var nativeScrollMethod = this;
    $('body').css('height', this._scrollableDistance + 'px');
    $(document).on('scroll', function () {
        nativeScrollMethod._viewportManager.handleScroll($(document).scrollTop() - containerDistanceFromTop);
    });
};

ACV.View.NativeScrollMethod.prototype.isGameActive = function () {
    return this._containerFixedToViewport;
};

ACV.View.NativeScrollMethod.prototype.handleFixation = function (staticContainer) {

//Automatically start and stop to play when container touches top of the viewport

    var topScrollOffset = $(window).scrollTop();

    if (!this._containerFixedToViewport && topScrollOffset > this._containerDistanceFromTop) {
        this.debug('Fixing game container to viewport %s %s', topScrollOffset, this._containerDistanceFromTop);
        this._containerFixedToViewport = true;
        staticContainer.addClass('fixed');

    } else if (this._containerFixedToViewport && topScrollOffset < this._containerDistanceFromTop) {
        this.debug('Defixing game container from viewport %s %s', topScrollOffset, this._containerDistanceFromTop);
        this._containerFixedToViewport = false;
        staticContainer.removeClass('fixed');
        this._viewportManager._updateDimensions();
    }
};