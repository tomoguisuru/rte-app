import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class UsersController extends Controller {
  @service currentUser;

  selectedUserId = null;

  get user() {
    return this.currentUser?.user;
  }

  @action
  onUserClick(userId) {
    this.selectedUserId = userId;
    this.router.transitionTo('authenticated.admin.users.user', userId);
  }
}
