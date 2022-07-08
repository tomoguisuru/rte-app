import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RoomsJoinRoute extends Route {
  @service store;
  @service('room') roomService;

  model() {
    return this.modelFor('authenticated.room');
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    this.roomService.createRoomExpress(model);
  }
}
