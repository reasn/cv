/// <reference path="../typings.d.ts"/>

module ACV.HUD {

    /**
     * @since 2013-11-19
     */
    export class TimelineEvent extends ACV.Core.AbstractObject {


        visible: boolean = false;
        playerX: number;
        private  timestamp: Date;
        private  type: string;
        private  data: any;
        element: JQuery = null;

        constructor(playerX: number, timestamp: Date, type: string, data: string) {
            super('ACV.HUD.TimelineEvent');
            this.playerX = playerX;
            this.timestamp = timestamp;
            this.type = type;
            this.data = data;
        }

        static createFromData(rawElement): TimelineEvent {
            return new ACV.HUD.TimelineEvent(
                rawElement.playerX,
                new Date(rawElement.timestamp),
                rawElement.type,
                rawElement.data);
        }

        removeFromDom() {
            this.element.remove();
            this.element = null;
            this.debug('removed event %s from dom', this.data.message);
        }

        /**
         * This method directly deserializes HTML because that leverages the browsers DOM parser
         * and therefore results in the best performance.
         *
         */
        getElement(): JQuery {

            if (this.element !== null) {
                return this.element;
            }
            this.debug('creating element for event %s', this.data.message);
            switch (this.type) {
                case 'post':
                    return this.element = this.render('post', '[' + this.data.author + ']', '<p class="message">' + this.data.message + '</p>');
                case 'activity':
                    return this.element = this.render('activity', this.data.message, '');
                default:
                    throw 'Invalid timeline element type' + this.type;
            }
        }

        private render(type, message, body) {
            var date, html;

            date = this.timestamp.toLocaleDateString('en-GB', {
                weekday: "long",
                year:    "numeric",
                month:   "long",
                day:     "numeric"
            });

            html = '<div class="event ' + type + '"><h3>' + message + '</h3><p class="timestamp">' + date + '</p>' + body + '</div>';

            html = html.replace(/\[/g, '<span class="name">');
            html = html.replace(/\]/g, '</span>');
            return $(html);
        }
    }
}