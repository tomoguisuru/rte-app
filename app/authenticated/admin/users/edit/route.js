import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UserRoute extends Route {
  @service store;

  async model(params) {
    return this.store.findRecord('User', params.user_id);
  }
}
