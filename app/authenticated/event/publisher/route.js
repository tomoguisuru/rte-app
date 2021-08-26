import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class PublisherRoute extends Route {
    @service event;

    async model(params) {
        return this.event.getStream(params.stream_id);
    }
}
