var animations = [
    {
        name: "zoom",
        dependency: 'levelX',
        enabledRange: [-3000, 'auto'],
        granularity: 200,
        elements: null,
        /** @type {function(this:ACV.Game.Animation)} */
        action: function () {

            if (this.levelX < -2500) {
                this.level.zoomTo(0.5, 0);
                return;
            }

            this.level.zoomTo(Math.min(1, Math.max(0.5, 1.5 * this.levelX / 4000)), 0.0004);
        }
    }
];