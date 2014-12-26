module ACV.Core {

    /**
     * @since 2013-11-03
     */
    export class AbstractObject {

        private className:string;

        constructor(className) {
            this.className = className;
        }

        debug() {
            ACV.Core.Log.debug.apply(window, [this.className].concat(Array.prototype.slice.call(arguments)));
        }

        info() {
            ACV.Core.Log.info.apply(window, [this.className].concat(Array.prototype.slice.call(arguments)));
        }

        warn() {
            ACV.Core.Log.warn.apply(window, [this.className].concat(Array.prototype.slice.call(arguments)));
        }

        error() {
            ACV.Core.Log.error.apply(window, [this.className].concat(Array.prototype.slice.call(arguments)));
        }
    }
}