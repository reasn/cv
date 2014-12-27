module ACV {

    export interface IPerformanceSettings {
        lookAroundDistortion: boolean;
        yearDisplay: boolean;
        heightDisplay: boolean;
    }

    export class AppContext {
        viewportManager: ACV.View.ViewportManager;
        prefs: any;
        performanceSettings: IPerformanceSettings;
        player: ACV.Game.Player = null;

        constructor(viewportManager: ACV.View.ViewportManager, prefs: any, performanceSettings: IPerformanceSettings) {
            this.viewportManager = viewportManager;
            this.prefs = prefs;
            this.performanceSettings = performanceSettings;
        }
    }
}