"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};
/**
 * @type {{
 *   prefs: Object
 *   height: number
 *   skillBasket: ACV.HUD.SkillBasket
 *   yearDisplay: ACV.HUD.YearDisplay
 *   heightDisplay: ACV.HUD.HeightDisplay
 * }}
 * @param {Object} prefs
 * @param {ACV.HUD.SkillBasket} skillBasket
 * @param {ACV.HUD.YearDisplay} yearDisplay
 * @param {ACV.HUD.HeightDisplay} heightDisplay
 * @constructor
 */
ACV.HUD = function (prefs, skillBasket, yearDisplay, heightDisplay) {
    this.prefs = prefs;
    this.height = this.prefs.height;
    this.skillBasket = skillBasket;
    this.skillBasket.hud = this;
    this.yearDisplay = yearDisplay;
    this.heightDisplay = heightDisplay;
};
ACV.HUD.createFromData = function (data, performanceSettings) {
    var skillBasket, yearDisplay = null, heightDisplay = null;

    skillBasket = ACV.HUD.SkillBasket.createFromData(data.skillBasket, performanceSettings);
    if (performanceSettings.yearDisplay) {
        yearDisplay = ACV.HUD.YearDisplay.createFromData(data.yearDisplay, performanceSettings);
    }
    if (performanceSettings.heightDisplay) {
        heightDisplay = ACV.HUD.HeightDisplay.createFromData(data.heightDisplay, performanceSettings);
    }
    return new ACV.HUD(data.prefs, skillBasket, yearDisplay, heightDisplay);
};

ACV.HUD.prototype = ACV.Core.createPrototype('ACV.HUD', {
    height: 0,
    prefs: null,
    skillBasket: null,
    yearDisplay: null,
    heightDisplay: null
});

ACV.HUD.prototype.init = function (element, viewportManager) {
    this.element = $(element);
    this.element.css({
        height: this.height
    });
    this.skillBasket.init(this.element);
    if (this.yearDisplay !== null) {
        this.yearDisplay.init(this.element);
    }
    if (this.heightDisplay !== null) {
        this.heightDisplay.init(this.element);
    }

    this.debug('HUD initialized');
};

ACV.HUD.prototype.updateGameRatio = function (ratio, ratioBefore, viewportDimensions) {
    if (this.yearDisplay !== null) {
        this.yearDisplay.update(ratio);
    }
    if (this.heightDisplay !== null) {
        this.heightDisplay.update(ratio);
    }
};
