import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class EventsController extends Controller {
  @service router;

  currentEventId = null;

  @action
  onEventClick(eventId) {
    this.currentEventId = eventId;
    this.router.transitionTo('authenticated.admin.events.event', eventId);
  }
}
