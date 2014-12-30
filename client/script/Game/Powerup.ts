module ACV.Game {

    /**
     * @since 2013-11-19
     */
    export class PowerUp extends ACV.Core.AbstractObject {

        x: number;
        y: number;
        type: string;
        element: JQuery = null;
        collected = false;
        isSoftSkill = false;

        constructor( x: number, y: number, type: string ) {
            super('ACV.Game.PowerUp');

            this.x = x;
            this.y = y;
            if (type.substr(0, 1) === '§') {
                this.isSoftSkill = true;
                type = type.substr(1);
            }
            this.type = type;
        }


        /**
         *
         * @param {jQuery} playerLayerElement
         */
        init( playerLayerElement: JQuery ) {

            var className = this.isSoftSkill ? 'soft' : ACV.HUD.Skill.mapType(this.type);

            this.element = $('<div class="power-up skill-' + className + '" />');
            this.element.css('transform', 'translate(' + this.x + 'px, ' + -1 * this.y + 'px)');

            playerLayerElement.append(this.element);

            this.debug('PowerUp initialized');
        }
    }
}