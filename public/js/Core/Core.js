"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Core = ACV.Core ? ACV.Core : {};

ACV.Core.createPrototype = function (className, properties) {

    //TODO find out whether it is possible to not have to add four instance-specific functions per object
    if (ACV.Core.Log.enabled && window.console !== undefined) {

        properties.debug = function () {
            ACV.Core.Log.debug.apply(window, [className].concat(Array.prototype.slice.call(arguments)));
        };
        properties.info = function () {
            ACV.Core.Log.info.apply(window, [className].concat(Array.prototype.slice.call(arguments)));
        };
        properties.warn = function () {
            ACV.Core.Log.warn.apply(window, [className].concat(Array.prototype.slice.call(arguments)));
        };
        properties.error = function () {
            ACV.Core.Log.error.apply(window, [className].concat(Array.prototype.slice.call(arguments)));
        };
    }
    return properties;
};