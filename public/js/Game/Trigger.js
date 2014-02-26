"use strict";

/**
 * @since 2013-11-24
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

ACV.Game.Trigger = function(comparison, value, type, data)
{
    this.comparison = comparison;
    this.value = value;
    this.type = type;
    this.data = data;
};
ACV.Game.Trigger.prototype = ACV.Core.createPrototype('ACV.Game.Trigger',
{
    comparison: '',
    value: 0,
    type: null,
    data: null
});

ACV.Game.Trigger.createFromData = function(data, performanceSettings)
{
    return new ACV.Game.Trigger(data.playerX.substr(0, 1), data.playerX.substr(1), data.type, data.data);
};
