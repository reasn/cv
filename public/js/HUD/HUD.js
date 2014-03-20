"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};
/**
 * @type {{
 *   _appContext: ACV.AppContext
 *   prefs: Object
 *   height: number
 *   skillBasket: ACV.HUD.SkillBasket
 *   yearDisplay: ACV.HUD.YearDisplay
 *   heightDisplay: ACV.HUD.HeightDisplay
 *   _heightDisplay: ACV.HUD.Timeline
 * }}
 * @param {ACV.AppContext} appContext
 * @param {Object} prefs
 * @param {ACV.HUD.SkillBasket} skillBasket
 * @param {ACV.HUD.YearDisplay} yearDisplay
 * @param {ACV.HUD.HeightDisplay} heightDisplay
 * @param {ACV.HUD.Timeline} timeline
 * @constructor
 */
ACV.HUD = function (appContext, prefs, skillBasket, yearDisplay, heightDisplay, timeline) {
    this._appContext = appContext;
    this.prefs = prefs;
    this.height = this.prefs.height;
    this.skillBasket = skillBasket;
    this.skillBasket.hud = this;
    this.yearDisplay = yearDisplay;
    this.heightDisplay = heightDisplay;
    this._timeline = timeline;
};

/**
 *
 * @param {ACV.AppContext} appContext
 * @param {Object} data
 * @returns {ACV.HUD}
 */
ACV.HUD.createFromData = function (appContext, data) {
    var skillBasket, yearDisplay = null, heightDisplay = null, timeline = null;

    skillBasket = ACV.HUD.SkillBasket.createFromData(data.skillBasket, appContext.performanceSettings);
    if (appContext.performanceSettings.yearDisplay) {
        yearDisplay = ACV.HUD.YearDisplay.createFromData(data.yearDisplay, appContext.performanceSettings);
    }
    if (appContext.performanceSettings.heightDisplay) {
        heightDisplay = ACV.HUD.HeightDisplay.createFromData(data.heightDisplay, appContext.performanceSettings);
    }

    timeline = ACV.HUD.Timeline.createFromData(appContext, data.timeline);

    return new ACV.HUD(appContext, data.prefs, skillBasket, yearDisplay, heightDisplay, timeline);
};

ACV.HUD.prototype = ACV.Core.createPrototype('ACV.HUD', {
    _appContext: null,
    height: 0,
    prefs: null,
    skillBasket: null,
    yearDisplay: null,
    heightDisplay: null,
    _timeline: null
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

    this._timeline.init(this.element);

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
