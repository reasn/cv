var animations = [
    {
        name: "sunrise",
        dependency: 'levelX',
        enabledRange: 'auto',
        granularity: 500,
        /** @type {function(this:ACV.Game.Animation)} */
        action: function () {

            var target, duration, sky = $('#02-sky');

            if (this.levelX < 0) {
                sky.stop('sunrise', true).css('opacity', 0);
                return;
            }

            target = Math.min(1, Math.max(0, this.levelX / (this.level.prefs.clip.x2 * .75)));
            duration = ACV.Utils.calculateAnimationDuration(sky.css('opacity'), target, 0.0002);

            sky.stop('sunrise', true).animate({
                opacity: target
            }, {
                queue: 'sunrise',
                duration: duration
            }).dequeue('sunrise');

            $('#02-sun').stop('sunrise', true).animate({
                top: Math.round(70 - target * 90) + '%'
            }, {
                queue: 'sunrise',
                easing: 'easeInOutQuad',
                duration: duration
            }).dequeue('sunrise');
        }
    },
    {
        name: "zoom",
        dependency: 'levelX',
        enabledRange: [-500, 'auto'],
        granularity: 500,
        elements: null,
        /** @type {function(this:ACV.Game.Animation)} */
        action: function () {

            if (this.levelX < 0) {
                this.level.zoomTo(1, 1000);
                return;
            }
            this.level.zoomTo(Math.min(1, Math.max(0.5, 1 - this.levelX / this.level.prefs.clip.x2 *.75)), 0.0002);
        }
    }
];