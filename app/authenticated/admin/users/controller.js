import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class UsersController extends Controller {
  @service currentUser;

  get user() {
    return this.currentUser?.user;
  }
}
