module ACV.Game {

    /**
     * @since 2013-11-19
     */
    export class PlayerLayer extends ACV.Core.AbstractObject {

        element: JQuery = null;
        skillBasket: ACV.HUD.SkillBasket;
        player: Player;
        powerUps: PowerUp[];
        speechBubble: SpeechBubble;

        private appContext: ACV.AppContext = null;
        private prefs: ACV.Data.IPlayerLayerPrefs;
        private lookAroundDistortion: ILookAroundDistortion = {
            x: 0,
            y: 0
        };
        private x = 0;


        constructor( appContext: ACV.AppContext, prefs: ACV.Data.IPlayerLayerPrefs, player: Player, speechBubble: SpeechBubble, powerUps: PowerUp[] ) {

            super('ACV.Game.PlayerLayer');

            appContext.player = player;
            appContext.playerSpeechBubble = speechBubble;

            this.appContext = appContext;
            this.prefs = prefs;
            this.player = player;
            this.speechBubble = speechBubble;
            this.powerUps = powerUps;
        }

        static createFromData( appContext: ACV.AppContext, data: ACV.Data.IPlayerLayerData ) {
            var player: Player,
                powerUpIndex: any,
                speechBubble: SpeechBubble,
                powerUps: PowerUp[] = [];

            player = new ACV.Game.Player(data.player);
            speechBubble = new ACV.Game.SpeechBubble(data.speechBubble.prefs, data.speechBubble.messages);

            for (powerUpIndex in data.powerUps) {
                powerUps.push(new PowerUp(data.powerUps[powerUpIndex].x, data.powerUps[powerUpIndex].y, data.powerUps[powerUpIndex].type));
            }
            return new ACV.Game.PlayerLayer(appContext, data.prefs, player, speechBubble, powerUps);
        }

        init( wrapperElement: JQuery, width: number, minHeight: number, lookAroundDistortion: ILookAroundDistortion ) {
            var powerUpIndex: any;

            this.lookAroundDistortion = lookAroundDistortion;

            this.element = $('<div id="player-layer" />');
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

            this.player.addMovementListener(( playerX: number,
                                              playerXBefore: number,
                                              targetPlayerX: number,
                                              playerY: number,
                                              sceneX: number,
                                              viewportDimensions: ACV.View.IViewportDimensions ) => {
                this.detectCollisions(playerX, playerXBefore, sceneX, viewportDimensions);
                if (this.speechBubble.visible) {
                    this.speechBubble.updatePosition(playerX, playerY);
                }
            });

            this.speechBubble.init(this.element);

            //Add to DOM at last to reduce draw calls
            wrapperElement.append(this.element);
        }

        updatePositions( sceneX: number,
                         viewportDimensions: ACV.View.IViewportDimensions ) {
            //var granularSceneX = Math.round(sceneX / this.prefs.collisionDetectionGridSize);

            //Set wrapper position to have the player stay at the same point of the scrolling scenery
            this.x = -sceneX;
            this.element.css('transform', 'translate(' + (this.x + this.lookAroundDistortion.x) + 'px, ' + this.lookAroundDistortion.y + 'px)');
            this.player.updatePosition(sceneX, viewportDimensions);
        }


        /**
         *
         * @since 2014-03-18
         */
        applyLookAroundDistortion() {
            this.element.css('transform', 'translate(' + (this.x + this.lookAroundDistortion.x) + 'px, ' + this.lookAroundDistortion.y + 'px)');
        }


        private detectCollisions( playerX: number,
                                  playerXBefore: number,
                                  sceneX: number,
                                  viewportDimensions: ACV.View.IViewportDimensions ) {
            var powerUpIndex: any,
                powerUp: PowerUp,
                testX: number,
                collected: PowerUp[] = [];

            for (powerUpIndex in this.powerUps) {
                powerUp = this.powerUps[powerUpIndex];
                testX = powerUp.x - this.prefs.hitBox;
                if (!powerUp.collected && playerX > testX && playerXBefore < testX) {
                    collected.push(powerUp);
                }
            }
            for (powerUpIndex in collected) {
                this.skillBasket.collectPowerUp(collected[powerUpIndex], sceneX, viewportDimensions);
                ACV.Utils.removeFromArray(this.powerUps, collected[powerUpIndex]);
            }
        }
    }
}
