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

        constructor(skills: Skill[]) {
            super('ACV.HUD.SkillBasket');
            this.skills = skills;
        }

        static createFromData(data, performanceSettings) {

            var skills = [];
            for (var i in data.skills) {
                skills.push(new Skill(data.skills[i]));
            }
            return new SkillBasket(skills);
        }


        init(hudElement) {
            this.element = $('<ul class="skill-basket" />');

            for (var i in this.skills) {
                this.skills[i].init(this.element);
            }
            hudElement.append(this.element);

            this.info('Skill basket initialized', 'd');
        }


        collectPowerUp(powerUp: ACV.Game.PowerUp, sceneX: number, viewportDimensions: ACV.View.ViewportDimensions) {

            var position = powerUp.element.position();

            //Remove element from scene, adjust CSS and add it to HUD to have it fly towards this skill basket
            powerUp.element.remove().css({

                left:   position.left - sceneX,
                bottom: viewportDimensions.height - position.top
            }).prependTo(this.element.parent());

            powerUp.element.animate({
                bottom: [viewportDimensions.height - position.top + 100, 'easeOutQuad']
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
                                this.improve(powerUp.skillType);
                                powerUp.element.remove();
                            }
                        });
                }
            });
        }

        private improve(skillType) {
            for (var i in this.skills) {
                if (this.skills[i].type === skillType) {
                    this.skills[i].improve();
                    return;
                }
            }
        }

        getPowerUpAnimationTarget() {
            return ({
                left:   this.element.position().left + .5 * this.element.width(),
                bottom: this.hud.height - 50
            });
        }
    }
}