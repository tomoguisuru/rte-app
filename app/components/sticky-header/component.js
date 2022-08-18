import Component from '@glimmer/component';
// import { tracked } from '@glimmer/tracking';

import {action} from '@ember/object';

export default class StickyHeaderComponent extends Component {
  el = null;
  offset = 0;

  isDestroying() {
    // Perform teardown
    window.removeEventListener('scroll', this.isSticky);
  }

  isSticky() {
    if (window.pageYOffset > this.offset) {
      this.el.classList.add('sticky');
    } else {
      this.el.classList.remove('sticky');
    }
  }

  @action
  onInsert(element) {
    this.el = element;

    // Get the offset position of the navbar
    this.offset = this.el.offsetTop;

    // Add the sticky class to the header when you reach its scroll position. Remove 'sticky' when you leave the scroll position
    window.addEventListener('scroll', this.isSticky.bind(this));
  }
}
