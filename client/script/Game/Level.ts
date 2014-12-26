module ACV.Game {


    /**
     * @since 2014-02-28
     */
    export class Level extends ACV.Core.AbstractObject {

        backgroundLayers: ACV.Game.Layer[] = [];
        foregroundLayers: ACV.Game.Layer[] = [];
        visible = false;
        prefs: any = null;

        private handle: string = '';
        private animations = [];
        private x: number = 0;
        private xBefore: number = 0;
        private lookAroundDistortion: LookAroundDistortion = null;

        private appContext: ACV.AppContext = null;
        private flySprites: {[handle:string]:FlySprite} = {};
        private foregroundElement: JQuery = null;
        private backgroundElement: JQuery = null;

        constructor(appContext: ACV.AppContext,
                    handle: string,
                    prefs: any,
                    animations: Animation[],
                    backgroundLayers: ACV.Game.Layer[],
                    foregroundLayers: ACV.Game.Layer[]) {

            super('ACV.Game.Level');

            this.appContext = appContext;
            this.handle = handle;
            this.prefs = prefs;
            this.animations = animations;
            this.backgroundLayers = backgroundLayers;
            this.foregroundLayers = foregroundLayers;
        }

        /**
         *
         * @param {ACV.AppContext} appContext
         * @param {Object} data
         * @returns {ACV.Game.Level}
         */
        static createFromPrefs(appContext, data) {

            var backgroundLayers = [], foregroundLayers = [], layerIndex, layer, animationIndex, animations = [];

            for (layerIndex in data.layers.background) {
                layer = ACV.Game.Layer.createFromPrefs(appContext, data.layers.background[layerIndex]);
                layer.prefs.offset += data.prefs.offset;
                backgroundLayers.push(layer);
            }
            for (layerIndex in data.layers.foreground) {
                layer = ACV.Game.Layer.createFromPrefs(appContext, data.layers.foreground[layerIndex]);
                layer.prefs.offset += data.prefs.offset;
                foregroundLayers.push(layer);
            }
            for (animationIndex in data.animations) {
                animations.push(ACV.Game.Animation.createFromPrefs(data.animations[animationIndex]));
            }

            return new ACV.Game.Level(appContext, data.handle, data.prefs, animations, backgroundLayers, foregroundLayers);
        }


        init(scene: ACV.Game.Scene,
             backgroundWrapper: JQuery,
             foregroundWrapper: JQuery,
             minHeight: number,
             lookAroundDistortion: LookAroundDistortion,
             viewportDimensions: ACV.View.ViewportDimensions): void {
            var layerIndex, animationIndex;

            this.lookAroundDistortion = lookAroundDistortion;

            this.backgroundElement = $('<div class="level background level-' + this.handle.substr(0, this.handle.indexOf('-')) + '"data-handle="' + this.handle + '" />');
            this.backgroundElement.css('max-width', this.prefs.clip.x2);

            this.foregroundElement = $('<div class="level foreground level-' + this.handle.substr(0, this.handle.indexOf('-')) + '" data-handle="' + this.handle + '" />');
            this.foregroundElement.css('max-width', this.prefs.clip.x2);

            for (layerIndex in this.backgroundLayers) {
                //TODO remove children() from loop
                this.backgroundLayers[layerIndex].init(this.backgroundElement, minHeight, viewportDimensions, this.flySprites);
            }
            for (layerIndex in this.foregroundLayers) {
                //TODO remove children() from loop
                this.foregroundLayers[layerIndex].init(this.foregroundElement, minHeight, viewportDimensions, this.flySprites);
            }

            for (animationIndex in this.animations) {
                this.animations[animationIndex].init(scene, this);
            }

            //Add to DOM at last to reduce draw calls
            backgroundWrapper.append(this.backgroundElement);
            foregroundWrapper.append(this.foregroundElement);
            this.info('Level initialized with ' + this.foregroundLayers.length + ' foreground layers and ' + this.backgroundLayers.length + ' background layers', 'd');
        }

        /**
         *
         * @since 2017-03-25
         */
        getWidth(): number {
            return this.prefs.clip.x2 - this.prefs.clip.x1;
        }

        /**
         * Filter out dynamic fly sprites to reduce memory usage.
         *
         * More important purpose: ensures that no invalid dependencies occur where sprite A is positioned relative to sprite B's position before sprite B is repositioned.
         * In that case this method makes sure sprite A has no invalid/outdated position because it makes sure that sprites can only access other sprites dynamic positions
         * within the same recalculation call.
         * @private
         */
        private removeDynamicFlySprites() {
            var layerHandles, layerHandleIndex, spriteHandles, spriteHandleIndex;

            layerHandles = Object.keys(this.flySprites);

            for (layerHandleIndex in layerHandles) {
                var sprites = this.flySprites[layerHandles[layerHandleIndex]];

                spriteHandles = Object.keys(sprites);

                for (spriteHandleIndex in spriteHandles) {
                    if (sprites[spriteHandles[spriteHandleIndex]] !== null && !sprites[spriteHandles[spriteHandleIndex]].static) {
                        sprites[spriteHandles[spriteHandleIndex]] = null
                    }
                }
            }
        }

        /**
         *
         * @since 2014-03-18
         */
        applyLookAroundDistortion() {
            var layerIndex;

            for (layerIndex in this.foregroundLayers) {
                this.foregroundLayers[layerIndex].applyLookAroundDistortion(this.lookAroundDistortion);
            }
            for (layerIndex in this.backgroundLayers) {
                this.backgroundLayers[layerIndex].applyLookAroundDistortion(this.lookAroundDistortion);
            }
        }

        /**
         *
         * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
         * @param {!number} sceneXBefore
         * @param {ViewportDimensions} viewportDimensions
         * @returns void
         */
        updatePositions(sceneX: number, sceneXBefore: number, viewportDimensions: ACV.View.ViewportDimensions) {

            this.x = sceneX - this.prefs.offset;
            //TODO before the refactoring XBefore was set:
            //this.xBefore = sceneXBefore - this.prefs.offset;

            this.updateVisibility(sceneX, sceneXBefore, viewportDimensions);
            if (!this.visible) {
                return;
            }
            this.applyClippingAndUpdateLayerPositions(sceneX, viewportDimensions);
            this.handleAnimations(sceneX, sceneXBefore, viewportDimensions, false);
        }


        /**
         * Hides or shows the level if appropriate.
         *
         * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
         * @param {!number} sceneXBefore
         * @param {ViewportDimensions} viewportDimensions
         * @returns void
         * @private
         * @version 2014-03-05
         * @since 2014-03-05
         * @author Alexander Thiel
         */
        private updateVisibility(sceneX: number, sceneXBefore: number, viewportDimensions: ACV.View.ViewportDimensions) {
            var showLevelSceneX = this.prefs.offset + this.prefs.visibility.x1;
            var hideLevelSceneX = this.prefs.offset + this.prefs.visibility.x2;

            if (this.visible && (sceneX < showLevelSceneX || sceneX > hideLevelSceneX)) {
                this.info('Hiding level ' + this.handle, 'i');
                this.visible = false;
                this.foregroundElement.removeClass('visible');
                this.backgroundElement.removeClass('visible');

            } else if (!this.visible && (sceneX >= showLevelSceneX && sceneX <= hideLevelSceneX)) {
                this.info('Showing level ' + this.handle, 'i');
                this.visible = true;
                this.foregroundElement.addClass('visible');
                this.backgroundElement.addClass('visible');
                //Makes sure that all animations are in the right state right after the level is added to the DOM
                this.handleAnimations(sceneX, sceneXBefore, viewportDimensions, true)
            }
        }


        /**
         * Apply clipping to the left and right
         * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
         * @param {!ViewportDimensions} viewportDimensions
         * @returns void
         * @private
         * @version 2014-03-05
         * @since 2014-03-05
         * @author Alexander Thiel
         */
        private applyClippingAndUpdateLayerPositions(sceneX: number,
                                                     viewportDimensions: ACV.View.ViewportDimensions) {
            var layerIndex, distanceBetweenLeftViewportMarginAndLevelBegin;

            distanceBetweenLeftViewportMarginAndLevelBegin = this.prefs.offset - sceneX + this.prefs.clip.x1;

            this.backgroundElement.css('margin-left', distanceBetweenLeftViewportMarginAndLevelBegin + 'px');
            this.foregroundElement.css('margin-left', distanceBetweenLeftViewportMarginAndLevelBegin + 'px');

            this.removeDynamicFlySprites();
            for (layerIndex in this.backgroundLayers) {
                this.backgroundLayers[layerIndex].updatePositions(this.prefs.offset, this.x, this.xBefore, distanceBetweenLeftViewportMarginAndLevelBegin, viewportDimensions, this.flySprites);
            }
            for (layerIndex in this.foregroundLayers) {
                this.foregroundLayers[layerIndex].updatePositions(this.prefs.offset, this.x, this.xBefore, distanceBetweenLeftViewportMarginAndLevelBegin, viewportDimensions, this.flySprites);
            }
        }


        /**
         * Handle animations.
         *
         * @param {!number} sceneX The amount of pixels that already left the viewport on the left side. Positive integer
         * @param {!number} sceneXBefore
         * @param {!ViewportDimensions} viewportDimensions
         * @param {!boolean} executeOutOfRangeAnimation Set to true to suppress all animation's range checks (useful to have all animations triggered when the level is added to the DOM).
         * @returns void
         * @private
         * @version 2014-03-05
         * @since 2014-03-05
         * @author Alexander Thiel
         */
        private handleAnimations(sceneX: number,
                                 sceneXBefore: number,
                                 viewportDimensions: ACV.View.ViewportDimensions,
                                 executeOutOfRangeAnimation: boolean) {
            var animationIndex, animation, coarseLevelX;

            //handle animations that are dependent on levelX
            for (animationIndex in this.animations) {

                animation = this.animations[animationIndex];
                if (animation.dependency === 'levelX') {
                    if (!executeOutOfRangeAnimation && (this.x < animation.enabledRange[0] || this.x > animation.enabledRange[1])) {
                        continue;
                    }
                    coarseLevelX = Math.round(this.x / animation.granularity);

                    if (coarseLevelX !== animation.lastCoarseLevelX) {
                        animation.lastCoarseLevelX = coarseLevelX;
                        animation.viewportDimensions = viewportDimensions;
                        animation.levelX = this.x;
                        animation.levelXBefore = this.xBefore;
                        animation.action.apply(animation);
                    }
                }
            }
        }
    }
}