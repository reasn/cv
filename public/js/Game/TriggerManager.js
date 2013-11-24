"use strict";

/**
 * @since 2013-11-24
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

ACV.Game.TriggerManager = function(triggers)
{
    this.triggers = triggers;
};
ACV.Game.TriggerManager.prototype = ACV.Core.createPrototype('ACV.Game.TriggerManager',
{
    scene: null,
    triggers: [],
    lastPlayerX: 0
});

ACV.Game.TriggerManager.createFromData = function(triggerData)
{
    var triggers = [];
    for (var i in triggerData)
    {
        triggers.push(new ACV.Game.Trigger.createFromData(triggerData[i]));
    }
    return new ACV.Game.TriggerManager(triggers);
};

ACV.Game.TriggerManager.prototype.check = function(playerX, sceneX)
{
    var t;
    for (var i in this.triggers)
    {
        t = this.triggers[i];
        if ((t.comparison === '>' && this.lastPlayerX < t.value && playerX > t.value) || (t.comparison === '<' && this.lastPlayerX > t.value && playerX < t.value))
            this.execute(t);
    }
    this.lastPlayerX = playerX;
};

ACV.Game.TriggerManager.prototype.execute = function(trigger)
{
    switch(trigger.type)
    {
        case 'player.setAge':
            return this.scene.foreground.player.setAge(trigger.data);
        case 'player.jump':
            return this.scene.foreground.player.jump();
        default:
            return this.log('unknown trigger "' + trigger.type + '"');
    }
};
