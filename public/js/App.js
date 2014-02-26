"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : new Object();

ACV.App = function()
{
};

ACV.App.prototype = ACV.Core.createPrototype('ACV.App',
{
    prefs: null,
    viewportManager: null,
    scene: null,
    hud: null
});

ACV.App.config =
{
    assetPath: 'assets',
};

ACV.App.prototype.init = function(data)
{
    var sceneElement;
    var app = this;

    this.prefs = data.app;
    var totalDistance = this.prefs.totalDistance;

    if (ACV.Utils.isIE())
        totalDistance *= this.prefs.ieFactor;

    //Initialize viewport manager
    this.viewportManager = new ACV.ViewportManager('#container', totalDistance, ACV.Utils.isMobile());
    this.viewportManager.init();

    //Initialize HUD
    this.hud = ACV.HUD.createFromData(data.hud, data.app.performanceSettings);
    this.hud.init('#hud', this.viewportManager);

    //Initialize scene
    sceneElement = $('<div id="scene"/>');
    this.scene = ACV.Game.Scene.createFromData(sceneElement, data.scene, data.app.performanceSettings);
    this.scene.playerLayer.skillBasket = this.hud.skillBasket;
    this.scene.init(
    {
        width: this.viewportManager.viewportDimensions.width,
        height: this.viewportManager.viewportDimensions.height - this.hud.height
    });

    $('#container').prepend(sceneElement);

    //Sink events
    this.viewportManager.listen(function(ratio, ratioBefore, interval, viewportDimensions)
    {
        app.hud.updateGameRatio(ratio, ratioBefore, viewportDimensions);

        var sceneDimensions =
        {
            width: viewportDimensions.width,
            height: viewportDimensions.height - app.hud.height,
            changed: viewportDimensions.changed
        };
        app.scene.updatePositions(ratio, ratioBefore, sceneDimensions);
    });

    //Scroll to beginning
    $(window).scrollTop(0);
    this.viewportManager.triggerAll();

    //debug stuff
    this.viewportManager.listen(function(ratio, lastRatio, interval)
    {
        $('#scrollpos').text(ratio);
    });

};
