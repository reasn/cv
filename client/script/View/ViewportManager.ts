module ACV.View {

    /**
     * @since 2013-11-03
     */
    export class ViewportManager extends ACV.Core.AbstractObject {

        static SCROLL_CLICK_AND_EDGE = 0x01;
        static SCROLL_NATIVE = 0x02;
        static SCROLL_WHEEL = 0x03;

        private staticContainer: JQuery;
        private scrollableDistance: number;
        currentScrollOffset: number = 0;
        private scrollListeners: IViewportScrollListener[] = [];
        private clickListeners: IViewportMouseClickListener[] = [];
        private moveListeners: IViewportMouseMoveListener[] = [];
        private dimensions: IViewportDimensions = {

            width:         0,
            height:        0,
            widthChanged:  false,
            heightChanged: false
        };
        private lastViewportDimensions: { width: number; height: number } = {
            width:  0,
            height: 0
        };
        private moveMethod: number = -1;
        private touch: { virtualPosition: number; lastY: number } = {
            virtualPosition: 0,
            lastY:           null
        };
        private scrollMethod: IScrollMethod = null;

        private containerDistanceFromTop: number;

        private lastRatio: number;

        constructor( staticContainer: JQuery, scrollableDistance: number, moveMethod: number ) {
            super('ACV.ViewportManager');
            this.staticContainer = staticContainer;
            this.scrollableDistance = scrollableDistance;
            this.moveMethod = moveMethod;
        }

        init() {
            var w = $(window),
                body = $('body');

            this.containerDistanceFromTop = this.staticContainer.position().top;

            if (this.moveMethod === ViewportManager.SCROLL_CLICK_AND_EDGE) {
                this.scrollMethod = new ClickAndEdgeScrollMethod(this, this.scrollableDistance);

            } else if (this.moveMethod === ViewportManager.SCROLL_NATIVE) {
                this.scrollMethod = new NativeScrollMethod(this, this.scrollableDistance);

            } else if (this.moveMethod === ViewportManager.SCROLL_WHEEL) {
                this.scrollMethod = new WheelScrollMethod(this, this.scrollableDistance);

            } else {
                throw new Error('Unknown movement method "' + this.moveMethod + '".');
            }

            this.scrollMethod.init(this.containerDistanceFromTop);

            w.on('resize', () => {
                this.handleResize();
                this.fire();
            });

            w.on('mousemove', ( event: JQueryEventObject ) => {
                var listenerIndex: any;
                for (listenerIndex in this.moveListeners) {
                    this.moveListeners[listenerIndex](event.clientX, event.clientY, this.dimensions);
                }
            });

            w.on('click', ( event: JQueryEventObject )=> {
                var listenerIndex: any;
                for (listenerIndex in this.clickListeners) {
                    this.clickListeners[listenerIndex](event.clientX, event.clientY, this.dimensions);
                }
            });

            this.dimensions.width = w.width();
            this.dimensions.height = w.height();

            this.info('ViewportManager initialized');
        }

        start() {
            this.debug('Scroll to top and firing all triggers');
            $(window).scrollTop(0);
            this.handleResize();
            this.fire();
        }

        handleScroll( newOffset: number ) {
            this.currentScrollOffset = Math.min(this.scrollableDistance, newOffset);
            this.dimensions.widthChanged = false;
            this.dimensions.heightChanged = false;
            this.scrollMethod.handleFixation(this.staticContainer);
            if (this.scrollMethod.isGameActive()) {
                this.fire();
            }
        }

        /**
         * Note: _dimensions is never changed, only its properties are being set. That allows the entire
         * application to keep references to it.
         *
         */
        private handleResize() {

            this.updateDimensions();
            this.scrollMethod.handleFixation(this.staticContainer);
        }

        updateDimensions() {

            this.staticContainer.css('height', $(window).height());

            this.dimensions.width = this.staticContainer.width();
            this.dimensions.height = this.staticContainer.height();

            this.dimensions.widthChanged = this.dimensions.width !== this.lastViewportDimensions.width;
            this.dimensions.heightChanged = this.dimensions.height !== this.lastViewportDimensions.height;

            if (this.dimensions.widthChanged) {
                this.debug('viewport width changed from %s to %s', this.lastViewportDimensions.width, this.dimensions.width);
            }
            if (this.dimensions.heightChanged) {
                this.debug('viewport height changed from %s to %s', this.lastViewportDimensions.height, this.dimensions.height);
            }

            this.lastViewportDimensions.width = this.dimensions.width;
            this.lastViewportDimensions.height = this.dimensions.height;

            $('#viewportDimensions').text(this.lastViewportDimensions.width + ' x ' + this.lastViewportDimensions.height);
        }

        private fire() {
            var ratioBefore: number, listenerIndex: any;

            ratioBefore = this.lastRatio;
            this.lastRatio = Math.max(0, Math.min(1, this.currentScrollOffset / Math.max(0, this.scrollableDistance - this.dimensions.height)));

            for (listenerIndex in this.scrollListeners) {
                this.scrollListeners[listenerIndex].call(window, this.lastRatio, ratioBefore, this.dimensions);
            }
        }


        listenToScroll( callback: IViewportScrollListener ) {
            this.scrollListeners.push(callback);
        }

        listenToMouseClick( callback: IViewportMouseClickListener ) {
            this.clickListeners.push(callback);
        }

        listenToMouseMove( callback: IViewportMouseMoveListener ) {
            this.moveListeners.push(callback);
        }

        /**
         * @since 2014-03-25
         */
        getDimensions(): IViewportDimensions {
            return this.dimensions;
        }
    }
}
