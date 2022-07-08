import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class EditRoomController extends Controller {
  @service store;
  @service router;

  @action
  async onCancel() {
    try {
      await this.model.rollbackAttributes();
      this.router.transitionTo('authenticated.admin.rooms');
    } catch (err) {
      console.error(err);
    }
  }

  @action
  async onSave() {
    try {
      await this.model.save();

      this.router.transitionTo('authenticated.admin.rooms');
    } catch (err) {
      console.error(err);
    }
  }
}
