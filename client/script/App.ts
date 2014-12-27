/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="typings.d.ts"/>

/// <reference path="./Game/Scene"/>
/// <reference path="./HUD/HeadsUpDisplay"/>

module ACV {
    /**
     * @since 2013-11-03
     */
    export class App {

        static config =
        {
            assetPath: 'assets'
        };

        private appContext: AppContext = null;
        prefs: ACV.Data.IAppPrefs = null;
        scene: ACV.Game.Scene = null;
        hud: ACV.HUD.HeadsUpDisplay = null;

        init(data: ACV.Data.IAppData, container: JQuery) {
            var sceneElement: JQuery,
                movementMethod: number,
                viewportManager: ACV.View.ViewportManager;

            this.prefs = data.prefs;
            var totalDistance = this.prefs.totalDistance;

            if (ACV.Utils.isIE()) {
                totalDistance *= this.prefs.ieFactor;
            }

            //Initialize viewport manager
            if (ACV.Utils.isMobile()) {
                movementMethod = ACV.View.ViewportManager.SCROLL_CLICK_AND_EDGE;
                this.prefs.performanceSettings.lookAroundDistortion = false;
            } else if (navigator.userAgent.indexOf('WebKit') !== -1) {
                /*
                 * WebKit renders the page with some flickering when using native scroll events.
                 * Did in-depth profiling and debugging. A single draw-call (changing a CSS property)
                 * results in layers moving slightly too far and back to the right position (less than 100ms)
                 * when said draw-call is made during a scroll event. This mustn't happen because everything
                 * plays out inside a layer with fixed position. So I assume a platform bug. A simple remedy
                 * is not disable scrolling and directly access the mouse wheel event provided by Chromium.
                 */
                movementMethod = ACV.View.ViewportManager.SCROLL_WHEEL;
            } else {
                movementMethod = ACV.View.ViewportManager.SCROLL_NATIVE;
            }
            viewportManager = new ACV.View.ViewportManager(container, totalDistance, movementMethod);
            viewportManager.init();

            this.appContext = new ACV.AppContext(viewportManager, data.prefs, data.prefs.performanceSettings);

            //Prepare HUD
            this.hud = ACV.HUD.HeadsUpDisplay.createFromData(this.appContext, data.hud);

            //Prepare scene
            this.scene = ACV.Game.Scene.createFromData(this.appContext, container.children('.scene'), data.scene);

            //Initialize HUD and scene
            this.hud.init(container.children('.hud'));
            this.scene.init(this.hud);

            viewportManager.start();

            //debug stuff
            this.appContext.viewportManager.listenToScroll(function (ratio) {
                $('#scrollpos').text(Math.round(ratio * 1000) / 1000);
            });
        }
    }
}