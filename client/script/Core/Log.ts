module ACV.Core {
    /**
     * @since 2014-03-01
     */
    export class Log {
        static enabled = true;
        static NAMESPACE_WIDTH = 25;
        private static indent = 0;

        /**
         * We could directly use the log method (e.g. console.error) as second argument which would be more elegant. But Chrome doesn't allow it -.-
         */
        static add(className: string, args: any[], logLevel: string) {

            var message: string,
                replacementIndex: any,
                len = Log.NAMESPACE_WIDTH;

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

            } else if (typeof message === 'boolean') {
                message = message ? '[true]' : '[false]';

            } else if (typeof message === 'undefined') {
                message = '[undefined]';

            } else if (typeof message === 'object') {
                message = 'Object:\n' + JSON.stringify(message, undefined, '  ');

            } else if (typeof message !== 'string' && typeof message !== 'number') {
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
        }
    }
}
