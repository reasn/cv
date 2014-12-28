module ACV.Game {

    /**
     * @since 2013-11-19
     */
    export class PowerUp extends ACV.Core.AbstractObject {

        x: number;
        y: number;
        skillType: string;
        element: JQuery = null;
        collected = false;

        constructor(x: number, y: number, skillType: string) {
            super('ACV.Game.PowerUp');

            this.x = x;
            this.y = y;
            this.skillType = skillType;
        }


        /**
         *
         * @param {jQuery} playerLayerElement
         */
        init(playerLayerElement: JQuery) {
            this.element = $('<div class="powerUp" />');
            this.element.css(
                {
                    transform: 'translate(' + this.x + 'px, ' + -1 * this.y + 'px)',
                    //left:   this.x,
                    bottom:    0//this.y
                });
            this.element.html(this.skillType + '<br />' + this.x);

            playerLayerElement.append(this.element);

            this.debug('PowerUp initialized');
        }
    }
}