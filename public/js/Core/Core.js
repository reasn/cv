"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Core = ACV.Core ? ACV.Core : {};

ACV.Core.createPrototype = function (className, properties) {

    //TODO find out whether it is possible to not have to add four instance-specific functions per object
    if (ACV.Log.enabled && window.console !== undefined) {

        properties.debug = function () {
            ACV.Log.debug.apply(window, [className].concat(Array.prototype.slice.call(arguments)));
        };
        properties.info = function () {
            ACV.Log.info.apply(window, [className].concat(Array.prototype.slice.call(arguments)));
        };
        properties.warn = function () {
            ACV.Log.warn.apply(window, [className].concat(Array.prototype.slice.call(arguments)));
        };
        properties.error = function () {
            ACV.Log.error.apply(window, [className].concat(Array.prototype.slice.call(arguments)));
        };
    }
    return properties;
};