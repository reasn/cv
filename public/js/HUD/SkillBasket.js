"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};

ACV.HUD.SkillBasket = function (skills) {
    this.skills = skills;
};
ACV.HUD.SkillBasket.createFromData = function (data, performanceSettings) {

    var skills = [];
    for (var i in data.skills) {
        skills.push(new ACV.HUD.Skill(data.skills[i]));
    }
    return new ACV.HUD.SkillBasket(skills);
};
ACV.HUD.SkillBasket.prototype = ACV.Core.createPrototype('ACV.HUD.SkillBasket',
    {
        hud: null,
        element: null,
        skills: []
    });

ACV.HUD.SkillBasket.prototype.init = function (hudElement) {
    this.element = $('<ul class="skill-basket" />');

    for (var i in this.skills) {
        this.skills[i].init(this.element);
    }
    hudElement.append(this.element);

    this.info('Skill basket initialized', 'd');
};


/**
 *
 * @param {ACV.Game.PowerUp} powerUp
 * @param {number} sceneX
 * @param {ViewportDimensions} viewportDimensions
 */
ACV.HUD.SkillBasket.prototype.collectPowerUp = function (powerUp, sceneX, viewportDimensions) {
    var skillBasket = this;
    var position = powerUp.element.position();

    //Remove element from scene, adjust CSS and add it to HUD to have it fly towards this skill basket
    powerUp.element.remove().css({

        left: position.left - sceneX,
        bottom: viewportDimensions.height - position.top
    }).appendTo(this.element.parent());

    powerUp.element.animate({
        bottom: [viewportDimensions.height - position.top + 100, 'easeOutQuad']
    }, {
        duration: 200,
        complete: function () {
            var targetPosition = skillBasket.getPowerUpAnimationTarget();
            powerUp.element.animate(
                {
                    left: [targetPosition.left, 'easeInQuad'],
                    bottom: [targetPosition.bottom, 'easeInQuad']
                },
                {
                    duration: 800,
                    complete: function () {
                        skillBasket._improve(powerUp.skillType);
                        powerUp.element.remove();
                    }
                });
        }
    });
};

ACV.HUD.SkillBasket.prototype._improve = function (skillType) {
    for (var i in this.skills) {
        if (this.skills[i].type === skillType) {
            this.skills[i].improve();
            return;
        }
    }
};

ACV.HUD.SkillBasket.prototype.getPowerUpAnimationTarget = function () {
    return ({
        left: this.element.position().left + .5 * this.element.width(),
        bottom: this.hud.height - 50
    });
};
