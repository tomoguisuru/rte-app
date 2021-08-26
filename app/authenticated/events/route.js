import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class EventsRoute extends Route {
    @service event;

    async model() {
        await this.event.getStreams();
        return this.event.events;
    }
}