module ACV.Core {

    /**
     * @since 2013-11-03
     */
    export class AbstractObject {

        private className: string;

        constructor(className: string) {
            this.className = className;
        }

        debug(...args: any[]) {
            Log.add([this.className].concat(args), 'd');
        }

        info(...args: any[]) {
            Log.add([this.className].concat(args), 'i');
        }

        warn(...args: any[]) {
            Log.add([this.className].concat(args), 'w');
        }

        error(...args: any[]) {
            Log.add([this.className].concat(args), 'e');
        }
    }
}