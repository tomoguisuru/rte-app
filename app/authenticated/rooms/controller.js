import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class EventsController extends Controller {
  @service router;

  @action
  onEventClick(room) {
    this.router.transitionTo('authenticated.room.join', room);
  }
}
