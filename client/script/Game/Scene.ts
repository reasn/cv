/// <reference path="../Core/AbstractObject"/>

module ACV.Game {

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
        private sceneViewportDimensions = {
            width:         0,
            height:        0,
            widthChanged:  false,
            heightChanged: false
        };
        private lookAroundDistortion: LookAroundDistortion = {
            x: 0,
            y: 0
        };
        private x: number = 0;
        private xBefore: number = 0;
        private element: JQuery;

        constructor(appContext: ACV.AppContext,
                    element: JQuery,
                    prefs: any,
                    levels: Level[],
                    playerLayer: PlayerLayer,
                    triggerManager: TriggerManager) {

            super('ACV.Game.Scene');

            this.appContext = appContext;
            this.element = $(element);
            this.prefs = prefs;
            this.playerLayer = playerLayer;
            this.triggerManager = triggerManager;
            this.triggerManager.scene = this;
            this.levels = levels;
        }

        static createFromData = function (appContext: ACV.AppContext, element: JQuery, data: any): Scene {
            var levels = [], playerLayer, triggerManager, levelIndex;

            playerLayer = ACV.Game.PlayerLayer.createFromData(appContext, data.playerLayer);

            for (levelIndex in data.levels) {
                if (data.levels[levelIndex].enabled) {
                    levels.push(ACV.Game.Level.createFromPrefs(appContext, data.levels[levelIndex]));
                }
            }

            triggerManager = TriggerManager.createFromData(data.triggers, appContext.performanceSettings);
            return new Scene(appContext, element, data.prefs, levels, playerLayer, triggerManager);
        }

        init(hud: ACV.HUD.HeadsUpDisplay) {
            var levelIndex, scene = this;

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

            this.appContext.player.addMovementListener(function (playerX, playerXBefore, targetPlayerX, sceneX) {
                $('#playerX').text(Math.round(playerX));
                scene.handleTriggers(playerX, playerXBefore, targetPlayerX, sceneX);
            });

            if (scene.appContext.performanceSettings.lookAroundDistortion) {
                this.appContext.viewportManager.listenToMouseMove(function (clientX, clientY, viewportDimensions) {
                    scene.handleMouseMove(clientX, clientY, viewportDimensions);
                });
            }

            this.appContext.viewportManager.listenToMouseClick(function (clientX, clientY, viewportDimensions) {
                scene.handleMouseClick(clientX);
            });

            //Sink events
            this.appContext.viewportManager.listenToScroll(function (ratio, ratioBefore, viewportDimensions) {
                scene.sceneViewportDimensions.width = viewportDimensions.width;
                scene.sceneViewportDimensions.height = viewportDimensions.height - hud.height;
                scene.sceneViewportDimensions.widthChanged = viewportDimensions.widthChanged;
                scene.sceneViewportDimensions.heightChanged = viewportDimensions.heightChanged;
                scene.updatePositions(ratio);
            });

            this.element.append(this.foregroundElement);
        }

        handleMouseMove(clientX, clientY, appViewportDimensions) {
            /*
             * We use Math.floor() instead of Math.round() to obtain a
             * continuous distribution of the results and therefore
             * reduce (probably invisible) micro-flickering.
             */
            //scene.lookAroundDistortion.x = -Math.floor(scene.appContext.prefs.maxLookAroundDistortion * 2 * (event.clientX / scene.sceneViewportDimensions.width - .5));
            //scene.lookAroundDistortion.y = -Math.floor(scene.appContext.prefs.maxLookAroundDistortion * 2 * (event.clientY / scene.sceneViewportDimensions.height - .5));
            this.lookAroundDistortion.x = -Math.floor(this.appContext.prefs.maxLookAroundDistortion * 2 * (clientX / appViewportDimensions.width - .5));
            this.lookAroundDistortion.y = -Math.floor(this.appContext.prefs.maxLookAroundDistortion * 2 * (clientY / appViewportDimensions.height - .5));
            this.applyLookAroundDistortion();
        }

        /**
         *
         * @param {number} clientX
         */
        handleMouseClick(clientX) {
            var targetX = this.x + clientX;

            this.info('User clicked, player will walk to %s', targetX);
            this.playerLayer.player.moveTo(targetX, this.x, 0.5, this.sceneViewportDimensions);
        }

        /**
         *
         * @since 2014-03-18
         */
        applyLookAroundDistortion() {
            var levelIndex;

            for (levelIndex in this.levels) {
                if (this.levels[levelIndex].visible) {
                    this.levels[levelIndex].applyLookAroundDistortion();
                }
            }

            this.playerLayer.applyLookAroundDistortion()
        }

        updatePositions(ratio: number) {
            var levelIndex;

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

        handleTriggers(playerX: number, playerXBefore: number, targetPlayerX: number, sceneX: number) {
            this.triggerManager.check(playerX, playerXBefore, targetPlayerX, sceneX);
        }

        private handleViewportChange() {
            var levelIndex, layerIndex, elementsToAlter;


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
                elementsToAlter.css('top', Math.round(-.5 * (this.prefs.dynamicViewport.minHeight - this.sceneViewportDimensions.height)) + 'px');

            } else {
                elementsToAlter.css('top', 0);
            }
        }
    }
}
