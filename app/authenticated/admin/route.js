import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminRoute extends Route {
  @service currentUser;
  @service session;

  async beforeModel(transition) {
    if (this.currentUser.user.role !== 'admin') {
      transition.abort();

      this.transitionTo('authenticated.events');
    }
  }
}
