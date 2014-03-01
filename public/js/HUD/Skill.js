"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};

ACV.HUD.Skill = function (type) {
    this.type = type;
};
ACV.HUD.Skill.levels = ['unknown', 'beginner', 'intermediate', 'expert', 'master'];
ACV.HUD.Skill.prototype = ACV.Core.createPrototype('ACV.HUD.Skill',
    {
        type: '',
        level: 'unknown'
    });

ACV.HUD.Skill.prototype.init = function (basketElement) {
    this.element = $('<li class="' + this.level + '">' + this.type + '</li>');
    basketElement.append(this.element);

    this.debug('Skill initialized');
};
ACV.HUD.Skill.prototype.improve = function () {
    //Increment level
    var nextLevel = ACV.HUD.Skill.levels[ACV.HUD.Skill.levels.indexOf(this.level) + 1];

    if (typeof (nextLevel) === 'undefined')
        this.error('Tried to increase skill %s that already was at master level.', this.type);

    //Update element
    this.element.removeClass(this.level).addClass(nextLevel);

    //Save level
    this.level = nextLevel;

    this.info('Skill %s improved to %s', this.type, this.level);
};
