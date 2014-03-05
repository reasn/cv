"use strict";

/**
 * @since 2014-03-01
 */
var ACV = ACV ? ACV : {};

ACV.Log = ACV.Log ? ACV.Log : {};

ACV.Log.enabled = true;
ACV.Log.NAMESPACE_WIDTH = 25;
ACV.Log._indent = 0;

ACV.Log.debug = function () {
    ACV.Log._add(Array.prototype.slice.call(arguments), 'd');
};

ACV.Log.info = function () {
    ACV.Log._add(Array.prototype.slice.call(arguments), 'i');
};

ACV.Log.warn = function () {
    ACV.Log._add(Array.prototype.slice.call(arguments), 'w');
};

ACV.Log.error = function () {
    ACV.Log._add(Array.prototype.slice.call(arguments), 'e');
};

/**
 * We could directly use the log method (e.g. console.error) as second argument which would be more elegant. But Chrome doesn't allow it -.-
 * @param args
 * @param logLevel
 * @private
 */
ACV.Log._add = function (args, logLevel) {

    var message, replacementIndex;
    var len = ACV.Log.NAMESPACE_WIDTH;
    var className = args.shift();

    if (className.indexOf('ACV.') === -1) {
        //No class name present, supposed class name is message
        args.unshift(className);
        className = 'unknown';
    }

    //Beautify namespace and class name
    if (className.length > len) {
        className = className.substr(-len);
    }
    while (className.length < len) {
        className = ' ' + className;
    }

    //retrieve actual message from arguments
    message = args.shift();

    //Serialize all types of arguments into a string
    if (typeof message === 'string') {
        for (replacementIndex in args) {
            if (typeof args[replacementIndex] === 'object') {
                args[replacementIndex] = JSON.stringify(args[replacementIndex], null, '  ');
            }
            message = message.replace('%s', args[replacementIndex]);
        }
    }
    else if (typeof message === 'boolean') {
        message = message ? '[true]' : '[false]';
    }
    else if (typeof message === 'string' || typeof (message) === 'number') {
        message = message;
    }
    else if (typeof message === 'undefined') {
        message = '[undefined]';
    }
    else if (typeof message === 'object') {
        message = 'Object:\n' + JSON.stringify(message, null, '  ');
    }
    else {
        message = 'Unknown log argument: ' + typeof message;
    }

    //Add the message to the console
    switch (logLevel) {
        case 'e':
            window.console.error(className + ': ' + message);
            return;
        case 'w':
            window.console.warn(className + ': ' + message);
            return;
        case 'd':
            //TODO only add '  ' when using firefox (or even only firebug?)
            window.console.debug('  ' + className + ': ' + message);
            return;
        default:
            window.console.info(className + ': ' + message);
    }
};
