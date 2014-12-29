/// <reference path="../Core/AbstractObject"/>

module ACV.Game {

    interface ISceneViewportDimensions {
        width:         number;
        height:        number;
        widthChanged:  boolean;
        heightChanged: boolean;
    }

    /**
     * @since 2013-11-03
     */
    export class Scene extends ACV.Core.AbstractObject {

        playerLayer: PlayerLayer = null;

        private prefs = {
            width:           0,
            dynamicViewport: {
                minHeight: 300
            }
        };
        private backgroundElement: JQuery = null;
        private foregroundElement: JQuery = null;
        private triggerManager: TriggerManager = null;
        private levels: Level[] = [];
        private appContext: ACV.AppContext = null;
        private width: number = 0;
        private sceneViewportDimensions: ISceneViewportDimensions;
        private lookAroundDistortion: ILookAroundDistortion;
        private x: number = 0;
        private xBefore: number = 0;
        private element: JQuery;

        constructor( appContext: ACV.AppContext,
                     element: JQuery,
                     prefs: ACV.Data.IScenePrefs,
                     levels: Level[],
                     playerLayer: PlayerLayer,
                     triggerManager: TriggerManager ) {

            super('ACV.Game.Scene');

            this.appContext = appContext;
            this.element = $(element);
            this.prefs = prefs;
            this.playerLayer = playerLayer;
            this.triggerManager = triggerManager;
            this.triggerManager.scene = this;
            this.levels = levels;
            this.sceneViewportDimensions = {
                width:         0,
                height:        0,
                widthChanged:  false,
                heightChanged: false
            };
            this.lookAroundDistortion = {
                x: 0,
                y: 0
            };
        }

        static createFromData( appContext: ACV.AppContext, element: JQuery, data: ACV.Data.ISceneData ): Scene {
            var levels: Level[] = [],
                playerLayer: PlayerLayer,
                triggerManager: TriggerManager,
                levelIndex: any;

            playerLayer = PlayerLayer.createFromData(appContext, data.playerLayer);

            for (levelIndex in data.levels) {
                if (data.levels[levelIndex].enabled) {
                    levels.push(Level.createFromPrefs(appContext, data.levels[levelIndex]));
                }
            }

            triggerManager = TriggerManager.createFromData(data.triggers, appContext.performanceSettings);
            return new Scene(appContext, element, data.prefs, levels, playerLayer, triggerManager);
        }

        init( hud: ACV.HUD.HeadsUpDisplay ) {
            var levelIndex: any;

            this.sceneViewportDimensions.width = this.appContext.viewportManager.getDimensions().width;
            this.sceneViewportDimensions.height = this.appContext.viewportManager.getDimensions().height - hud.height;

            this.playerLayer.skillBasket = hud.skillBasket;

            this.element.css({
                bottom: 'auto',
                height: this.sceneViewportDimensions.height
            });

            this.backgroundElement = $('<div class="level-wrapper background" />');
            this.foregroundElement = $('<div class="level-wrapper foreground" />');

            for (levelIndex in this.levels) {
                this.levels[levelIndex].init(this, this.backgroundElement, this.foregroundElement, this.prefs.dynamicViewport.minHeight, this.lookAroundDistortion, this.sceneViewportDimensions);
                this.width += this.levels[levelIndex].getWidth();
            }

            // Reduce draw calls by adding everything to the DOM at last
            this.element.append(this.backgroundElement);
            this.playerLayer.init(this.element, this.width, this.prefs.dynamicViewport.minHeight, this.lookAroundDistortion);

            this.appContext.player.addMovementListener(( playerX, playerXBefore, targetPlayerX, sceneX )=> {
                $('#playerX').text(Math.round(playerX));
                this.handleTriggers(playerX, playerXBefore, targetPlayerX, sceneX);
            });

            if (this.appContext.performanceSettings.lookAroundDistortion) {
                this.appContext.viewportManager.listenToMouseMove(( clientX: number, clientY: number, viewportDimensions: ACV.View.IViewportDimensions ) => {
                    this.handleMouseMove(clientX, clientY, viewportDimensions);
                });
            }

            this.appContext.viewportManager.listenToMouseClick(( clientX, clientY, viewportDimensions )=> {
                this.handleMouseClick(clientX, clientY, viewportDimensions);
            });

            //Sink events
            this.appContext.viewportManager.listenToScroll(( ratio, ratioBefore, viewportDimensions )=> {
                this.sceneViewportDimensions.width = viewportDimensions.width;
                this.sceneViewportDimensions.height = viewportDimensions.height - hud.height;
                this.sceneViewportDimensions.widthChanged = viewportDimensions.widthChanged;
                this.sceneViewportDimensions.heightChanged = viewportDimensions.heightChanged;
                this.updatePositions(ratio);
            });

            this.element.append(this.foregroundElement);
        }

        private handleMouseMove( clientX: number, clientY: number, appViewportDimensions: ACV.View.IViewportDimensions ) {
            /*
             * We use Math.floor() instead of Math.round() to obtain a
             * continuous distribution of the results and therefore
             * reduce (probably invisible) micro-flickering.
             */
            this.lookAroundDistortion.x = -Math.floor(this.appContext.prefs.maxLookAroundDistortion * 2 * (clientX / appViewportDimensions.width - .5));
            this.lookAroundDistortion.y = -Math.floor(this.appContext.prefs.maxLookAroundDistortion * 2 * (clientY / appViewportDimensions.height - .5));
            this.applyLookAroundDistortion();
            $('#mouseX').text(Math.round(this.x + clientX));
            /*
             for(var i in this.levels) {
             for(var layerHandle in this.levels[i].flySprites) {
             for(var spriteHandle in this.levels[i].flySprites[layerHandle]) {
             var s:IFlySprite = this.levels[i].flySprites[layerHandle][spriteHandle];

             }
             }
             }
             */
        }

        private selectSprites( clientX: number, clientY: number, viewportDimensions: ACV.View.IViewportDimensions ) {
            var selectedSprites: Sprite[] = [],
                levelRelativeX: number,
                adjustedY = clientY + this.dynamicTopViewportTranslation;
            for (var i in this.levels) {
                levelRelativeX = clientX + this.x - this.levels[i].prefs.offset;
                if (levelRelativeX > 0 && levelRelativeX < this.levels[i].prefs.clip.x2) {
                    //console.log(i, levelRelativeX);
                    selectedSprites = selectedSprites.concat(this.levels[i].getHitSprites(levelRelativeX, adjustedY, viewportDimensions));
                }
            }
            $('.sprite').removeClass('selected');
            this.info('Player selected %s sprites via click', selectedSprites.length);
            for (var j in selectedSprites) {
                //console.log(selectedSprites[j].element);
                selectedSprites[j].element.addClass('selected');
            }
        }

        handleMouseClick( clientX: number, clientY: number, viewportDimensions: ACV.View.IViewportDimensions ) {
            var targetX = this.x + clientX;

            this.info('User clicked, player will walk to %s', targetX);
            this.playerLayer.player.moveTo(targetX, this.x, 0.5, this.sceneViewportDimensions);
            //this.selectSprites(clientX, clientY, viewportDimensions);
        }

        /**
         *
         * @since 2014-03-18
         */
        applyLookAroundDistortion() {
            var levelIndex: any;

            for (levelIndex in this.levels) {
                if (this.levels[levelIndex].visible) {
                    this.levels[levelIndex].applyLookAroundDistortion();
                }
            }

            this.playerLayer.applyLookAroundDistortion()
        }

        updatePositions( ratio: number ) {
            var levelIndex: any;

            //this.x must be at least 0. Therefore Math.max() is required to avoid unexpected behaviour if the screen is larger than the entire scene
            this.x = Math.max(0, ratio * (this.width - this.sceneViewportDimensions.width));
            this.xBefore = Math.max(0, ratio * (this.width - this.sceneViewportDimensions.width));

            if (this.sceneViewportDimensions.heightChanged) {
                this.element.css('height', this.sceneViewportDimensions.height);
                this.debug('New scene height: %s', this.sceneViewportDimensions.height);
            }

            for (levelIndex in this.levels) {
                this.levels[levelIndex].updatePositions(this.x, this.xBefore, this.sceneViewportDimensions);
            }

            if (this.sceneViewportDimensions.widthChanged || this.sceneViewportDimensions.heightChanged) {
                this.handleViewportChange();
            }
            this.playerLayer.updatePositions(this.x, this.sceneViewportDimensions);

            //TODO remove:
            $('#sceneX').text(Math.round(this.x));
        }

        handleTriggers( playerX: number, playerXBefore: number, targetPlayerX: number, sceneX: number ) {
            this.triggerManager.check(playerX, playerXBefore, targetPlayerX, sceneX);
        }

        private handleViewportChange() {
            var levelIndex: any,
                layerIndex: any,
                elementsToAlter: JQuery;

            /*
             elementsToAlter = this.playerLayer.element;

             for (levelIndex in this.levels) {

             for (layerIndex in this.levels[levelIndex].backgroundLayers) {
             elementsToAlter = elementsToAlter.add(this.levels[levelIndex].backgroundLayers[layerIndex].element);
             }
             for (layerIndex in this.levels[levelIndex].foregroundLayers) {
             elementsToAlter = elementsToAlter.add(this.levels[levelIndex].foregroundLayers[layerIndex].element);
             }
             }

             if (this.sceneViewportDimensions.height < this.prefs.dynamicViewport.minHeight) {
             this.dynamicTopViewportTranslation = Math.round(-.5 * (this.prefs.dynamicViewport.minHeight - this.sceneViewportDimensions.height));
             //  elementsToAlter.css('y', this.dynamicTopViewportTranslation + 'px');

             } else {
             this.dynamicTopViewportTranslation = 0;
             }
             //elementsToAlter.css('top', this.dynamicTopViewportTranslation);
             */
            //TODO retest on small screens - seemed more beautiful when off
            this.dynamicTopViewportTranslation = 0;

        }

        private dynamicTopViewportTranslation: number = 0;
    }
}
