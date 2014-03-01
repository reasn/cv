"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : {};

ACV.Log = ACV.Log ? ACV.Log : {};

ACV.Log._indent = 0;

ACV.Log.debug = function () {
    ACV.Log._add(Array.slice(arguments), console.debug);
};

ACV.Log.info = function () {
    ACV.Log._add(Array.slice(arguments), console.info);
};

ACV.Log.warn = function () {
    ACV.Log._add(Array.slice(arguments), console.warn);
};

ACV.Log.error = function () {
    ACV.Log._add(Array.slice(arguments), console.error);
};

ACV.Log._add = function (args, logMethod) {

    var message, replacementIndex;
    var className = args.shift(), len = ACV.Core.config.logClassNameSpace;

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
    className += ': ';

    //retrieve actual message from arguments
    message = args.shift();

    //Serialize all types of arguments into a string
    if (typeof message === 'string') {
        for (replacementIndex in args) {
            message = message.replace('%s', args[replacementIndex]);
        }
    }
    else if (typeof message === 'boolean') {
        message = className + ( message ? '[true]' : '[false]');
    }
    else if (typeof message === 'string' || typeof (message) === 'number') {
        message = className + message;
    }
    else if (typeof message === 'undefined') {
        message = className + '[undefined]';
    }
    else if (typeof message === 'object') {
        message = 'Object:\n' + JSON.stringify(message, null, '  ');
    }
    else {
        message = 'Unknown log argument: ' + typeof message;
    }
    logMethod(className + message);
};

ACV.Core._addToConsole = function (what, level) {
    switch (level) {
        case 'e':
            window.console.error(what);
            break;
        case 'w':
            window.console.warn(what);
            break;
        case 'd':
            window.console.debug(what);
            break;
        default:
            window.console.info(what);
    }
};

ACV.Core.config =
{
    logEnabled: true,
    logClassNameSpace: 20
};
