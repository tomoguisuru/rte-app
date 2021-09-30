import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class NewUserController extends Controller {
  @service store;
  @service router;

  @action
  async onSave() {
    try {
      const user = this.store.createRecord('user', {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        role: 'publisher',
      });

      await user.save();

      user.password = null;

      this.router.transitionTo('authenticated.admin.users.index');
    } catch (err) {
      console.error(err);
    }
  }
}
