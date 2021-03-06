/// <reference path="../Core/AbstractObject"/>
/// <reference path="./SkillBasket"/>


module ACV.HUD {
    /**
     * @since 2013-11-19
     */
    export class HeadsUpDisplay extends ACV.Core.AbstractObject {

        prefs: ACV.Data.IHudPrefs;
        height: number;
        skillBasket: SkillBasket;
        yearDisplay: YearDisplay;
        heightDisplay: HeightDisplay;
        private sceneDebugger: SceneDebugger;
        private element: JQuery;
        private appContext: ACV.AppContext;
        private timeline: Timeline;

        constructor( appContext: ACV.AppContext,
                     prefs: ACV.Data.IHudPrefs,
                     skillBasket: SkillBasket,
                     yearDisplay: YearDisplay,
                     heightDisplay: HeightDisplay,
                     sceneDebugger: SceneDebugger,
                     timeline: Timeline ) {

            super('ACV.HUD');

            this.appContext = appContext;
            this.prefs = prefs;
            this.height = this.prefs.height;
            this.skillBasket = skillBasket;
            this.skillBasket.hud = this;
            this.yearDisplay = yearDisplay;
            this.heightDisplay = heightDisplay;
            this.sceneDebugger = sceneDebugger;
            this.timeline = timeline;
        }

        static createFromData( appContext: ACV.AppContext, data: ACV.Data.IHudData ): HeadsUpDisplay {
            var skillBasket: SkillBasket,
                yearDisplay: YearDisplay = null,
                heightDisplay: HeightDisplay = null,
                sceneDebugger: SceneDebugger,
                timeline: Timeline;

            skillBasket = ACV.HUD.SkillBasket.createFromData(data.skillBasket, appContext);

            if (appContext.performanceSettings.yearDisplay) {
                yearDisplay = YearDisplay.createFromData(appContext, data.yearDisplay);
            }
            if (appContext.performanceSettings.heightDisplay) {
                heightDisplay = HeightDisplay.createFromData(data.heightDisplay);
            }

            timeline = ACV.HUD.Timeline.createFromData(appContext, data.timeline);

            sceneDebugger = SceneDebugger.create();

            return new HeadsUpDisplay(appContext, data.prefs, skillBasket, yearDisplay, heightDisplay, sceneDebugger, timeline);
        }

        init( gameContainer: JQuery, scene: ACV.Game.Scene ) {

            this.element = gameContainer.children('#hud');

            this.skillBasket.init(this.element);

            if (this.yearDisplay !== null) {
                this.yearDisplay.init(gameContainer);
            }
            if (this.heightDisplay !== null) {
                this.heightDisplay.init(gameContainer);
            }

            this.appContext.viewportManager.listenToScroll(( ratio, ratioBefore, viewportDimensions )=> {
                this.updateGameRatio(ratio, ratioBefore);
            });

            this.sceneDebugger.init(gameContainer, scene);
            this.timeline.init(this.element);

            this.debug('HUD initialized');
        }

        updateGameRatio( ratio: number, ratioBefore: number ) {
            if (this.yearDisplay !== null) {
                this.yearDisplay.updateRatio(ratio);
            }
            if (this.heightDisplay !== null) {
                this.heightDisplay.update(ratio);
            }
        }
    }
}
