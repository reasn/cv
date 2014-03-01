"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Core = ACV.Core ? ACV.Core : {};

ACV.Core.createPrototype = function (className, properties) {
    if (ACV.Core.config.logEnabled && window.console !== undefined) {


        properties.debug = function () {
            ACV.Log.debug.apply(window, [className].concat(Array.splice(arguments)));
        };
        properties.info = function () {
            ACV.Log.info.apply(window, [className].concat(Array.splice(arguments)));
        };
        properties.warn = function () {
            ACV.Log.warn.apply(window, [className].concat(Array.slice(arguments)));
        };
        properties.error = function () {
            ACV.Log.error([className].concat(Array.splice(arguments)));
        };
    }
    return properties;
};

ACV.Core.config =
{
    logEnabled: true,
    logClassNameSpace: 20
};
