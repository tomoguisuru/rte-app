import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UsersRoute extends Route {
  @service api;
  @service currentUser;
  @service store;

  beforeModel(transition) {
    const { user } = this.currentUser;

    if (!(['admin'].includes(user.role))) {
      transition.abort();

      this.transitionTo('events');
    }
  }

  async model() {
    return this.store.findAll('event');
  }
}
