import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class EventsController extends Controller {
  @service router;

  currentId = null;

  @action
  onEventClick(roomId) {
    this.currentId = roomId;
    this.router.transitionTo('authenticated.admin.rooms.edit', roomId);
  }
}
