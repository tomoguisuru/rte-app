import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class RoomController extends Controller {
  @service store;
  @service router;
  @service room;

  @tracked model = null;
}
