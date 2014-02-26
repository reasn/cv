"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.HUD = ACV.HUD ? ACV.HUD : new Object();

ACV.HUD.YearDisplay = function(triggers)
{
    this.triggers = triggers;
    this.year = this.triggers[Object.keys(this.triggers)[0]];
};

ACV.HUD.YearDisplay.createFromData = function(data)
{
    return new ACV.HUD.YearDisplay(data.triggers);
};

ACV.HUD.YearDisplay.prototype = ACV.Core.createPrototype('ACV.HUD.YearDisplay',
{
    triggers: [],
    year: 0
});

ACV.HUD.YearDisplay.prototype.init = function(hudElement)
{
    this.element = $('<div id="year">' + this.year + '</div>');
    hudElement.append(this.element);

    this.log('YearDisplay initialized', 'd');
};

ACV.HUD.YearDisplay.prototype.update = function(ratio)
{
    for (var triggerRatio in this.triggers)
    {
        if (triggerRatio > ratio)
        {
            this.setYearDisplay(this.triggers[triggerRatio]);
            return;
        }
    }
};

ACV.HUD.YearDisplay.prototype.setYearDisplay = function(year)
{
    this.element.text(this.year);
    this.year = year;
    return;
};
