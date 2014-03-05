var animations = {
    levelDependent: [
        {
            name: "sunrise",
            granularity: 500,
            action: function () {

                var sky = $('#02-sky');
                var target = Math.min(1, Math.max(0, this.levelX / (this.level.prefs.clip.x2 * .75)));
                var duration = this.firstInvocation ? 0 : ACV.Utils.calculateAnimationDuration(sky.css('opacity'), target, 0.0002);

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
        }
    ]
};