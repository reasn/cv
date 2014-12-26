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
        triggers: []
    });

ACV.Game.TriggerManager.createFromData = function (triggerData, performanceSettings) {
    var triggerIndex, triggers = [];

    for (triggerIndex in triggerData) {
        triggers.push(new ACV.Game.Trigger.createFromData(triggerData[triggerIndex], performanceSettings));
    }
    return new ACV.Game.TriggerManager(triggers);
};
/**
 *
 * @param {number} playerX
 * @param {number} playerXBefore
 * @param {number} targetPlayerX
 * @param {number} sceneX
 */
ACV.Game.TriggerManager.prototype.check = function (playerX, playerXBefore, targetPlayerX, sceneX) {
    var triggerIndex, trigger, action;

    //this.debug('PlayerX always: %s    %s', playerX, playerXBefore);
    for (triggerIndex in this.triggers) {
        trigger = this.triggers[triggerIndex];

        if (trigger.relativeTo === 'player') {
            action = trigger.determineActionToBeExecuted(playerX, playerXBefore, targetPlayerX);
        }
        if (action !== null) {
            this._execute(action);
        }
    }
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
            //TODO make clean:
            $('div[data-handle="' + action.args[0].replace(/\./g, '"] div[data-handle="') + '"]').show();
            return;
        case 'sprite.hide':
            //TODO make clean:
            $('div[data-handle="' + action.args[0].replace(/\./g, '"] div[data-handle="') + '"]').hide();
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
        default:
            this.warn('Unknown trigger action:');
            this.warn(action);
            return;
    }
};