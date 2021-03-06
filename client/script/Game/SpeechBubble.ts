module ACV.Game {

    /**
     * @since 2014-12-30
     */
    export class SpeechBubble extends ACV.Core.AbstractObject {

        visible = false;
        private element: JQuery = null;
        private hideTimeout: number;
        private prefs: ACV.Data.ISpeechBubblePrefs;
        private messages: {[handle:string]:ACV.Data.ISpeechBubbleMessage};

        private bubbleHeight: number;

        constructor( prefs: ACV.Data.ISpeechBubblePrefs, messages: {[handle:string]:ACV.Data.ISpeechBubbleMessage} ) {
            super('ACV.Game.SpeechBubble');
            this.prefs = prefs;
            this.messages = messages;
        }

        /**
         *
         * @param {jQuery} playerLayerElement
         */
        init( playerLayerElement: JQuery ) {

            this.debug('Initializing speech bubble');

            this.element = $('<div class="speech-bubble"><div class="background flaticon-speech141"></div><div class="message"></div></div>');
            playerLayerElement.append(this.element);
            this.bubbleHeight = parseInt(this.element.css('bottom'));
            this.debug('Speech bubble initialized');
        }

        updatePosition( playerX: number, playerY: number, playerWidth: number, playerHeight: number ) {
            this.element.css({
                transform: 'translate(' + playerX + 'px, ' + -playerY + 'px)',
                bottom:    this.bubbleHeight + playerHeight,
                left:      playerWidth
            });
        }

        show( handle: string ) {
            var message = this.messages[handle],
                duration: number;
            if (!message) {
                this.warn('No speech bubble message found with handle "%s"', handle);
                return;
            }
            duration = message.duration ? message.duration : this.prefs.defaultDuration;

            this.debug('Showing speech bubble for %sms', duration);
            this.element.children('.message').html(message.html);

            clearTimeout(this.hideTimeout);
            this.visible = true;
            this.element.addClass('visible');

            if (duration !== -1) {
                this.hideTimeout = setTimeout(()=> {
                    this.hide();
                }, duration);
            }
        }

        hide() {
            this.debug('Hiding speech bubble ');
            clearTimeout(this.hideTimeout);
            this.element.removeClass('visible');
            this.visible = false;
        }
    }
}