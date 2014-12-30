/// <reference path="../Core/AbstractObject"/>

module ACV.HUD {
    /**
     * @since 2013-11-19
     */
    export class Skill extends ACV.Core.AbstractObject {

        static levels: string[] = ['unknown', 'beginner', 'intermediate', 'expert'];

        type: string;
        private level = 'unknown';
        private element: JQuery;
        private appContext: ACV.AppContext;
        private isSoftSkill: boolean;

        constructor( appContext: ACV.AppContext, type: string ) {
            super('ACV.HUD.Skill');
            this.appContext = appContext;
            if (type.substr(0, 1) === '§') {
                this.isSoftSkill = true;
                type = type.substr(1);
            }
            this.type = type;
        }

        init( basketElement: JQuery ) {
            var mappedType = Skill.mapType(this.type),
                className = this.isSoftSkill ? 'soft' : mappedType;
            this.element = $('<li class="skill-' + className + ' ' + this.level + '">&nbsp;</li>');
            basketElement.append(this.element);

            this.element.on('click', ()=> {
                if (this.element.hasClass('selected')) {
                    this.element.removeClass('selected');
                    this.appContext.playerSpeechBubble.hide();
                } else {
                    this.element.parent().children('.selected').removeClass('selected');
                    this.element.addClass('selected');
                    this.appContext.playerSpeechBubble.show('skill.' + mappedType);
                }
            });

            this.debug('Skill initialized');
        }

        static mapType( skillType: string ) {
            return skillType.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        }

        improve() {
            //Increment level
            var nextLevel = Skill.levels[Skill.levels.indexOf(this.level) + 1];

            if (typeof (nextLevel) === 'undefined') {
                this.warn('Tried to increase skill %s that already was at expert level.', this.type);
                return;
            }

            //Update element
            this.element.removeClass(this.level).addClass(nextLevel);

            //Save level
            this.level = nextLevel;

            this.info('Skill %s improved to %s', this.type, this.level);
        }
    }
}
