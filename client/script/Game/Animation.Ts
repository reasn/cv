module ACV.Game {

    /**
     * @since 2014-05-03
     */
    export class Animation extends ACV.Core.AbstractObject {

        dependency: string = '';//string Can be levelX or playerX
        enabledRange: any = 'auto';
        granularity: number = 0;
        action: () => void = null;//this: ACV.Game.Animation
        levelX: number = 0;
        levelXBefore: number = 0;
        viewportDimensions: ACV.View.IViewportDimensions = null;

        lastCoarseLevelX: number = -1;

        private name = '';
        private level: ACV.Game.Level = null;
        private scene: ACV.Game.Scene = null;

        constructor(data: ACV.Data.IAnimationData) {

            super('ACV.Game.Animation');

            var keys: string[] = Object.keys(data),
                keyIndex: any;

            for (keyIndex in keys) {
                (<any>this)[keys[keyIndex]] = (<any>data)[keys[keyIndex]];
            }
        }

        static createFromPrefs(data: ACV.Data.IAnimationData): Animation {
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
