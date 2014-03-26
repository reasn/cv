"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

/**
 *
 * @type {Object} {{
 *   hud: ACV.HUD
 * }}
 * @constructor
 */
ACV.App = function () {
};

ACV.App.prototype = ACV.Core.createPrototype('ACV.App',
    {
        _appContext: null,
        prefs: null,
        scene: null,
        hud: null
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
    var sceneElement, movementMethod, app, viewportManager;
    app = this;

    this.prefs = data.app;
    var totalDistance = this.prefs.totalDistance;

    if (ACV.Utils.isIE()) {
        totalDistance *= this.prefs.ieFactor;
    }

    //Initialize viewport manager
    if (ACV.Utils.isMobile()) {
        movementMethod = ACV.ViewportManager.SCROLL_CLICK_AND_EDGE;
        data.app.performanceSettings.lookAroundDistortion = false;
    } else if (true ||navigator.userAgent.indexOf('WebKit') !== -1) {
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
    viewportManager = new ACV.ViewportManager(container, totalDistance, movementMethod);
    viewportManager.init();

    this._appContext = new ACV.AppContext(viewportManager, data.app.prefs, data.app.performanceSettings);

    //Prepare HUD
    this.hud = ACV.HUD.createFromData(this._appContext, data.hud);

    //Prepare scene
    this.scene = ACV.Game.Scene.createFromData(this._appContext, container.children('.scene'), data.scene);

    //Initialize HUD and scene
    this.hud.init(container.children('.hud'));
    this.scene.init(this.hud);

    viewportManager.start();

    //debug stuff
    this._appContext.viewportManager.listenToScroll(function (ratio) {
        $('#scrollpos').text(Math.round(ratio * 1000) / 1000);
    });
};
