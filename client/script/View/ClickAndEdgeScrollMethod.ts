module ACV.View {

    /**
     * @since 2014-03-26
     */
    export class ClickAndEdgeScrollMethod extends ACV.Core.AbstractObject implements ScrollMethod {
        private clickAnimationSocket: JQuery = null;
        private viewportManager: ViewportManager;
        private scrollableDistance: number;

        constructor(viewportManager: ViewportManager, scrollableDistance: number) {
            super('ACV.View.ClickAndEdgeScrollMethod');
            this.viewportManager = viewportManager;
            this.scrollableDistance = scrollableDistance;
        }


        init(containerDistanceFromTop) {

            var a = 0.3,
                b = 0.5,
                c = 10,
                d = 0.2;
            this.viewportManager.listenToMouseClick((clientX, clientY, viewportDimensions)=> {

                var w = viewportDimensions.width,
                    offset = this.viewportManager.currentScrollOffset;

                if (clientX < w * a) {
                    offset -= a * w - clientX;
                } else if (clientX > w * (1 - b)) {
                    offset += clientX - (w * (1 - b));
                } else {
                    return;
                }
                this.scrollToClickTarget(offset);
            });
            this.viewportManager.listenToMouseMove((clientX, clientY, viewportDimensions)=> {
                var w = viewportDimensions.width,
                    offset = this.viewportManager.currentScrollOffset;
                if (clientX < c) {
                    offset -= d * w;
                } else if (clientX > w - c) {
                    offset += d * w;
                } else {
                    return;
                }
                this.scrollToClickTarget(offset);
            });
        }

        isGameActive() {
            return true;
        }


        handleFixation(staticContainer) {
        }

        private scrollToClickTarget(targetOffset) {

            var vpm = this.viewportManager;
            var duration = ACV.Utils.calculateAnimationDuration(vpm.currentScrollOffset, targetOffset, 1);

            if (this.clickAnimationSocket === null) {
                this.clickAnimationSocket = $('span');
            }
            this.clickAnimationSocket.stop().css('width', vpm.currentScrollOffset).animate({
                    width: targetOffset
                }, {
                    duration: duration,
                    easing:   'easeInOutQuad',
                    step:     function (now) {
                        vpm.handleScroll(now);
                    }
                }
            );
        }
    }
}