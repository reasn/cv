module ACV.Game {

    /**
     * @since 2014-05-03
     */
    export class Animation extends ACV.Core.AbstractObject {

        private name = '';
        private dependency: string = '';//string Can be levelX or playerX
        private enabledRange: any = 'auto';
        private granularity: number = 0;
        private action: ()=>void = null;//this: ACV.Game.Animation
        private level: ACV.Game.Level = null;
        private scene: ACV.Game.Scene = null;
        private levelX: number = 0;
        private levelXBefore: number = 0;
        private viewportDimensions: ACV.View.ViewportDimensions = null;


        constructor(data: any) {

            super('ACV.Game.Animation');

            var keys = Object.keys(data),
                keyIndex;

            for (keyIndex in keys) {
                this[keys[keyIndex]] = data[keys[keyIndex]];
            }
        }

        static createFromPrefs(data): Animation {
            return new ACV.Game.Animation(data);
        }

        init(scene: Scene, level: Level) {
            this.scene = scene;
            this.level = level;

            if (this.enabledRange === 'auto') {
                this.enabledRange = [0, this.level.prefs.clip.x2];
            } else if (this.enabledRange[1] === 'auto') {
                this.enabledRange[1] = this.level.prefs.clip.x2;
            }
        }
    }
}
