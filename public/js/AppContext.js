"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

/**
 * @type {function} AppContext {{
 *   viewportManager: ACV.View.ViewportManager
 *   prefs: Object
 *   performanceSettings: Object
 *   player: ACV.Game.Player
 * }}
 * @constructor
 */
ACV.AppContext = function (viewportManager, prefs, performanceSettings) {
    this.viewportManager = viewportManager;
    this.prefs = prefs;
    this.performanceSettings = performanceSettings;
};

ACV.AppContext.prototype = ACV.Core.createPrototype('ACV.AppContext', {
    viewportManager: null,
    prefs: null,
    performanceSettings: null,
    player: null
});
