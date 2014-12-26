module ACV.HUD {

    /**
     * @since 2013-11-19
     */
    export class Timeline extends ACV.Core.AbstractObject {

        private eventWrapper: JQuery;
        private prefs: any;
        private appContext: AppContext;
        private events: TimelineEvent[];
        private element: JQuery;
        private numberOfEventsVisible: number = 0;

        constructor(appContext: ACV.AppContext, prefs: any, events: TimelineEvent[]) {
            super('ACV.HUD.Timeline');
            this.appContext = appContext;
            this.prefs = prefs;
            this.events = events;
        }


        static createFromData(appContext: ACV.AppContext, data: any): Timeline {
            var eventIndex, timelineElements = [];

            for (eventIndex in data.events) {
                timelineElements.push(TimelineEvent.createFromData(data.events[eventIndex]));
            }
            return new Timeline(appContext, data.prefs, timelineElements);
        }

        init(hudElement: JQuery) {
            this.element = $('<div class="timeline" ><div class="event-wrapper" /></div>');
            this.eventWrapper = this.element.children('.event-wrapper');

            hudElement.append(this.element);

            if (this.appContext.player === undefined) {
                throw 'Player must have been instantiated before Timeline can be initialized.';
            }
            this.appContext.player.addMovementListener((playerX: number, playerXBefore: number): void => {
                this.update(playerX, playerXBefore);
            });

            this.debug('Timeline initialized');
        }

        private update(playerX: number, playerXBefore: number) {
            var eventIndex, event, lastIndexRemoved = -1;

            for (eventIndex in this.events) {
                event = this.events[eventIndex];

                if (playerX > event.playerX && playerXBefore < event.playerX && !event.visible) {
                    this.prepend(event);

                } else if (playerX < event.playerX && playerXBefore > event.playerX && event.visible) {
                    this.remove(event);
                    lastIndexRemoved = eventIndex;
                }
            }
            if (this.numberOfEventsVisible > this.prefs.maxVisibleEvents) {
                //Assume that the events are in ascending order
                for (eventIndex in this.events) {
                    event = this.events[eventIndex];
                    if (event.visible) {
                        this.debug('Too many timeline events visible, removing lowermost');
                        this.remove(event);
                        break;
                    }
                }
            }
            if (lastIndexRemoved !== -1 && this.numberOfEventsVisible < this.prefs.minVisibleEvents) {
                //Assume that the events are in ascending order
                for (eventIndex = lastIndexRemoved - 1; eventIndex >= 0; eventIndex--) {
                    //Find the first element that is invisible moving downwards starting at lastIndexRemoved
                    event = this.events[eventIndex];

                    if (!event.visible) {
                        this.append(event);
                        break;
                    }
                }
            }
        }

        private remove(event: TimelineEvent) {
            event.visible = false;
            this.numberOfEventsVisible--;
            if (event.element === null) {
                return;
            }
            event.element.animate({
                opacity: 0
            }, 400, 'easeInCirc', function () {
                event.element.animate({
                    height: 0,
                    margin: 0
                }, 500, 'easeOutCirc', function () {
                    event.removeFromDom();
                });
            });
        }

        private prepend(event: TimelineEvent) {
            var eventElement;
            event.visible = true;
            this.numberOfEventsVisible++;
            eventElement = event.getElement();

            this.eventWrapper.prepend(eventElement);

            var height = eventElement.height();
            //alert(height);
            eventElement.css({opacity: 0, height: 0});


            eventElement.animate({height: height}, 'easeOutCirc', function () {
                eventElement.animate({
                    opacity: 1
                }, 500, 'easeOutCirc')
            });
        }


        private append(event) {
            event.visible = true;
            this.eventWrapper.append(event.getElement());
            this.numberOfEventsVisible++;
        }
    }
}