module ACV.View {

    /**
     * @since 2014-03-26
     */
    export class NativeScrollMethod extends ACV.Core.AbstractObject implements ScrollMethod {


        viewportManager: ViewportManager;
        scrollableDistance: number;
        containerFixedToViewport = false;
        containerDistanceFromTop = 0;

        constructor(viewportManager: ViewportManager, scrollableDistance: number) {
            super('ACV.View.NativeScrollMethod');
            this.viewportManager = viewportManager;
            this.scrollableDistance = scrollableDistance;
        }

        init(containerDistanceFromTop: number) {
            this.containerDistanceFromTop = containerDistanceFromTop;


            $('body').css('height', this.scrollableDistance + 'px');
            $(document).on('scroll', () => {
                this.viewportManager.handleScroll($(document).scrollTop() - containerDistanceFromTop);
            });
        }

        isGameActive() {
            return this.containerFixedToViewport;
        }

        handleFixation(staticContainer: JQuery) {

            //Automatically start and stop to play when container touches top of the viewport

            var topScrollOffset = $(window).scrollTop();

            if (!this.containerFixedToViewport && topScrollOffset > this.containerDistanceFromTop) {
                this.debug('Fixing game container to viewport %s %s', topScrollOffset, this.containerDistanceFromTop);
                this.containerFixedToViewport = true;
                staticContainer.addClass('fixed');

            } else if (this.containerFixedToViewport && topScrollOffset < this.containerDistanceFromTop) {
                this.debug('Defixing game container from viewport %s %s', topScrollOffset, this.containerDistanceFromTop);
                this.containerFixedToViewport = false;
                staticContainer.removeClass('fixed');
                this.viewportManager.updateDimensions();
            }
        }
    }
}