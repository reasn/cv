"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.HUD = ACV.HUD ? ACV.HUD : new Object();

ACV.HUD = function(prefs, skillBasket, year, heightDisplay) {
	this.prefs = prefs;
	this.height = this.prefs.height;
	this.skillBasket = skillBasket;
	this.skillBasket.hud = this;
	this.year = year;
	this.heightDisplay = heightDisplay;
};
ACV.HUD.createFromData = function(data, performanceSettings) {
	var skillBasket, yearDisplay = null, heightDisplay = null;

	skillBasket = ACV.HUD.SkillBasket.createFromData(data.skillBasket, performanceSettings);
	if (performanceSettings.yearDisplay)
		year = ACV.HUD.YearDisplay.createFromData(data.year, performanceSettings);
	if (performanceSettings.heightDisplay)
		heightDisplay = ACV.HUD.HeightDisplay.createFromData(data.height, performanceSettings);
	return new ACV.HUD(data.prefs, skillBasket, yearDisplay, heightDisplay);
};

ACV.HUD.prototype = ACV.Core.createPrototype('ACV.HUD', {
	height : 0,
	prefs : null,
	skillBasket : null,
	yearDisplay : null,
	heightDisplay: null
});

ACV.HUD.prototype.init = function(element, viewportManager) {
	this.element = $(element);
	this.element.css({
		height : this.height
	});
	this.skillBasket.init(this.element);
	if (this.yearDisplay !== null)
		this.yearDisplay.init(this.element);
	if (this.heightDisplay !== null)
		this.heightDisplay.init(this.element);

	this.debug('HUD initialized');
};

ACV.HUD.prototype.updateGameRatio = function(ratio, ratioBefore, viewportDimensions) {
	if (this.yearDisplay !== null)
		this.yearDisplay.update(ratio);
	if (this.heightDisplay !== null)
		this.heightDisplay.update(ratio);
};
