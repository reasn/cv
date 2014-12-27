module ACV.Game {

    /**
     * @since 2013-11-24
     */
    export class Trigger extends ACV.Core.AbstractObject {


        static PATTERN = /([a-zA-Z\.]+)\(([^\)]+)\)/;

        private range: number[] = [0, 0];
        private before: string;
        private after: string;
        relativeTo: string = 'player';
        private currentlyInsideRange = false;
        private fireOnEnter = false;
        private stateBefore = true;
        private in = false;
        private wasIn = false;

        constructor(range: number[], before: string, after: string, relativeTo: string, fireOnEnter: boolean) {

            super('ACV.Game.Trigger');

            this.range = range;
            this.before = before ? before : null;
            this.after = after ? after : null;
            this.relativeTo = relativeTo;
            this.fireOnEnter = !!fireOnEnter;
        }

        static createFromData(data: ACV.Data.ITriggerData, performanceSettings: ACV.Data.IPerformanceSettings): Trigger {

            if (typeof data.playerX === 'number') {
                return new ACV.Game.Trigger([data.playerX, data.playerX], data.before, data.after, 'player', false);
            } else if (typeof data.playerX === 'object') {
                if (data.playerX.length !== 2 && data.playerX.length !== 3) {
                    throw 'A trigger\'s value declaration must be a number or an array consisting of two or three numbers. But is ' + JSON.stringify(data.playerX);
                }
                return new ACV.Game.Trigger(data.playerX, data.before, data.after, 'player', data.fireOnEnter);
            } else {
                throw 'Not implemented yet';
                //  return new ACV.Game.Trigger(data.playerX, data.before, data.after, 'level');
            }
        }

        /**
         *
         * @param {number} value
         * @param {number} lastValue
         * @param {number} targetValue This value is required for ranged trigger animations (e.g. jumps).
         * @returns {?ITriggerAction}
         */
        determineActionToBeExecuted(value: number, lastValue: number, targetValue: number): ITriggerAction {
            var a = this.range[0];
            var b = this.range[this.range.length - 1];
            var m = this.range.length === 3 ? this.range[1] : null;

            var inFromLeft = value > a && lastValue < a;
            var inFromRight = value < b && lastValue > b;
            var outToLeft = value < a && lastValue > a;
            var outToRight = value > b && lastValue < b;

            if (this.fireOnEnter) {
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

        private unpack(action: string): ITriggerAction {

            var matches = ACV.Game.Trigger.PATTERN.exec(action);
            if (matches.length < 2) {
                this.warn('Invalid trigger "%s".', action);
                return null;
            }
            return {
                action: matches[1],
                args:   matches[2].split(',')
            }

        }
    }
}