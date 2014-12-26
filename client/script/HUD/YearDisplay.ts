module ACV.HUD {

    /**
     * @since 2013-11-19
     */
    export class YearDisplay extends ACV.Core.AbstractObject {

        triggers: any[];
        year: number;
        private element: JQuery;

        constructor(triggers: any[]) {
            super('ACV.HUD.YearDisplay');
            this.triggers = triggers;
            this.year = this.triggers[Object.keys(this.triggers)[0]];
        }

        static createFromData(data): YearDisplay {
            return new YearDisplay(data.triggers);
        }

        init(hudElement: JQuery) {
            this.element = $('<div class="year-display">' + this.year + '</div>');
            hudElement.append(this.element);

            this.info('Year display initialized', 'd');
        }

        update(ratio: number) {

            for (var triggerRatio in this.triggers) {
                if (parseFloat(triggerRatio) >= ratio) {
                    this.setYear(this.triggers[triggerRatio]);
                    return;
                }
            }
        }

        setYear(year: number) {
            if (this.year !== year) {
                this.year = year;
                this.element.text(this.year);
            }
        }
    }
}
