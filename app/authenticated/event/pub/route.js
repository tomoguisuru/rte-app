import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class PublisherRoute extends Route {
    @service('event') eventService;

    async model() {
        const event = this.modelFor('authenticated.event');

        const stream = await this.eventService.getStream(event.id);

        return stream;
    }
}
