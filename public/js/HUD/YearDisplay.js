"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};

/**
 * @type {{
 *   triggers: Array.<Object>
 *   year: number
 * }}
 * @param {Array.<Object>} triggers
 * @constructor
 */
ACV.HUD.YearDisplay = function (triggers) {
    this.triggers = triggers;
    this.year = this.triggers[Object.keys(this.triggers)[0]];
};

/**
 *
 * @param {Object} data
 * @returns {ACV.HUD.YearDisplay}
 */
ACV.HUD.YearDisplay.createFromData = function (data) {
    return new ACV.HUD.YearDisplay(data.triggers);
};

ACV.HUD.YearDisplay.prototype = ACV.Core.createPrototype('ACV.HUD.YearDisplay',
    {
        triggers: [],
        year: 0
    });

/**
 *
 * @param {jQuery} hudElement
 * @returns void
 */
ACV.HUD.YearDisplay.prototype.init = function (hudElement) {
    this.element = $('<div id="year">' + this.year + '</div>');
    hudElement.append(this.element);

    this.info('Year display initialized', 'd');
};

/**
 *
 * @param {number} ratio
 * @returns void
 */
ACV.HUD.YearDisplay.prototype.update = function (ratio) {

    for (var triggerRatio in this.triggers) {
        if (parseFloat(triggerRatio) >= ratio) {
            this.setYear(this.triggers[triggerRatio]);
            return;
        }
    }
};

/**
 *
 * @param {number} year
 * @returns void
 */
ACV.HUD.YearDisplay.prototype.setYear = function (year) {
    if (this.year !== year) {
        this.year = year;
        this.element.text(this.year);
    }
};
