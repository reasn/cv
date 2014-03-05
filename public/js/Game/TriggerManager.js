"use strict";

/**
 * @since 2013-11-24
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

/**
 * @type {{
 *   scene: ACV.Game.Scene
 *   triggers: Array.<ACV.Game.Trigger>
 *   lastPlayerX: number
 * }}
 * @param triggers
 * @constructor
 */
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
    var triggerIndex, triggers = [];

    for (triggerIndex in triggerData) {
        triggers.push(new ACV.Game.Trigger.createFromData(triggerData[triggerIndex], performanceSettings));
    }
    return new ACV.Game.TriggerManager(triggers);
};

ACV.Game.TriggerManager.prototype.check = function (playerX, sceneX) {
    var triggerIndex, trigger, action;

    //this.debug('PlayerX always: %s    %s', playerX, this.lastPlayerX);
    for (triggerIndex in this.triggers) {
        trigger = this.triggers[triggerIndex];

        if (trigger.relativeTo === 'player') {
            action = trigger.determineActionToBeExecuted(playerX, this.lastPlayerX);
        }
        if (action !== null)
            this._execute(action);
    }
    this.lastPlayerX = playerX;
};
/**
 * Testable via "testableApp.scene.triggerManager._execute({type: 'player.jumpUpAndDown', data: ''})".
 *
 * History:
 * 2014-03-01 Added player.jumpAndStay, sprite.show and sprite.hide
 * @param {Object} action
 * @returns {*}
 * @private
 * @version 2014-03-01
 * @since 2013-11-24
 * @author Alexander Thiel
 */
ACV.Game.TriggerManager.prototype._execute = function (action) {

    switch (action.action) {
        case 'sprite.show':
            $('#' + action.args[0]).show();
            return;
        case 'sprite.hide':
            $('#' + action.args[0]).hide();
            return;
        case 'player.setAge':
            this.scene.playerLayer.player.setAge(action.args[0]);
            return;
        case 'player.jumpUpAndDown':
            this.scene.playerLayer.player.jumpUpAndDown();
            return;
        case 'player.jumpAndStay':
            this.scene.playerLayer.player.jumpAndStay(parseInt(action.args[0]));
            return;
        case 'scene.zoom':
            this.scene.startZoom(action.args[0], parseInt(action.args[1]));
            return;
        default:
            this.warn('Unknown trigger action:');
            this.warn(action);
            return;
    }
};