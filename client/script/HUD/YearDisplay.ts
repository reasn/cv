module ACV.HUD {

    /**
     * @since 2013-11-19
     */
    export class YearDisplay extends ACV.Core.AbstractObject {

        triggers: {[playerXValue:string]:number};
        year: number;
        private element: JQuery;
        private captionElements: JQuery;
        private progressElement: JQuery;
        private appContext: ACV.AppContext;

        constructor( appContext: ACV.AppContext, triggers: {[key:string]:number} ) {
            super('ACV.HUD.YearDisplay');
            this.triggers = triggers;
            this.year = this.triggers[Object.keys(this.triggers)[0]];
            this.appContext = appContext;
        }

        static createFromData( appContext: ACV.AppContext, data: ACV.Data.IYearDisplayData ): YearDisplay {
            return new YearDisplay(appContext, data.playerXTriggers);
        }

        init( gameContainer: JQuery ) {
            this.element = gameContainer.children('#hud-year-display');
            this.captionElements = this.element.find('.now');
            this.progressElement = this.element.find('.progress');
            if (!this.appContext.player) {
                throw ('appContext.player must be set before initializing YearDisplay');
            }
            this.appContext.player.addMovementListener(( playerX ) => {
                this.updateYear(playerX);
            });

            this.info('Year display initialized', 'd');
        }

        updateRatio( ratio: number ) {
            this.progressElement.css('width', (ratio * 100 ) + '%');
        }

        updateYear( playerX: number ) {
            for (var playerXValue in this.triggers) {
                if (parseFloat(playerXValue) >= playerX && this.year !== this.triggers[playerXValue]) {
                    this.year = this.triggers[playerXValue];
                    this.captionElements.text(this.year);
                    return;
                }
            }
        }
    }
}
