module ACV.HUD {
    /**
     * @since 2013-11-19
     */
    export class HeightDisplay extends ACV.Core.AbstractObject {

        private keyFrames: any[];
        private lastHeight: number;
        private element: JQuery;
        private elementVisible: boolean;

        constructor(keyFrames) {
            super('ACV.HUD.HeightDisplay');
            this.keyFrames = keyFrames;
        }

        static createFromData(data): HeightDisplay {
            return new HeightDisplay(data.keyFrames);
        }

        init(hudElement: JQuery) {
            this.element = $('<div class="height-display" />');
            hudElement.append(this.element);

            this.debug('HeightDisplay initialized');
        }

        update(ratio: number) {
            var frameIndex: number,
                factor: number,
                height: number,
                keys = Object.keys(this.keyFrames);

            // Automatically hide DOM-element when it's no longer needed
            if (ratio > parseFloat(keys[keys.length - 1]) && this.elementVisible) {
                this.element.css('display', 'none');
                this.elementVisible = false;
                this.debug('Year display hidden.');

            } else if (ratio <= parseFloat(keys[keys.length - 1]) && !this.elementVisible) {
                this.element.css('display', 'block');
                this.elementVisible = true;
                this.debug('Year display showed.');
            }


            for (frameIndex = 0; frameIndex < keys.length - 1; frameIndex++) {
                if (parseFloat(keys[frameIndex]) > ratio || ratio > parseFloat(keys[frameIndex + 1])) {
                    continue;
                }

                // a:= keys[i], b:=ratio, c:= keys[i+1] => factor = (b-a) / (c-a)
                factor = (ratio - parseFloat(keys[frameIndex]) ) / (parseFloat(keys[frameIndex + 1]) - parseFloat(keys[frameIndex]));

                // h = (1-factor) * a + factor * b
                height = (1 - factor) * this.keyFrames[keys[frameIndex]] + factor * this.keyFrames[keys[frameIndex + 1]];
                break;

            }
            // Reduces draw calls
            if (height !== this.lastHeight) {
                this.lastHeight = height;
                this.element.text(Math.round(height));
            }
        }
    }
}