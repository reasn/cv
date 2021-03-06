module ACV.View {

    /**
     * @since 2014-03-26
     */

    export class WheelScrollMethod extends ACV.Core.AbstractObject implements IScrollMethod {


        private viewportManager: ViewportManager;
        private scrollableDistance: number;
        private containerFixedToViewport = false;
        private containerDistanceFromTop = 0;
        private offset = 0;

        constructor(viewportManager: ViewportManager, scrollableDistance: number) {
            super('ACV.View.WheelScrollMethod');
            this.viewportManager = viewportManager;
            this.scrollableDistance = scrollableDistance;
        }

        init(containerDistanceFromTop: number) {

            this.containerDistanceFromTop = containerDistanceFromTop;

            $('body').on('mousewheel DOMMouseScroll', (event: JQueryMouseEventObject) => {
                var originalEvent: any = event.originalEvent,
                    delta = originalEvent.deltaY !== undefined ? originalEvent.deltaY : originalEvent.detail * 30;
                this.offset = Math.min(this.scrollableDistance, Math.max(0, this.offset + delta));
                this.viewportManager.handleScroll(this.offset - this.containerDistanceFromTop);
            });
        }

        isGameActive() {
            return this.containerFixedToViewport;
        }

        handleFixation(staticContainer: JQuery) {

//Automatically start and stop to play when container touches top of the viewport

            var topScrollOffset = $(window).scrollTop();

            //this.debug('%s %s', this.offset, this.containerDistanceFromTop);

            if (!this.containerFixedToViewport && topScrollOffset > this.containerDistanceFromTop) {
                this.debug('Fixing game container to viewport %s %s', topScrollOffset, this.containerDistanceFromTop);
                this.containerFixedToViewport = true;
                staticContainer.addClass('fixed');
                //this.offset = 1;

            } else if (this.containerFixedToViewport && this.offset < this.containerDistanceFromTop) {
                this.debug('Defixing game container from viewport %s %s', topScrollOffset, this.containerDistanceFromTop);
                this.containerFixedToViewport = false;
                staticContainer.removeClass('fixed');
                this.viewportManager.updateDimensions();
                $(window).scrollTop(this.containerDistanceFromTop - 1);
            }
        }
    }
}