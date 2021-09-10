import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EventsRoute extends Route {
  @service event;
  @service store;

  async beforeModel() {
    await this.store.findAll('stream');
  }

  async model() {
    return this.store.peekAll('stream');
  }
}
