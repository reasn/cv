module ACV.HUD {

    /**
     * @since 2014-12-28
     */
    export class SceneDebugger extends ACV.Core.AbstractObject {

        scene: ACV.Game.Scene;
        selectedLevel: ACV.Game.Level;
        selectedLayer: ACV.Game.Layer;
        selectedSprite: ACV.Game.Sprite;

        private element: JQuery;

        constructor() {
            super('ACV.HUD.SceneDebugger');
        }

        static create(): SceneDebugger {
            return new SceneDebugger();
        }

        init( hudElement: JQuery, scene: ACV.Game.Scene ) {
            this.element = $('<div class="scene-debugger">HALLO</div>');
            this.scene = scene;
            hudElement.append(this.element);

            this.info('Scene debugger initialized', 'd');
        }

        update() {


        }
    }
}
