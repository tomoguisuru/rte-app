import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminRoute extends Route {
  @service currentUser;
  @service session;
  @service router;

  async beforeModel(transition) {
    if (this.currentUser.user.role !== 'admin') {
      transition.abort();

      this.router.transitionTo('authenticated.events');
    }
  }
}
