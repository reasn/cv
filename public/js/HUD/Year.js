"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.HUD = ACV.HUD ? ACV.HUD : new Object();

ACV.HUD.Year = function(triggers)
{
    this.triggers = triggers;
    this.year = this.triggers[Object.keys(this.triggers)[0]];
};

ACV.HUD.Year.createFromData = function(data)
{
    return new ACV.HUD.Year(data.triggers);
};

ACV.HUD.Year.prototype = ACV.Core.createPrototype('ACV.HUD.Year',
{
    triggers: [],
    year: 0
});

ACV.HUD.Year.prototype.init = function(hudElement)
{
    this.element = $('<div id="year">' + this.year + '</year>');
    hudElement.append(this.element);

    this.log('Year initialized', 'd');
};

ACV.HUD.Year.prototype.update = function(ratio)
{
    for (var triggerRatio in this.triggers)
    {
        if (triggerRatio > ratio)
        {
            this.setYear(this.triggers[triggerRatio]);
            return;
        }
    }
};

ACV.HUD.Year.prototype.setYear = function(year)
{
    this.element.text(this.year);
    this.year = year;
    return;
};
