import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class HomeRoute extends Route {
  @service store;
  @service currentUser;

  async beforeModel() {
    await this.store.findAll('pevent');
  }

  async model() {
    return this.store.peekAll('event');
  }
}
