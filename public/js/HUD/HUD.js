"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.HUD = ACV.HUD ? ACV.HUD : new Object();

ACV.HUD = function(prefs, skillBasket, year)
{
    this.prefs = prefs;
    this.height = this.prefs.height;
    this.skillBasket = skillBasket;
    this.skillBasket.hud = this;
    this.year = year;
};
ACV.HUD.createFromData = function(data)
{
    var skillBasket, year;
    skillBasket = ACV.HUD.SkillBasket.createFromData(data.skillBasket);
    year = ACV.HUD.Year.createFromData(data.year);
    return new ACV.HUD(data.prefs, skillBasket, year);
};

ACV.HUD.prototype = ACV.Core.createPrototype('ACV.HUD',
{
    height: 0,
    prefs: null,
    skillBasket: null,
    year: null
});

ACV.HUD.prototype.init = function(element, viewportManager)
{
    this.element = $(element);
    this.element.css(
    {
        height: this.height
    });
    this.skillBasket.init(this.element);
    this.year.init(this.element);

    this.log('HUD initialized', 'd');
};

ACV.HUD.prototype.updateGameRatio = function(ratio, ratioBefore, viewportDimensions)
{
    this.year.update(ratio);
};
