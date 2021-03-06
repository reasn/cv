module ACV.Game {

    /**
     * @since 2013-11-24
     */
    export class Trigger extends ACV.Core.AbstractObject {


        static PATTERN = /([a-zA-Z\.]+)\(([^\)]*)\)/;

        private range: number[] = [0, 0];
        private before: string[];
        private after: string[];
        referenceFrame: TriggerReferenceFrame;
        private fireOnEnter = false;
        private stateBefore = true;
        private in = false;
        private wasIn = false;

        constructor( range: number[], before: string[], after: string[], relativeTo: TriggerReferenceFrame, fireOnEnter: boolean ) {

            super('ACV.Game.Trigger');

            this.range = range;
            this.before = before ? before : null;
            this.after = after ? after : null;
            this.referenceFrame = relativeTo;
            this.fireOnEnter = !!fireOnEnter;
        }

        static createFromData( data: ACV.Data.ITriggerData, performanceSettings: ACV.Data.IPerformanceSettings ): Trigger {

            var referenceValue: any,
                referenceFrame: TriggerReferenceFrame;

            if (data.playerX !== undefined) {
                referenceValue = data.playerX;
                referenceFrame = TriggerReferenceFrame.PLAYER;

            } else if (data.levelX !== undefined) {
                referenceValue = data.levelX;
                referenceFrame = TriggerReferenceFrame.LEVEL;

            } else {
                throw 'Not implemented yet';
                //  return new ACV.Game.Trigger(data.playerX, data.before, data.after, 'level');
            }

            if (typeof referenceValue === 'number') {
                return new Trigger([referenceValue, referenceValue], data.before, data.after, referenceFrame, false);

            } else if (typeof referenceValue === 'object') {
                if (referenceValue.length !== 2 && referenceValue.length !== 3) {
                    throw 'A trigger\'s reference value declaration (e.g. playerX) must be a number or an array consisting of two or three numbers. But is ' + JSON.stringify(referenceValue);
                }
                return new Trigger(referenceValue, data.before, data.after, referenceFrame, data.fireOnEnter);
            }
        }

        /**
         *
         * @param {number} value E.g. playerX
         * @param {number} lastValue
         * @param {number} targetValue This value is required for ranged trigger animations (e.g. jumps).
         * @returns {ITriggerAction[]}
         */
        determineActionsToBeExecuted( value: number, lastValue: number, targetValue: number ): ITriggerAction[] {
            var a = this.range[0];
            var b = this.range[this.range.length - 1];
            var m = this.range.length === 3 ? this.range[1] : null;

            var inFromLeft = value >= a && lastValue < a;
            var inFromRight = value <= b && lastValue > b;
            var outToLeft = value < a && lastValue >= a;
            var outToRight = value > b && lastValue <= b;

            if (this.fireOnEnter) {
                if (!targetValue) {
                    this.warn('Trigger can only use fireOnEnter if a targetValue is present');
                }
                /*
                 * These triggers can take into account targetValue to decide whether and which action
                 * should be taken. For that variable m is required. It allows to check in which state
                 * (before or after) the trigger should be and what action should be triggered.
                 */
                this.in = (this.wasIn || inFromLeft || inFromRight) && !(outToRight || outToLeft);
                this.wasIn = this.in;

                if (targetValue > b || (m !== null && targetValue > m)) {
                    if (inFromLeft || (this.in && this.stateBefore)) {
                        this.stateBefore = false;
                        return this.unpack(this.after);
                    }
                } else if (targetValue < a || (m !== null && targetValue < m)) {
                    if (inFromRight || (this.in && !this.stateBefore)) {
                        this.stateBefore = true;
                        return this.unpack(this.before);
                    }
                }
            } else {
                if (outToLeft && this.before !== null) {
                    return this.unpack(this.before);
                }
                if (outToRight && this.after !== null) {
                    return this.unpack(this.after);
                }
            }
            return null;
        }

        private unpack( actions: string[] ): ITriggerAction[] {

            var index: any,
                unpackedActions: ITriggerAction[] = [],
                matches: string[],
                args: string[],
                argIndex: any;
            for (index in actions) {

                matches = Trigger.PATTERN.exec(actions[index]);
                if (matches.length < 2) {
                    this.warn('Invalid trigger "%s".', actions);
                    return null;
                }
                args = matches[2].split(',');
                for (argIndex in args) {
                    args[argIndex] = args[argIndex].trim();
                }
                unpackedActions.push({
                    action: matches[1],
                    args:   args
                });
            }
            return unpackedActions

        }
    }
}