module ACV.Game {
    /**
     * @since 2013-11-03
     */

    export interface LookAroundDistortion {
        x: number;// - Between -50 and +50
        y: number;// - Between -50 and +50
    }

    export interface FlySprite {
        y?: number;
        height?: number;
        static?: boolean;
    }


    export class Layer extends ACV.Core.AbstractObject {
        element: JQuery = null;

        private prefs: any = null;
        private sprites: ACV.Game.Sprite[] = [];
        private appContext: ACV.AppContext = null;
        private handle: string = '';
        private x: number = 0;
        private lookAroundDistortion: LookAroundDistortion = {
            x: 0,
            y: 0
        };

        constructor(appContext: ACV.AppContext, handle: string, prefs: any, sprites: ACV.Game.Sprite[]) {

            super('ACV.Game.Layer');

            if (typeof handle !== 'string' || handle.length === 0) {
                throw new Error('Handle must be string of positive length.');
            }
            this.appContext = appContext;
            this.handle = handle;
            this.prefs = prefs;
            this.sprites = sprites;
        }

        static createFromPrefs(appContext, data) {
            var spriteIndex, sprites = [];
            for (spriteIndex in data.sprites) {
                sprites.push(ACV.Game.Sprite.createFromPrefs(appContext, data.sprites[spriteIndex]));
            }
            return new Layer(appContext, data.handle, data.prefs, sprites);
        }


        init(sceneElement, minHeight, viewportDimensions, flySprites) {
            var spriteIndex, spriteWrapper;

            //TODO remove handles in productive environment
            this.element = $('<div class="layer" data-handle="' + this.handle + '"><div class="sprite-wrapper" /></div>');
            this.element.css({
                minHeight: minHeight
            });

            spriteWrapper = this.element.children('.sprite-wrapper');

            for (spriteIndex in this.sprites) {
                this.sprites[spriteIndex].init(spriteWrapper);
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
         * @param {!Array<FlySprite>} flySprites
         * @param {!ViewportDimensions}  viewportDimensions
         * @version 2014-03-05
         */
        updatePositions(levelOffset, levelX, levelXBefore, levelClipOffset, viewportDimensions, flySprites) {

            if (viewportDimensions.heightChanged) {
                this.recalculateSpritePositions(viewportDimensions, flySprites);
            }
            this.x = -1 * (levelOffset + levelClipOffset + this.prefs.speed * levelX - this.prefs.offset);
            this.element.css('left', (this.x + this.lookAroundDistortion.x) + 'px');
        }

        /**
         * Is only invoked once for static sprites (from init()).
         */
        private positionSprite = function (sprite: ACV.Game.Sprite,
                                           viewportDimensions: ACV.View.ViewportDimensions,
                                           flySprites: FlySprite[]) {

            /* flySprite is a flyweight representation of a Sprite */
            var cssProps: any = {},
                flySprite: FlySprite = {
                    static: true
                };


            if (typeof sprite.y === 'function') {
                flySprite.y = sprite.y.apply(flySprite, [
                    this.appContext.prefs.maxLookAroundDistortion,
                    viewportDimensions.height,
                    flySprites
                ]);
                flySprite.static = false;

            } else if (typeof sprite.y === 'number') {
                flySprite.y = sprite.y;

            } else {
                flySprite.y = sprite.y.indexOf('%') === -1 ? parseInt(sprite.y) : viewportDimensions.height / 100 * parseInt(sprite.y);
            }

            if (sprite.topAligned) {
                cssProps.top = flySprite.y + 'px';
            } else {
                cssProps.bottom = flySprite.y + 'px';
            }

            //Calculate height
            if (typeof sprite.height === 'function') {
                flySprite.height = sprite.height.apply(flySprite, [this.appContext.prefs.maxLookAroundDistortion, viewportDimensions.height, flySprites]);
                flySprite.static = false;

            } else if (typeof sprite.height === 'number') {
                flySprite.height = sprite.height;

            } else {
                flySprite.height = sprite.height.indexOf('%') === -1 ? parseInt(sprite.height) : viewportDimensions.height / 100 * parseInt(sprite.height);
            }

            cssProps.height = flySprite.height;

            if (flySprites[this.handle] === undefined) {
                flySprites[this.handle] = {};
            }
            flySprites[this.handle][sprite.handle] = flySprite;

            sprite.element.css(cssProps);
        };


        private recalculateSpritePositions(viewportDimensions: ACV.View.ViewportDimensions, flySprites: FlySprite[]) {
            var spriteIndex, sprite;
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
         *
         * @since 2014-03-18
         */
        applyLookAroundDistortion(lookAroundDistortion: LookAroundDistortion) {

            /*
             * We use Math.floor() instead of Math.round() to obtain a
             * continuous distribution of the results and therefore
             * reduce (probably invisible) micro-flickering.
             */
            this.lookAroundDistortion.x = Math.floor(lookAroundDistortion.x * this.prefs.speed);
            this.lookAroundDistortion.y = Math.floor(lookAroundDistortion.y * this.prefs.speed);

            this.element.css({
                top:  this.lookAroundDistortion.y + 'px',
                left: (this.x + this.lookAroundDistortion.x) + 'px'
            });
        }
    }
}