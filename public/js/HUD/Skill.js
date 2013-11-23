"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.HUD = ACV.HUD ? ACV.HUD : new Object();

ACV.HUD.Skill = function(type)
{
    this.type = type;
};
ACV.HUD.Skill.levels = ['unknown', 'beginner', 'intermediate', 'expert', 'master'];
ACV.HUD.Skill.prototype = ACV.Core.createPrototype('ACV.HUD.Skill',
{
    type: '',
    level: 'unknown'
});

ACV.HUD.Skill.prototype.init = function(basketElement)
{
    this.element = $('<li class="' + this.level + '">' + this.type + '</li>');
    basketElement.append(this.element);

    this.log('Skill initialized', 'd');
};
ACV.HUD.Skill.prototype.improve = function()
{
    //Increment level
    var nextLevel = ACV.HUD.Skill.levels[ACV.HUD.Skill.levels.indexOf(this.level) + 1];

    if ( typeof (nextLevel) === 'undefined')
        this.log('Tried to increase skill ' + this.type + ' that already was at master level.', 'e');

    //Update element
    this.element.removeClass(this.level).addClass(nextLevel);

    //Save level
    this.level = nextLevel;

    this.log('Skill ' + this.type + ' improved to ' + this.level);
};
