import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class HomeController extends Controller {
  @service router;

  @action
  onClick(id) {
    this.router.transitionTo('home.event', id);
  }
}
