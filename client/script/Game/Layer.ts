module ACV.Game {


    interface IFlySpriteCssProps {
        transform?:string;
        height?:number;
    }

    /**
     * @since 2013-11-03
     */
    export class Layer extends ACV.Core.AbstractObject {
        element: JQuery = null;

        prefs: ACV.Data.ILayerPrefs;
        private sprites: ACV.Game.Sprite[] = [];
        private appContext: ACV.AppContext;
        handle: string;
        private x: number = 0;
        private lookAroundDistortion: ILookAroundDistortion;

        constructor( appContext: ACV.AppContext, handle: string, prefs: ACV.Data.ILayerPrefs, sprites: ACV.Game.Sprite[] ) {

            super('ACV.Game.Layer');

            if (typeof handle !== 'string' || handle.length === 0) {
                throw new Error('Handle must be string of positive length.');
            }
            this.appContext = appContext;
            this.handle = handle;
            this.prefs = prefs;
            this.sprites = sprites;
            this.lookAroundDistortion = {
                x: 0,
                y: 0
            };
        }

        static createFromPrefs( appContext: ACV.AppContext, data: ACV.Data.ILayerData ) {
            var spriteIndex: any,
                sprites: Sprite[] = [];

            for (spriteIndex in data.sprites) {
                sprites.push(Sprite.createFromPrefs(appContext, data.sprites[spriteIndex]));
            }
            return new Layer(appContext, data.handle, data.prefs, sprites);
        }


        init( levelHandle: string,
              sceneElement: JQuery,
              minHeight: number,
              viewportDimensions: ACV.View.IViewportDimensions,
              flySprites: {[handle:string]:IFlySprite} ) {

            var id = 'layer-' + levelHandle + '-' + this.handle,
                spriteIndex: any,
                spriteWrapper: JQuery;

            //TODO remove handles in productive environment
            this.element = $('<div class="layer" id="' + id + '"><div class="sprite-wrapper" /></div>');
            this.element.css({
                minHeight: minHeight
            });

            spriteWrapper = this.element.children('.sprite-wrapper');

            for (spriteIndex in this.sprites) {
                this.sprites[spriteIndex].init(levelHandle, this.handle, spriteWrapper);
                this.positionSprite(this.sprites[spriteIndex], viewportDimensions, flySprites);
            }

            //Add to DOM at last to reduce draw calls
            sceneElement.append(this.element);
            this.info('Layer initialized with ' + this.sprites.length + ' sprites', 'd');
        }

        /**
         *
         * History:
         * 2014-03-05 Improved variable naming to clearly indicate levelX and levelXBefore
         *
         * @param {!number} levelOffset
         * @param {!number} levelX The amount of pixels that already left the viewport on the left side. Positive integer
         * @param {!number} levelXBefore
         * @param {!number} levelClipOffset
         * @param {!Array<IFlySprite>} flySprites
         * @param {!IViewportDimensions}  viewportDimensions
         * @version 2014-03-05
         */
        updatePositions( levelOffset: number,
                         levelX: number,
                         levelXBefore: number,
                         levelClipOffset: number,
                         viewportDimensions: ACV.View.IViewportDimensions,
                         flySprites: {[handle:string]:IFlySprite} ) {

            if (viewportDimensions.heightChanged) {
                this.recalculateSpritePositions(viewportDimensions, flySprites);
            }
            this.x = -1 * (levelOffset + levelClipOffset + this.prefs.speed * levelX - this.prefs.offset);
            this.element.css('transform', 'translate(' + (this.x + this.lookAroundDistortion.x) + 'px, ' + this.lookAroundDistortion.y + 'px)');
        }


        private recalculateSpritePositions( viewportDimensions: ACV.View.IViewportDimensions, flySprites: {[handle:string]:IFlySprite} ) {
            var spriteIndex: any,
                sprite: Sprite;
            this.info('Recalculating y positions of all sprites');
            for (spriteIndex in this.sprites) {
                sprite = this.sprites[spriteIndex];
                //Recalculate sprites y-positions if necessary
                if (typeof sprite.y === 'function' || typeof sprite.height === 'function') {
                    this.positionSprite(sprite, viewportDimensions, flySprites);
                }
            }
        }

        /**
         * Is only invoked once for static sprites (from init()).
         */
        private positionSprite( sprite: ACV.Game.Sprite,
                                viewportDimensions: ACV.View.IViewportDimensions,
                                flySprites: {[handle:string]:IFlySprite} ) {

            /* flySprite is a flyweight representation of a Sprite */
            var cssProps: IFlySpriteCssProps = {},
                flySprite: IFlySprite = flySprites[sprite.handle];

            if (!flySprite) {
                flySprite = {
                    isStatic: typeof sprite.y !== 'function'
                };
            }

            if (typeof sprite.y === 'function') {
                flySprite.y = sprite.y.apply(flySprite, [
                    this.appContext.prefs.maxLookAroundDistortion,
                    viewportDimensions.height,
                    flySprites
                ]);

            } else if (typeof sprite.y === 'number') {
                flySprite.y = sprite.y;

            } else {
                flySprite.y = sprite.y.indexOf('%') === -1 ? parseInt(sprite.y) : viewportDimensions.height / 100 * parseInt(sprite.y);
            }

            if (sprite.topAligned) {
                cssProps.transform = 'translate(' + sprite.x + 'px, ' + flySprite.y + 'px)';
            } else {
                cssProps.transform = 'translate(' + sprite.x + 'px, ' + -1 * flySprite.y + 'px)';
            }

            //Calculate height
            switch (typeof sprite.height) {
                case 'function':
                    flySprite.height = sprite.height.apply(flySprite, [this.appContext.prefs.maxLookAroundDistortion, viewportDimensions.height, flySprites]);
                    flySprite.isStatic = false;
                    cssProps.height = flySprite.height;
                    break;
                case 'number':
                    flySprite.height = sprite.height;
                    break;
                default:
                    flySprite.height = sprite.height.indexOf('%') === -1 ? parseInt(sprite.height) : viewportDimensions.height / 100 * parseInt(sprite.height);
                    cssProps.height = flySprite.height;
            }

            if (flySprites[this.handle] === undefined) {
                flySprites[this.handle] = {};
            }
            //TODO remove any cast
            (<any>flySprites[this.handle])[sprite.handle] = flySprite;

            sprite.element.css(cssProps);
        }

        /**
         * @since 2014-03-18
         */
        applyLookAroundDistortion( lookAroundDistortion: ILookAroundDistortion ) {

            this.lookAroundDistortion.x = lookAroundDistortion.x * this.prefs.speed;
            this.lookAroundDistortion.y = lookAroundDistortion.y * this.prefs.speed;

            this.element.css({
                transform: 'translate(' + (this.x + this.lookAroundDistortion.x) + 'px, ' + this.lookAroundDistortion.y + 'px)'
            });
        }

        //getHitSprites( levelRelativeX: number,
        //               y: number,
        //               flySprites: {[layerHandle:string]:{[spriteHandle:string]:IFlySprite}},
        //               viewportDimensions: ACV.View.IViewportDimensions ): Sprite[] {
        //
        //    var sprites: Sprite[] = [],
        //        spriteIndex: any,
        //        sprite: Sprite,
        //        flySprite: IFlySprite,
        //        testX: number,
        //        adjustedY: number;
        //
        //    for (spriteIndex in this.sprites) {
        //        sprite = this.sprites[spriteIndex];
        //        testX = this.prefs.offset + this.x + sprite.x + this.lookAroundDistortion.x;
        //        if (levelRelativeX >= testX && levelRelativeX <= testX + sprite.width) {
        //
        //            //  sprite.element.css('background', '#ff0000');
        //            flySprite = flySprites[this.handle][sprite.handle];
        //            if (flySprite === null) {
        //                this.positionSprite(sprite, viewportDimensions, flySprites);
        //                flySprite = flySprites[this.handle][sprite.handle];
        //            }
        //            if (sprite.topAligned) {
        //                adjustedY = y;
        //            } else {
        //                adjustedY = this.element.height() - y;
        //            }
        //            adjustedY += this.lookAroundDistortion.y;
        //
        //            // console.log(adjustedY, flySprite, flySprite.height, sprite.handle, sprite.element);
        //            if (adjustedY >= flySprite.y && adjustedY <= flySprite.y + flySprite.height) {
        //                sprites.push(sprite);
        //            }
        //        }
        //    }
        //    return sprites;
        //}
    }
}