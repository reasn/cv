"use strict";

/**
 * @since 2013-11-24
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

ACV.Game.TriggerManager = function(triggers)
{
    this.triggers = triggers;
  /*  this.triggers.sort(function(a, b) {
    	if(a.comparison === '<' && b.comparison === '>')
    		return -1;
    	if(a.comparison === '>' && b.comparison === '<')
    		return 1;
    	return b.value - a.value;
    });
    console.log(this.triggers);*/
};
ACV.Game.TriggerManager.prototype = ACV.Core.createPrototype('ACV.Game.TriggerManager',
{
    scene: null,
    triggers: [],
    lastPlayerX: 0
});

ACV.Game.TriggerManager.createFromData = function(triggerData, performanceSettings)
{
    var triggers = [];
    for (var i in triggerData)
    {
        triggers.push(new ACV.Game.Trigger.createFromData(triggerData[i], performanceSettings));
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
            this._execute(t);
    }
    this.lastPlayerX = playerX;
};

ACV.Game.TriggerManager.prototype._execute = function(trigger)
{
	var args = trigger.data ? trigger.data.split('|') : null;
	
    switch(trigger.type)
    {
        case 'player.setAge':
            return this.scene.foreground.player.setAge(args[0]);
        case 'player.jump':
            return this.scene.foreground.player.jump();
        case 'scene.zoom':
        	return this.scene.startZoom(args[0], parseInt(args[1]));
        default:
            return this.log('unknown trigger "' + trigger.type + '"');
    }
};
