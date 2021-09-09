import Component from '@glimmer/component';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class UserLogoutComponent extends Component {
    @service currentUser;
    @service router;
    @service session;

    email = null;
    errorMessage = null;
    password = null;

    @action
    async logout() {
      if (this.session.isAuthenticated) {
        await this.session.invalidate();

        this.router.transitionTo('login');
      }
    }
}
