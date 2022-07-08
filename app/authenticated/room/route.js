import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RoomRoute extends Route {
  @service store;
  @service('room') roomService;

  async model(params) {
    return this.store.findRecord('room', params.room_id);
  }
}
