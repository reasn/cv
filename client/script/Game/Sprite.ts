module ACV.Game {
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

        x: number;
        y: any;
        width: number;
        height: any;
        topAligned: boolean;
        handle: string;
        element: JQuery;

        private appContext: ACV.AppContext;
        private id: string;
        private source: string;
        private color: string;
        private patterned: boolean;
        private blur: number;
        private shadow: boolean;
        private fontSymbol: ACV.Data.ISpriteFontSymbol;


        constructor( appContext: ACV.AppContext,
                     id: string,
                     handle: string,
                     x: number,
                     y: any,
                     width: number,
                     height: number,
                     topAligned: boolean,
                     source: string,
                     color: string,
                     fontSymbol: ACV.Data.ISpriteFontSymbol,
                     patterned: boolean,
                     blur: number,
                     shadow: boolean ) {

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
            this.fontSymbol = fontSymbol;
            this.patterned = patterned;
            this.blur = blur;
            this.shadow = shadow;
        }

        static createFromPrefs( appContext: ACV.AppContext, data: ACV.Data.ISpriteData ) {
            var y: any,
                height: any;

            y = Sprite.unpackDynamicExpression(appContext, data.y, data.handle, 'y');
            height = Sprite.unpackDynamicExpression(appContext, data.height, data.handle, 'height');

            return new Sprite(appContext, data.id, data.handle, data.x, y, data.width, height, data.topAligned, data.source, data.color, data.fontSymbol, data.patterned, data.blur, data.shadow);
        }

        /**
         * @returns {string|number|ISpriteCallback}
         */
        private static unpackDynamicExpression( appContext: ACV.AppContext,
                                                expression: string,
                                                spriteHandle: string,
                                                propertyName: string ): any {
            var code: string,
                callback: Function;

            if (typeof expression !== 'string') {
                return expression;
            }

            //Reduces number of dynamic expressions
            expression = expression.replace(/maxLookAroundDistortion/g, '' + appContext.prefs.maxLookAroundDistortion);
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

            code = ACV.Game.Sprite.CODE_WRAPPER.replace(/%expression/g, expression);
            code = code.replace(/%handle/, spriteHandle);
            code = code.replace(/%property/, propertyName);
            return new Function('maxLookAroundDistortion', 'viewportHeight', 'sprites', code);
        }

        init( levelHandle: string, layerHandle: string, layerElement: JQuery ) {

            var id = 'sprite-' + levelHandle + '-' + layerHandle + '-' + this.handle,
                classes = ['sprite'];

            var cssProps: any = {
                transform: 'translateX(' + this.x + 'px)',
                width:     this.width + 'px'
            };

            if (this.topAligned) {
                cssProps.top = 0;
            } else {
                cssProps.bottom = 0;
            }

            this.element = $('<div id="' + id + '" />');

            //TODO implement combined asset files
            if (typeof (this.source) === 'string') {
                cssProps.backgroundImage = 'url("' + this.appContext.prefs.assetPath + '/' + this.source + '")';
                classes.push('image-background')
            } else if (this.fontSymbol) {
                classes.push('font-symbol');
                if (!this.fontSymbol.count || this.fontSymbol.count === 1) {
                    classes.push('flaticon-' + this.fontSymbol.name);
                } else {
                    for (var i = this.fontSymbol.count; i > 0; i--) {
                        this.element.append('<span class="flaticon-' + this.fontSymbol.name + '"/></span>');
                    }
                }
                cssProps.fontSize = this.fontSymbol.size;
                cssProps.letterSpacing = -.062 * this.fontSymbol.size;

                if (this.blur) {
                    classes.push('blurred');
                    cssProps.textShadow = '0 0 ' + this.blur + 'px ' + this.appContext.prefs.colors[this.color];
                }
            } else {
                if (this.blur) {
                    classes.push('blurred');
                    cssProps.boxShadow = '0 0 ' + this.blur + 'px ' + 2 * this.blur + 'px ' + this.appContext.prefs.colors[this.color];
                    cssProps.outline = '2px solid ' + this.appContext.prefs.colors[this.color];
                    cssProps.border = '2px solid ' + this.appContext.prefs.colors[this.color];
                } else if (this.patterned) {
                    classes.push('patterned');
                }
            }
            if (this.color) {
                classes.push(this.color);
            }
            if (this.shadow === false) {
                classes.push('no-shadow');
            }

            this.element.addClass(classes.join(' '));

            this.element.css(cssProps);


            layerElement.append(this.element);

            this.debug('Sprite %s initialized', this.handle);
        }
    }
}