"use strict";

/**
 * @since 2014-05-03
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

/**
 * @type {{
 *   level: ACV.Game.Level
 *   scene: ACV.Game.scene
 *   dependency: string Can be levelX or playerX
 *   enabledRange: string|Array.<number>
 *   levelX: number
 *   levelXBefore: number
 *   viewportDimensions: ViewportDimensions
 *   granularity: number,
 *   action: function(this:ACV.Game.Animation)
 * }}
 * @param {Object} data
 * @constructor
 */
ACV.Game.Animation = function (data) {
    var keys = Object.keys(data), keyIndex;
    for (keyIndex in keys) {
        this[keys[keyIndex]] = data[keys[keyIndex]];
    }
};

ACV.Game.Animation.prototype = ACV.Core.createPrototype('ACV.Game.Animation',
    {
        name: '',
        dependency: '',
        enabledRange: 'auto',
        granularity: 0,
        action: null,
        level: null,
        scene: null,
        levelX: 0,
        levelXBefore: 0,
        viewportDimensions: null
    });


ACV.Game.Animation.createFromPrefs = function (data) {
    return new ACV.Game.Animation(data);
};

/**
 *
 * @param {ACV.Game.Scene} scene
 * @param {ACV.Game.Level} level
 */
ACV.Game.Animation.prototype.init = function (scene, level) {
    this.scene = scene;
    this.level = level;

    if (this.enabledRange === 'auto') {
        this.enabledRange = [0, this.level.prefs.clip.x2];
    } else if (this.enabledRange[1] === 'auto') {
        this.enabledRange[1] = this.level.prefs.clip.x2;
    }
};
