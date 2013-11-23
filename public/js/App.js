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
    var app = this;

    this.prefs = data.app;
    var totalDistance = this.prefs.totalDistance;

    if (ACV.Utils.isIE())
        totalDistance *= this.prefs.ieFactor;

    //Initialize viewport manager
    this.viewportManager = new ACV.ViewportManager('#container', totalDistance, ACV.Utils.isMobile());
    this.viewportManager.init();

    //Initialize HUD
    this.hud = ACV.HUD.createFromData(data.hud);
    this.hud.init('#hud', this.viewportManager);

    //Initialize scene
    this.scene = ACV.Game.Scene.createFromData('#scene', data.scene);
    this.scene.init(
    {
        width: this.viewportManager.viewportDimensions.width,
        height: this.viewportManager.viewportDimensions.height - this.hud.height
    });

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

    //Sink callbacks
    this.scene.foreground.setSkillImprovementCallback(function(skillType)
    {
        app.hud.skillBasket.improve(skillType);
    });

    //Scroll to beginning
    $(window).scrollTop(0);
    this.viewportManager.trigger();

    //debug stuff
    this.viewportManager.listen(function(ratio, lastRatio, interval)
    {
        $('#scrollpos').text(ratio);
    });

};
