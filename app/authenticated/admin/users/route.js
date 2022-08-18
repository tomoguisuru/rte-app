import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UsersRoute extends Route {
  @service currentUser;
  @service store;
  @service router;

  beforeModel(transition) {
    const { user } = this.currentUser;

    if (!(['admin'].includes(user.role))) {
      transition.abort();
      this.router.transitionTo('authenticated.events');
    }
  }

  async model() {
    return this.store.findAll('user');
  }
}
