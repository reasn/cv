module ACV.Game {

    /**
     * @since 2013-11-24
     */
    export class TriggerManager extends ACV.Core.AbstractObject {

        scene: ACV.Game.Scene = null;
        triggers: ACV.Game.Trigger[] = [];

        constructor( triggers: Trigger[] ) {
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

        static createFromData( triggerData: ACV.Data.ITriggerData[], performanceSettings: ACV.Data.IPerformanceSettings ) {
            var triggerIndex: any,
                triggers: Trigger[] = [];

            for (triggerIndex in triggerData) {
                triggers.push(Trigger.createFromData(triggerData[triggerIndex], performanceSettings));
            }
            return new TriggerManager(triggers);
        }

        check( playerX: number, playerXBefore: number, targetPlayerX: number, sceneX: number ) {
            var triggerIndex: any,
                trigger: Trigger,
                actions: ITriggerAction[],
                actionIndex: any;

            //this.debug('PlayerX always: %s    %s', playerX, playerXBefore);
            for (triggerIndex in this.triggers) {
                trigger = this.triggers[triggerIndex];

                if (trigger.referenceFrame === TriggerReferenceFrame.PLAYER) {
                    actions = trigger.determineActionsToBeExecuted(playerX, playerXBefore, targetPlayerX);
                }
                for (actionIndex in actions) {
                    this.execute(actions[actionIndex]);
                }
            }
        }

        /**
         * Testable via "testableApp.scene.triggerManager._execute({type: 'player.jumpUpAndDown', data: ''})".
         *
         * History:
         * 2014-03-01 Added player.jumpAndStay, sprite.show and sprite.hide
         * @version 2014-03-01
         * @since 2013-11-24
         * @author Alexander Thiel
         */
        private execute( action: ITriggerAction ): void {
            var sprite: JQuery;
            switch (action.action) {
                case 'sprite.show':
                case 'sprite.hide':
                    sprite = $('#sprite-' + action.args[0]);
                    if (sprite.length === 0) {
                        this.warn('Could not trigger "%s" action because no sprite with id "%s" was found.', action.action, 'sprite-' + action.args[0]);
                    }
                    if (action.action === 'sprite.show') {
                        sprite.show();
                    } else {
                        sprite.hide();
                    }
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
                case 'player.show':
                    this.scene.playerLayer.player.show();
                    return;
                case 'player.hide':
                    this.scene.playerLayer.player.hide();
                    return;
                case 'speechBubble.show':
                    this.scene.playerLayer.speechBubble.show(action.args[0]);
                    return;
                case 'speechBubble.hide':
                    this.scene.playerLayer.speechBubble.hide();
                    return;
                default:
                    this.warn('Unknown trigger action:');
                    this.warn(action);
                    return;
            }
        }
    }
}