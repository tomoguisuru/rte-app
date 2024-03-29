import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EventRoute extends Route {
  @service store;

  async model() {
    return this.store.query('room', { page: 1, page_size: 20 });
  }
}
