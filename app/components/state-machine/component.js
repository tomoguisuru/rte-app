import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class StateMachineComponent extends Component {
  @service
  stateTracker;

  @action
  previous() {
    this.stateTracker.previous();
  }

  @action
  next() {
    this.stateTracker.next();
  }
}
