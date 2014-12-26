module ACV {
    export class AppContext {
        viewportManager: ACV.View.ViewportManager = null;
        prefs: any = null;
        performanceSettings: any = null;
        player: ACV.Game.Player = null;

        constructor(viewportManager: ACV.View.ViewportManager, prefs: any, performanceSettings: any) {
            this.viewportManager = viewportManager;
            this.prefs = prefs;
            this.performanceSettings = performanceSettings;
        }
    }
}