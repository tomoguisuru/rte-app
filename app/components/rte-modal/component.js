import Component from '@glimmer/component';
// import { tracked } from '@glimmer/tracking';

import {action} from '@ember/object';

export default class RteModalComponent extends Component {
  el = null;

  isDestroying() {
    // Perform teardown
    // window.removeEventListener('scroll', this.isSticky);
  }

  @action
  onInsert(element) {
    this.el = element;
  }
}
