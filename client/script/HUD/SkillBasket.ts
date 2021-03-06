/// <reference path="../Core/AbstractObject"/>
/// <reference path="./HeadsUpDisplay"/>
/// <reference path="./Skill"/>

module ACV.HUD {

    /**
     * @since 2013-11-19
     */
    export class SkillBasket extends ACV.Core.AbstractObject {


        hud: ACV.HUD.HeadsUpDisplay = null;
        element: JQuery = null;
        skills: Skill[];
        private appContext: ACV.AppContext;
        private anySkillsImproved = false;
        private anySoftSkillImproved = false;

        constructor( skills: Skill[], appContext: ACV.AppContext ) {
            super('ACV.HUD.SkillBasket');
            this.skills = skills;
            this.appContext = appContext;
        }

        static createFromData( data: ACV.Data.ISkillBasketData, appContext: ACV.AppContext ) {

            var skills: Skill[] = [];
            for (var type in data.skills) {
                skills.push(new Skill(appContext, data.skills[type]));
            }
            return new SkillBasket(skills, appContext);
        }


        init( hudElement: JQuery ) {
            this.element = $('<ul class="skill-basket" />');

            for (var i in this.skills) {
                this.skills[i].init(this.element);
            }
            hudElement.append(this.element);

            this.info('Skill basket initialized', 'd');
        }

        collectPowerUp( powerUp: ACV.Game.PowerUp, sceneX: number, viewportDimensions: ACV.View.IViewportDimensions ) {

            //   var position = powerUp.element.position();

            //Remove element from scene, adjust CSS and add it to HUD to have it fly towards this skill basket
            powerUp.element.remove().css({
                transform: 'none',
                left:      powerUp.x - sceneX,
                bottom:    viewportDimensions.height - powerUp.y
                //transform: 'translate(' + (powerUp.x - sceneX) + 'px, ' + -1 * (viewportDimensions.height - powerUp.y) + 'px)',
            }).prependTo(this.element.parent());

            powerUp.element.animate({
                bottom: [viewportDimensions.height - powerUp.y + 100, 'easeOutQuad']
            }, {
                duration: 200,
                complete: ()=> {
                    var targetPosition = this.getPowerUpAnimationTarget();
                    powerUp.element.animate(
                        {
                            left:   [targetPosition.left, 'easeInQuad'],
                            bottom: [targetPosition.bottom, 'easeInQuad']
                        },
                        {
                            duration: 800,
                            complete: ()=> {
                                this.improve(powerUp.type);
                                powerUp.element.remove();
                            }
                        });
                }
            });
        }

        private improve( skillType: string ) {
            for (var i in this.skills) {
                if (this.skills[i].type === skillType) {
                    this.skills[i].improve();
                    if (!this.anySoftSkillImproved && this.skills[i].isSoftSkill) {
                        this.appContext.playerSpeechBubble.show('firstSoftSkill');
                        this.anySoftSkillImproved = true;
                    } else if (!this.anySkillsImproved) {
                        this.appContext.playerSpeechBubble.show('firstSkill');
                        this.anySkillsImproved = true;
                    }
                    return;
                }
            }
            this.warn('Tried to improve unregistered skill "%s".', skillType);
        }

        getPowerUpAnimationTarget(): {left: number; bottom: number} {
            return ({
                left:   this.element.position().left + .5 * this.element.width(),
                bottom: this.hud.height - 50
            });
        }
    }
}