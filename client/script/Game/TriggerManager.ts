module ACV.Game {

    /**
     * @since 2013-11-24
     */
    export class TriggerManager extends ACV.Core.AbstractObject {

        scene:ACV.Game.Scene = null;
        triggers:ACV.Game.Trigger[] = [];

        constructor(triggers:Trigger[]) {
            super('ACV.Game.TriggerManager');
            this.triggers = triggers;
            /*  this.triggers.sort(function(a, b) {
             if(a.comparison === '<' && b.comparison === '>')
             return -1;
             if(a.comparison === '>' && b.comparison === '<')
             return 1;
             return b.value - a.value;
             });
             this.debug(this.triggers);*/
        }

        static createFromData(triggerData, performanceSettings) {
            var triggerIndex, triggers = [];

            for (triggerIndex in triggerData) {
                triggers.push(ACV.Game.Trigger.createFromData(triggerData[triggerIndex], performanceSettings));
            }
            return new ACV.Game.TriggerManager(triggers);
        }

        /**
         *
         * @param {number} playerX
         * @param {number} playerXBefore
         * @param {number} targetPlayerX
         * @param {number} sceneX
         */
        check(playerX, playerXBefore, targetPlayerX, sceneX) {
            var triggerIndex, trigger, action;

            //this.debug('PlayerX always: %s    %s', playerX, playerXBefore);
            for (triggerIndex in this.triggers) {
                trigger = this.triggers[triggerIndex];

                if (trigger.relativeTo === 'player') {
                    action = trigger.determineActionToBeExecuted(playerX, playerXBefore, targetPlayerX);
                }
                if (action !== null) {
                    this.execute(action);
                }
            }
        }

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
        private execute(action) {

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
        }
    }
}