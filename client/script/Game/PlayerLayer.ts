module ACV.Game {

    /**
     * @since 2013-11-19
     */
    export class PlayerLayer extends ACV.Core.AbstractObject {

        element: JQuery = null;
        skillBasket: ACV.HUD.SkillBasket;
        player: Player;
        powerUps: PowerUp[];

        private appContext: ACV.AppContext = null;
        private prefs: ACV.Data.IPlayerLayerPrefs;
        private lastCollisionDetection: number = 0;
        private lookAroundDistortion: ILookAroundDistortion = {
            x: 0,
            y: 0
        };
        private x = 0;


        constructor(appContext: ACV.AppContext, prefs: ACV.Data.IPlayerLayerPrefs, player: Player, powerUps: PowerUp[]) {

            super('ACV.Game.PlayerLayer');

            appContext.player = player;

            this.appContext = appContext;
            this.prefs = prefs;
            this.player = player;
            this.powerUps = powerUps;
        }

        static createFromData(appContext: ACV.AppContext, data: ACV.Data.IPlayerLayerData) {
            var player: Player,
                powerUpIndex: any,
                powerUps: PowerUp[] = [];

            player = new ACV.Game.Player(data.player);
            for (powerUpIndex in data.powerUps) {
                powerUps.push(new PowerUp(data.powerUps[powerUpIndex].x, data.powerUps[powerUpIndex].y, data.powerUps[powerUpIndex].type));
            }
            return new ACV.Game.PlayerLayer(appContext, data.prefs, player, powerUps);
        }

        init(wrapperElement: JQuery, width: number, minHeight: number, lookAroundDistortion: ILookAroundDistortion) {
            var powerUpIndex: any;

            this.lookAroundDistortion = lookAroundDistortion;

            this.element = $('<div class="player-layer" />');
            this.element.css(
                {
                    width:     width,
                    minHeight: minHeight
                });

            for (powerUpIndex in this.powerUps) {
                this.powerUps[powerUpIndex].init(this.element);
            }

            //enclose variable here to reduce calls and improve performance

            this.player.init(this.element);

            this.player.addMovementListener((playerX: number,
                                             playerXBefore: number,
                                             targetPlayerX: number,
                                             sceneX: number,
                                             viewportDimensions: ACV.View.IViewportDimensions) => {
                this.detectCollisions(playerX, playerXBefore, sceneX, viewportDimensions);
            });

            //Add to DOM at last to reduce draw calls
            wrapperElement.append(this.element);
        }

        updatePositions(sceneX: number,
                        viewportDimensions: ACV.View.IViewportDimensions) {
//    var granularSceneX = Math.round(sceneX / this.prefs.collisionDetectionGridSize);

            //Set wrapper position to have the player stay at the same point of the scrolling scenery
            this.x = -sceneX;
            this.element.css('left', (this.x + this.lookAroundDistortion.x) + 'px');
            this.player.updatePosition(sceneX, viewportDimensions);
        }


        /**
         *
         * @since 2014-03-18
         */
        applyLookAroundDistortion() {

            this.element.css({
                top:  this.lookAroundDistortion.y + 'px',
                left: (this.x + this.lookAroundDistortion.x) + 'px'
            });
        }


        private detectCollisions(playerX: number,
                                 playerXBefore: number,
                                 sceneX: number,
                                 viewportDimensions: ACV.View.IViewportDimensions) {
            var testX: number,
                powerUpIndex: any,
                powerUp: PowerUp;

            testX = playerX + this.prefs.hitBox + .5 * this.player.width;

            for (powerUpIndex in this.powerUps) {
                powerUp = this.powerUps[powerUpIndex];
                if (!powerUp.collected && playerX > powerUp.x && playerXBefore < powerUp.x) {
                    this.skillBasket.collectPowerUp(this.powerUps.splice(powerUpIndex, 1)[0], sceneX, viewportDimensions);
                    powerUpIndex--;
                }
            }
        }
    }
}
