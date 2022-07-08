import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RoomsEditRoute extends Route {
  @service store;

  async model(params) {
    return this.store.findRecord('room', params.room_id);
  }
}
