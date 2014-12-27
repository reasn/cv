module ACV.Game {

    export interface ISpriteCallback {
        (maxLookAroundDistortion: number,
         viewportHeight: number,
         sprites: {[key:string]:{top: number; bottom: number}}):number;
    }

    /**
     * @since 2013-11-03
     */
    export class Sprite extends ACV.Core.AbstractObject {

        /**
         * Somehow the code gets immediately executed upon creation (therefore the initial if condition).
         * @todo find out why, fix if possible
         * @type {string}
         */
        static CODE_WRAPPER = "if(sprites === undefined) return; try { return %expression; } catch(e) { ACV.Core.Log.warn('ACV.Game.Sprite', 'Error code of dynamic sprite expression %handle.%property (\"%expression\").'); throw e; }";

        static mockColors = ['#9932CC', '#8B0000', '#E9967A', '#8FBC8F', '#483D8B', '#2F4F4F', '#00CED1', '#9400D3', '#FF1493', '#00BFFF', '#696969', '#1E90FF', '#B22222', '#FFFAF0', '#228B22', '#FF00FF', '#DCDCDC', '#F8F8FF', '#FFD700', '#DAA520', '#808080', '#008000', '#ADFF2F', '#F0FFF0', '#FF69B4'];
        static mockColorIndex = 0;

        y: any = 0;
        topAligned: boolean;
        handle: string;
        element: JQuery;
        height: any = 0;

        private appContext: ACV.AppContext;
        private id: string = null;
        private x: number = 0;
        private width: number = 0;
        private source: string = null;
        private color: string = null;
        private blurred = false;

        constructor(appContext: ACV.AppContext,
                    id: string,
                    handle: string,
                    x: number,
                    y: any,
                    width: number,
                    height: number,
                    topAligned: boolean,
                    source: string,
                    color: string,
                    blurred: boolean) {

            super('ACV.Game.Sprite');

            if (typeof handle !== 'string' || handle.length === 0) {
                throw new Error('Handle must be string of positive length.');
            }

            this.appContext = appContext;
            this.id = id;
            this.handle = handle;
            this.x = x;
            this.y = y;
            this.topAligned = topAligned;
            this.width = width;
            this.height = height;
            this.source = source;
            this.color = color;
            this.blurred = blurred;
        }


        static createFromPrefs(appContext: ACV.AppContext, data: any) {
            var y, height;

            y = Sprite.unpackDynamicExpression(appContext, data.y, data.handle, 'y');
            height = Sprite.unpackDynamicExpression(appContext, data.height, data.handle, 'height');

            return new Sprite(appContext, data.id, data.handle, data.x, y, data.width, height, data.topAligned, data.source, data.color, data.blurred);
        }

        /**
         * @returns {string|number|ISpriteCallback}
         */
        private static unpackDynamicExpression(appContext: ACV.AppContext,
                                               expression: string,
                                               spriteHandle: string,
                                               propertyName: string): any {
            var code: string,
                callback: Function;

            if (typeof expression !== 'string') {
                return expression;
            }

            //Reduces number of dynamic expressions
            expression = expression.replace(/maxLookAroundDistortion/g, appContext.prefs.maxLookAroundDistortion);
            expression = expression.replace(' ', '');

            if (expression.match(/[^0-9\%px\-\+]+/) === null) {
                /*
                 * Automatically calculate arithmetic expressions without external dependencies
                 * Allows optimization of expressions like "100 + maxLookAroundDistortion".
                 */
                if (expression.substr(1).indexOf('-') !== -1 || expression.indexOf('+') !== -1) {
                    callback = new Function('return ' + expression);
                    expression = callback();
                }
                return expression;
            }

            code = ACV.Game.Sprite.CODE_WRAPPER.replace(/\%expression/g, expression);
            code = code.replace(/\%handle/, spriteHandle);
            code = code.replace(/\%property/, propertyName);
            return new Function('maxLookAroundDistortion', 'viewportHeight', 'sprites', code);
        }

        init(layerElement: JQuery) {
            this.element = $('<div class="sprite" data-handle="' + this.handle + '" />');
            if (this.id) {
                this.element.attr('id', this.id);
            }
            this.element.css({
                left:   this.x,
                //transform: 'translateX(' + this.x + 'px)',
                width:  this.width + 'px',
                height: this.height
            });

            //TODO implement combined asset files
            if (typeof (this.source) === 'string') {
                this.element.css('backgroundImage', 'url("' + this.appContext.prefs.assetPath + '/' + this.source + '")');
                this.element.addClass('image-background')
            } else if (typeof(this.color) === 'string') {
                this.element.addClass('colored').addClass(this.color);
            } else {
                this.element.css('backgroundColor', ACV.Game.Sprite.mockColors[ACV.Game.Sprite.mockColorIndex++]);
            }

            if (this.blurred) {
                this.element.addClass('blurred');
            }

            layerElement.append(this.element);

            this.debug('Sprite %s initialized', this.handle);
        }
    }
}