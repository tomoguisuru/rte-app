import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EventsRoute extends Route {
  @service store;
  @service currentUser;

  async beforeModel() {
    await this.store.query('event', { page: 1, page_size: 20 });
  }

  async model() {
    return this.store.peekAll('stream').filter(s => s.userId === this.currentUser.user.id);
  }
}
