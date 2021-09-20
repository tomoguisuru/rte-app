import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class EventController extends Controller {
  @service store;

  get users() {
    return this.store.peekAll('user');
  }

  @action
  updateUser(stream, { target: { value }}) {
    const user = this.users.findBy('id', value);
    stream.userId = value;
    stream.user = user;

    stream.save();
  }
}
