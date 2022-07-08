import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class RoomsNewController extends Controller {
  @service store;
  @service router;

  @action
  async onSave() {
    try {
      const room = this.store.createRecord('room', {
        title: this.title,
        rts_event: this.event_id,
      });

      await room.save();

      this.router.transitionTo('authenticated.admin.event.rooms');
    } catch (err) {
      console.error(err);
    }
  }
}
