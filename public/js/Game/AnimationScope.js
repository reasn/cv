"use strict";

/**
 * @since 2014-05-03
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

ACV.Game.AnimationScope = function (level) {
    this.level = level;
};

ACV.Game.AnimationScope.prototype = ACV.Core.createPrototype('ACV.Game.AnimationScope',
    {
        level: null,
        levelX: 0,
        levelXBefore: 0,
        viewportDimensions: null,
        firstInvocation: false
    });
