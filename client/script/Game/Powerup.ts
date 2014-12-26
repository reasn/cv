module ACV.Game {

    /**
     * @since 2013-11-19
     */
    export class PowerUp extends ACV.Core.AbstractObject {

        x:number = 0;
        y:number = 0;
        skillType:string = '';
        element:JQuery = null;

        constructor(x:number, y:number, skillType:string) {
            super('ACV.Game.PowerUp');

            this.x = x;
            this.y = y;
            this.skillType = skillType;
        }


        /**
         *
         * @param {jQuery} playerLayerElement
         */
        init(playerLayerElement) {
            this.element = $('<div class="powerUp" />');
            this.element.css(
                {
                    left:   this.x,
                    bottom: this.y
                });
            this.element.text(this.x);

            playerLayerElement.append(this.element);

            this.debug('PowerUp initialized');
        }
    }
}