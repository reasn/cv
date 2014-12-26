/// <reference path="../Core/AbstractObject"/>

module ACV.HUD {
    /**
     * @since 2013-11-19
     */
    export class Skill extends ACV.Core.AbstractObject {

        static levels: string[] = ['unknown', 'beginner', 'intermediate', 'expert', 'master'];

        type = '';
        level = 'unknown';
        private element: JQuery;

        constructor(type) {
            super('ACV.HUD.Skill');
            this.type = type;
        }

        init(basketElement) {
            this.element = $('<li class="' + this.level + '">' + this.type + '</li>');
            basketElement.append(this.element);

            this.debug('Skill initialized');
        }

        improve() {
            //Increment level
            var nextLevel = Skill.levels[Skill.levels.indexOf(this.level) + 1];

            if (typeof (nextLevel) === 'undefined')
                this.error('Tried to increase skill %s that already was at master level.', this.type);

            //Update element
            this.element.removeClass(this.level).addClass(nextLevel);

            //Save level
            this.level = nextLevel;

            this.info('Skill %s improved to %s', this.type, this.level);
        }
    }
}
