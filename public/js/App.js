"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

/**
 *
 * @constructor
 */
ACV.App = function () {
};

ACV.App.prototype = ACV.Core.createPrototype('ACV.App',
    {
        _appContext: null,
        prefs: null,
        viewportManager: null,
        scene: null,
        hud: null,
        _sceneViewportDimenstions: {
            width: 0,
            height: 0,
            changed: false
        }
    });

ACV.App.config =
{
    assetPath: 'assets'
};
/**
 *
 * @param {Object} data
 * @param {jQuery} container
 */
ACV.App.prototype.init = function (data, container) {
    var sceneElement, movementMethod, app;
    app = this;

    this.prefs = data.app;
    var totalDistance = this.prefs.totalDistance;

    if (ACV.Utils.isIE())
        totalDistance *= this.prefs.ieFactor;

    //Initialize viewport manager
    if (ACV.Utils.isMobile()) {
        movementMethod = ACV.ViewportManager.SCROLL_DRAG;
    } else if (navigator.userAgent.indexOf('WebKit') !== -1) {
        /*
         * WebKit renders the page with some flickering when using native scroll events.
         * Did in-depth profiling and debugging. A single draw-call (changing a CSS property)
         * results in layers moving slightly too far and back to the right position (less than 100ms)
         * when said draw-call is made during a scroll event. This mustn't happen because everything
         * plays out inside a layer with fixed position. So I assume a platform bug. A simple remedy
         * is not disable scrolling and directly access the mouse wheel event provided by Chromium.
         */
        movementMethod = ACV.ViewportManager.SCROLL_WHEEL;
    } else {
        movementMethod = ACV.ViewportManager.SCROLL_NATIVE;
    }
    this.viewportManager = new ACV.ViewportManager(container, totalDistance, movementMethod);
    this.viewportManager.init();

    this._appContext = new ACV.AppContext(data.app.prefs, data.app.performanceSettings);

    //Prepare HUD
    this.hud = ACV.HUD.createFromData(this._appContext, data.hud);

    //Prepare scene
    sceneElement = container.children('.scene');
    this.scene = ACV.Game.Scene.createFromData(this._appContext, sceneElement, data.scene);
    this.scene.playerLayer.skillBasket = this.hud.skillBasket;


    this._sceneViewportDimenstions.width = this.viewportManager.viewportDimensions.width;
    this._sceneViewportDimenstions.height = this.viewportManager.viewportDimensions.height - this.hud.height;

    //Initialize HUD and scene
    this.hud.init(container.children('.hud'), this.viewportManager);
    this.scene.init(this._sceneViewportDimenstions);

    //Sink events
    this.viewportManager.listen(function (ratio, ratioBefore, interval, viewportDimensions) {
        app.hud.updateGameRatio(ratio, ratioBefore, viewportDimensions);

        //Note: _sceneViewportDimenstions is referenced by ACV.Game.Scene because it was submitted in this.scene.init().
        app._sceneViewportDimenstions.width = viewportDimensions.width;
        app._sceneViewportDimenstions.height = viewportDimensions.height - app.hud.height;
        app._sceneViewportDimenstions.changed = viewportDimensions.changed;
        app.scene.updatePositions(ratio, ratioBefore);
    });

    //Scroll to beginning
    $(window).scrollTop(0);
    this.viewportManager.fireAllTriggers();

    //debug stuff
    this.viewportManager.listen(function (ratio, lastRatio, interval) {
        $('#scrollpos').text(ratio);
    });

};
