"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

/**
 * @type {function} AppContext {{
 *   prefs: Object
 *   performanceSettings: Object
 *   player: ACV.Game.Player
 * }}
 * @constructor
 */
ACV.AppContext = function (prefs, performanceSettings) {
    this.prefs = prefs;
    this.performanceSettings = performanceSettings;
};

ACV.AppContext.prototype = ACV.Core.createPrototype('ACV.AppContext',
    {
        prefs: null,
        performanceSettings: null,
        player: null
    });
