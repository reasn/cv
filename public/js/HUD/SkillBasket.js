"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.HUD = ACV.HUD ? ACV.HUD : new Object();

ACV.HUD.SkillBasket = function(skills)
{
    this.skills = skills;
};
ACV.HUD.SkillBasket.createFromData = function(data, performanceSettings)
{

    var skills = [];
    for (var i in data.skills)
    {
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

ACV.HUD.SkillBasket.prototype.init = function(hudElement)
{
    this.element = $('<ul class="skill-basket" />');

    for (var i in this.skills)
    {
        this.skills[i].init(this.element);
    }
    hudElement.append(this.element);

    this.log('Skill basket initialized', 'd');
};
ACV.HUD.SkillBasket.prototype.improve = function(skillType)
{
    for (var i in this.skills)
    {
        if (this.skills[i].type === skillType)
        {
            this.skills[i].improve();
            return;
        }
    }
};

ACV.HUD.SkillBasket.prototype.getPowerupAnimationTarget = function()
{
    return (
        {
            left: this.element.position().left + .5 * this.element.width(),
            bottom: this.hud.height - 50
        });
};
