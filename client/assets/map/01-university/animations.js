var animations = [
    //{
    //    name: "sunrise",
    //    dependency: 'levelX',
    //    enabledRange: 'auto',
    //    granularity: 500,
    //    /** @type {function(this:ACV.Game.Animation)} */
    //    action: function () {
    //        var target, duration, sky = $('#layer-university-sky');
    //
    //        if (this.levelX < 0) {
    //            sky.stop('sunrise', true).css('opacity', 0);
    //            return;
    //        }
    //
    //        target = Math.min(1, Math.max(0, (this.levelX + this.viewportDimensions.width) / this.level.prefs.clip.x2));
    //        duration = ACV.Utils.calculateAnimationDuration(sky.css('opacity'), target, 0.0002);
    //
    //        sky.stop('sunrise', true).animate({
    //            opacity: target
    //        }, {
    //            queue: 'sunrise',
    //            duration: duration
    //        }).dequeue('sunrise');
    //
    //        $('#sprite-university-celestialBodies-sun').stop('sunrise', true).animate({
    //            top: Math.round(70 - target * 190) + '%'
    //        }, {
    //            queue: 'sunrise',
    //            easing: 'easeInOutQuad',
    //            duration: duration
    //        }).dequeue('sunrise');
    //    }
    //}
];