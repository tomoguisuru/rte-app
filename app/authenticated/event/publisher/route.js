import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublisherRoute extends Route {
  @service('event') eventService;
  @service store;

  async model() {
    const event = this.modelFor('authenticated.event');
    const streams = await this.store.findAll('stream');
    const stream = streams.find(s => s.belongsTo('event').id() === event.id);

    console.log('Event: ', event);
    console.log('Streams: ', streams)
    console.log('Stream: ', stream)

    return stream;
  }
}
