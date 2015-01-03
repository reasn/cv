module ACV.Game {

    /**
     * @since 2013-11-24
     */
    export class TriggerManager extends ACV.Core.AbstractObject {

        scene: ACV.Game.Scene = null;
        private playerRelativeTriggers: ACV.Game.Trigger[] = [];
        private levelRelativeTriggers: ACV.Game.Trigger[] = [];

        constructor( playerRelativeTriggers: Trigger[], levelRelativeTriggers: Trigger[] ) {
            super('ACV.Game.TriggerManager');
            this.playerRelativeTriggers = playerRelativeTriggers;
            this.levelRelativeTriggers = levelRelativeTriggers;
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
                trigger: Trigger,
                playerRelativeTriggers: Trigger[] = [],
                levelRelativeTriggers: Trigger[] = [];

            for (triggerIndex in triggerData) {
                trigger = Trigger.createFromData(triggerData[triggerIndex], performanceSettings);
                if (trigger.referenceFrame === TriggerReferenceFrame.PLAYER) {
                    playerRelativeTriggers.push(trigger);
                } else if (trigger.referenceFrame === TriggerReferenceFrame.LEVEL) {
                    levelRelativeTriggers.push(trigger);
                }
            }
            return new TriggerManager(playerRelativeTriggers, levelRelativeTriggers);
        }

        checkPlayerRelativeTriggers( playerX: number, playerXBefore: number, targetPlayerX: number ) {
            var i: any,
                trigger: Trigger,
                actions: ITriggerAction[],
                actionIndex: any;

            for (i in this.playerRelativeTriggers) {
                trigger = this.playerRelativeTriggers[i];
                actions = trigger.determineActionsToBeExecuted(playerX, playerXBefore, targetPlayerX);
                for (actionIndex in actions) {
                    this.execute(actions[actionIndex]);
                }
            }
        }

        checkLevelRelativeTriggers( sceneX: number, sceneXBefore: number ) {
            var i: any,
                trigger: Trigger,
                actions: ITriggerAction[],
                actionIndex: any;

            for (i in this.levelRelativeTriggers) {
                trigger = this.levelRelativeTriggers[i];
                actions = trigger.determineActionsToBeExecuted(sceneX, sceneXBefore, null);
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

            this.debug('Executing "%s"', action.action);

            if (action.action.indexOf('sprite.') === 0) {
                this.executeSpriteTrigger(action);
                return;
            }
            switch (action.action) {

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

        private executeSpriteTrigger( action: ITriggerAction ): void {
            var sprite = $('#sprite-' + action.args[0]),
                classNameIndex: any,
                classNames: string[],
                argIndex: any;
            if (sprite.length === 0) {
                this.warn('Could not trigger "%s" action because no sprite with id "%s" was found.', action.action, 'sprite-' + action.args[0]);
                return;
            }
            switch (action.action) {
                case 'sprite.show':
                    sprite.show();
                    return;
                case 'sprite.hide':
                    sprite.hide();
                    return;

                case 'sprite.startAnimation':
                    sprite.addClass('animation-active');
                    return;

                case 'sprite.transition':
                    classNames = sprite.attr('class').split(' ');
                    for (classNameIndex in classNames) {
                        if (classNames[classNameIndex].indexOf('fx-') === 0) {
                            sprite.removeClass(classNames[classNameIndex]);
                        }
                    }
                    for (argIndex = 1; argIndex < action.args.length; argIndex++) {
                        sprite.addClass('fx-' + action.args[argIndex]);
                    }
                    return;

                default:
                    this.warn('Unknown trigger action:');
                    this.warn(action);
                    return;
            }
        }
    }
}