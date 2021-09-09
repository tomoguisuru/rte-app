import Component from '@glimmer/component';
// import {tracked} from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class UserLoginComponent extends Component {
    @service session;
    @service currentUser;

    email = null;
    errorMessage = null;
    password = null;

    @action
    async login() {
      if (!this.email || !this.password) {
        this.errorMessage = 'Email and Password are required';
      }

      const authenticator = 'authenticator:jwt';

      await this.session.authenticate(authenticator, {
        email: this.email,
        password: this.password,
      });
    }
}
