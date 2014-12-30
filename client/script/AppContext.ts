module ACV {

    export class AppContext {
        viewportManager: ACV.View.ViewportManager;
        prefs: ACV.Data.IAppPrefs;
        performanceSettings: ACV.Data.IPerformanceSettings;

        player: ACV.Game.Player = null;
        playerSpeechBubble: ACV.Game.SpeechBubble = null;

        constructor( viewportManager: ACV.View.ViewportManager,
                     prefs: ACV.Data.IAppPrefs,
                     performanceSettings: ACV.Data.IPerformanceSettings ) {
            this.viewportManager = viewportManager;
            this.prefs = prefs;
            this.performanceSettings = performanceSettings;
        }
    }
}