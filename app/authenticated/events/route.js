import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';

export default class EventsRoute extends Route {
    @service('rts-api') api;

    async model() {
        const resp = await this.api.request('/streams');

        const {
            items = [],
            included = [],
        } = resp;

        const events = [];

        included.forEach(event => {
            event['stream'] = items.find(i => i.eventId == event.id);
            events.push(event);
        });

        return events;
    }
}