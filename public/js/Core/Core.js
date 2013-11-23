"use strict";

/**
 * @since 2013-11-03
 */
var ACV = ACV ? ACV : new Object();

ACV.Core = ACV.Core ? ACV.Core : new Object();

ACV.Core.createPrototype = function(className, properties)
{
    if (ACV.Core.config.logEnabled && window.console !== undefined)
    {
        properties.log = function(what, level)
        {
            ACV.Core.log(className, what, level);
        };
    }
    return properties;
};
ACV.Core.log = function(className, what, level)
{
    var len = ACV.Core.config.logClassNameSpace;
    if (className.length > len)
    {
        className = className.substr(-len);
    }

    while (className.length < len)
    {
        className = ' ' + className;
    }
    className += ': ';

    if ( typeof (what) === 'boolen')
        what = className + ( what ? '[true]' : '[false]');
    else if ( typeof (what) === 'string' || typeof (what) === 'number')
        what = className + what;
    else if ( typeof (what) === 'undefined')
        what = className + '[undefined]';
    else
        ACV.Core._addToConsole(className, level);

    ACV.Core._addToConsole(what, level);
};

ACV.Core._addToConsole = function(what, level)
{
    switch(level)
    {
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
