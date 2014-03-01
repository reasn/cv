"use strict";

/**
 * @since 2013-11-24
 */
var ACV = ACV ? ACV : new Object();

ACV.Game = ACV.Game ? ACV.Game : new Object();

ACV.Game.TriggerManager = function (triggers) {
    this.triggers = triggers;
    /*  this.triggers.sort(function(a, b) {
     if(a.comparison === '<' && b.comparison === '>')
     return -1;
     if(a.comparison === '>' && b.comparison === '<')
     return 1;
     return b.value - a.value;
     });
     this.debug(this.triggers);*/
};
ACV.Game.TriggerManager.prototype = ACV.Core.createPrototype('ACV.Game.TriggerManager',
    {
        scene: null,
        triggers: [],
        lastPlayerX: 0
    });

ACV.Game.TriggerManager.createFromData = function (triggerData, performanceSettings) {
    var triggers = [];
    for (var i in triggerData) {
        triggers.push(new ACV.Game.Trigger.createFromData(triggerData[i], performanceSettings));
    }
    return new ACV.Game.TriggerManager(triggers);
};

ACV.Game.TriggerManager.prototype.check = function (playerX, sceneX) {
    var t;
    for (var i in this.triggers) {
        t = this.triggers[i];
        if ((t.comparison === '>' && this.lastPlayerX < t.value && playerX > t.value) || (t.comparison === '<' && this.lastPlayerX > t.value && playerX < t.value))
            this._execute(t);
    }
    this.lastPlayerX = playerX;
};
/**
 * Testable via "testableApp.scene.triggerManager._execute({type: 'player.jumpUpAndDown', data: ''})".
 *
 * History:
 * 2014-03-01 Added player.jumpAndStay, sprite.show and sprite.hide
 * @param trigger
 * @returns {*}
 * @private
 * @version 2014-03-01
 * @since 2013-11-24
 * @author Alexander Thiel
 */
ACV.Game.TriggerManager.prototype._execute = function (trigger) {
    var args = trigger.data ? trigger.data.split('|') : null;

    switch (trigger.type) {
        case 'sprite.show':
            $('#' + args[0]).show();
            return;
        case 'sprite.hide':
            $('#' + args[0]).hide();
            return;
        case 'player.setAge':
            this.scene.playerLayer.player.setAge(args[0]);
            return;
        case 'player.jumpUpAndDown':
            this.scene.playerLayer.player.jumpUpAndDown();
            return;
        case 'player.jumpAndStay':
            this.scene.playerLayer.player.jumpAndStay(parseInt(args[0]));
            return;
        case 'scene.zoom':
            this.scene.startZoom(args[0], parseInt(args[1]));
            return;
        default:
            return this.error('Unknown trigger "%s"', trigger.type);
            return;
    }
};