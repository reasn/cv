module ACV.HUD {

    /**
     * @since 2014-12-28
     */
    export class SceneDebugger extends ACV.Core.AbstractObject {

        scene: ACV.Game.Scene;
        selectedLevel: ACV.Game.Level;
        selectedLayer: ACV.Game.Layer;
        selectedSprite: ACV.Game.Sprite;
        foregroundVisible = true;
        backgroundVisible = true;
        playerLayerVisible = true;

        private element: JQuery;

        constructor() {
            super('ACV.HUD.SceneDebugger');
        }

        static create(): SceneDebugger {
            return new SceneDebugger();
        }

        init( gameContainer: JQuery, scene: ACV.Game.Scene ) {
            this.element = gameContainer.children('#hud-scene-debugger');
            this.scene = scene;

            this.element.find('.fg-on').on('click', () => { $('.level-wrapper.foreground').css('display', 'block'); });
            this.element.find('.fg-off').on('click', () => { $('.level-wrapper.foreground').css('display', 'none'); });

            this.element.find('.pl-on').on('click', () => { $('.player-layer').css('display', 'block'); });
            this.element.find('.pl-off').on('click', () => { $('.player-layer').css('display', 'none'); });

            this.element.find('.bg-on').on('click', () => { $('.level-wrapper.background').css('display', 'block'); });
            this.element.find('.bg-off').on('click', () => { $('.level-wrapper.background').css('display', 'none'); });

            this.info('Scene debugger initialized', 'd');
        }

        update() {


        }
    }
}
