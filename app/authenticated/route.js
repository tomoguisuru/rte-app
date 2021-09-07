import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service currentUser;
  @service session;

  async beforeModel(transition) {
    await this.session.requireAuthentication(transition, 'login');

    if (this.session.isAuthenticated && !this.currentUser.user) {
      await this.currentUser.setCurrentUser();
    }
  }
}
