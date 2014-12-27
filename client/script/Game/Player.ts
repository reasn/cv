module ACV.Game {

    export interface IPlayerMovementListener {
        (playerX: number,
         payerXBefore: number,
         targetPlayerX?: number,
         sceneX?: number,
         viewportDimensions?: ACV.View.ViewportDimensions): void;
    }
    /**
     * @since 2013-11-03
     */
    export class Player extends ACV.Core.AbstractObject {

        /* @since 2014-03-01 */
        static JUMP_DURATION = 200;
        static JUMP_DISTANCE = 100;

        prefs: ACV.Data.IPlayerPrefs;
        width: number = 0;

        private element: JQuery = null;
        private x: number = 0;
        private y: number;
        private height: number = 0;
        private lastCoarseX: number;
        private movementListeners: IPlayerMovementListener[] = [];
        private lastTriggeredX: number = 0;

        constructor(prefs: ACV.Data.IPlayerPrefs) {
            super('AVG.Game.Player');

            this.prefs = prefs;
            this.y = prefs.position.y;
        }

        /**
         *
         * @param {jQuery} playerLayerElement
         */
        init(playerLayerElement: JQuery) {

            this.debug('Initializing player');

            this.element = $('<div class="player" />');

            this.element.css('bottom', this.y);
            this.setAge(this.prefs.initialAge);
            playerLayerElement.append(this.element);
            this.debug('Player initialized');
        }

        addMovementListener(callback: IPlayerMovementListener) {
            this.movementListeners.push(callback)
        }

        /**
         * @since 2013-11-24
         */
        setAge(ageHandle: string) {
            this.width = this.prefs.ages[ageHandle].width;
            this.height = this.prefs.ages[ageHandle].height;
            this.element.css(
                {
                    width:  this.width,
                    height: this.height
                });
            this.element.removeClass(Object.keys(this.prefs.ages).join(' '));
            this.element.addClass('' + ageHandle);
            this.debug('Player\'s age set to %s.', ageHandle);
        }

        setPosition(x: number) {
            this.element.stop('walk', true);

            if (x > 0 || x < 0) {
                this.x = x;
                //this.element.css('transform', 'translateX(' + x + 'px)');
                this.element.css('left', x);
            }
        }

        /**
         * @since 2014-03-01
         */
        jumpAndStay(targetY: number) {
            this.debug('Jumping from %s to %s to stay there', this.y, targetY);
            this.jump(targetY);
        }

        /**
         * @since 2014-03-01
         */
        jumpUpAndDown() {
            this.debug('Jumping up and down (player.y = %s', this.y);
            this.jump(this.y);
        }


        /**
         *
         * History:
         * 2014-03-01 Now correctly puts the animation into a queue and cancels ongoing jumps before jumping.
         *
         * @param {number} targetY
         * @return void
         * @version 2014-03-01
         */
        private jump(targetY: number) {

            this.element.stop('jump', true).animate(
                {
                    bottom: [Player.JUMP_DISTANCE + Math.max(targetY, this.y), 'easeOutQuart']
                },
                {
                    queue:    'jump',
                    duration: Player.JUMP_DURATION,
                    complete: () => {

                        this.element.animate(
                            {
                                'bottom': [targetY, 'easeInQuart']
                            },
                            {
                                queue:    'jump',
                                duration: Player.JUMP_DURATION,
                                complete: () => {
                                    this.y = targetY;
                                }
                            }).dequeue('jump');

                    }
                }).dequeue('jump');
        }

        updatePosition(sceneX: number, viewportDimensions: ACV.View.ViewportDimensions) {
            var targetX: number,
                viewportPositionRatio: number,
                speed = 1;

            //Player is out of sight to the right. Set him right outside the left viewport boundary
            if (this.x < sceneX - this.width) {
                this.setPosition(sceneX - this.width);
            }

            //Player is out of sight to the right. Set him right outside the right hand viewport boundary
            if (this.x > sceneX + viewportDimensions.width) {
                this.setPosition(sceneX + viewportDimensions.width);
            }

            //Map player's position to a ratio from 0 (left) to 1 (right) to dynamically adapt walking speed
            viewportPositionRatio = (this.x - sceneX) / viewportDimensions.width;

            if (viewportPositionRatio < this.prefs.position.min || viewportPositionRatio > this.prefs.position.max) {
                targetX = sceneX + this.prefs.position.target * viewportDimensions.width;
                speed = Math.abs(this.prefs.position.target - viewportPositionRatio);
                this.moveTo(targetX, sceneX, speed, viewportDimensions);
            }
        }

        moveTo(targetX: number, sceneX: number, speed: number, viewportDimensions: ACV.View.ViewportDimensions) {
            var classesToAdd: string,
                classesToRemove: string;

            /*
             * Make player run faster if he was already moving (Not checking the animation queue
             * is alright because this code wouldn't be reached while jumping.
             */
            if (this.element.is(':animated')) {
                speed *= this.prefs.fastWalkMultiplicator;
            }

            //Reduce redraws by adding/removing as many classes at a time as possible
            if (targetX > this.x) {
                classesToRemove = 'backwards';
                classesToAdd = 'walking forward';
            } else {
                classesToRemove = 'forward';
                classesToAdd = 'walking backwards';
            }
            this.element.stop('walk', true).removeClass(classesToRemove).addClass(classesToAdd).animate(
                {
                    left: targetX
                },
                {
                    duration: Math.abs(this.x - targetX) / speed,
                    queue:    'walk',
                    step:     (now) => {
                        var coarseX: number,
                            listenerIndex: any;

                        coarseX = Math.floor(now / this.prefs.movementTriggerGranularity);
                        this.x = now;

                        if (coarseX !== this.lastCoarseX) {
                            this.lastCoarseX = coarseX;
                            for (listenerIndex in this.movementListeners) {
                                this.movementListeners[listenerIndex].apply(this, [this.x, this.lastTriggeredX, targetX, sceneX, viewportDimensions]);
                            }
                            this.lastTriggeredX = this.x;
                        }
                    },
                    complete: () => {
                        this.element.removeClass('walking');
                    }
                }).dequeue('walk');
        }
    }
}