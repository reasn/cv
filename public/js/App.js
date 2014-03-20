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

ACV.App.prototype.init = function (data) {
    var sceneElement;
    var app = this;

    this.prefs = data.app;
    var totalDistance = this.prefs.totalDistance;

    if (ACV.Utils.isIE())
        totalDistance *= this.prefs.ieFactor;

    //Initialize viewport manager
    this.viewportManager = new ACV.ViewportManager('#container', totalDistance, ACV.Utils.isMobile());
    this.viewportManager.init();

    this._appContext = new ACV.AppContext(data.app.prefs, data.app.performanceSettings);

    //Prepare HUD
    this.hud = ACV.HUD.createFromData(this._appContext, data.hud);

    //Prepare scene
    sceneElement = $('<div id="scene"/>');
    this.scene = ACV.Game.Scene.createFromData(this._appContext, sceneElement, data.scene);
    this.scene.playerLayer.skillBasket = this.hud.skillBasket;


    this._sceneViewportDimenstions.width = this.viewportManager.viewportDimensions.width;
    this._sceneViewportDimenstions.height = this.viewportManager.viewportDimensions.height - this.hud.height;

    //Initialize HUD and scene
    this.hud.init('#hud', this.viewportManager);
    this.scene.init(this._sceneViewportDimenstions);

    $('#container').prepend(sceneElement);

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
    this.viewportManager.triggerAll();

    //debug stuff
    this.viewportManager.listen(function (ratio, lastRatio, interval) {
        $('#scrollpos').text(ratio);
    });

};
