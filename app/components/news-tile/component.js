import Component from '@glimmer/component';
import { action } from '@ember/object';

import { faker } from '@faker-js/faker';

function titleize(str) {
  return str.toLowerCase().split(' ').map(w => w[0].toUpperCase() + w.substr(1)).join(' ');
}

export default class NewsTile extends Component {
  title = null;
  description = null;
  src = null;
  height = null;
  width = null;

  constructor() {
    super(...arguments);

    const words = Math.floor(Math.random() * 5) + 2;
    const title = this.args.title || faker.random.words(words);
    const description = this.args.description || faker.lorem.paragraph();
    const size = this.args.size || 100;
    this.height = this.args.height || size;
    this.width = this.args.width || size;

    this.title = titleize(title);
    this.description = description;
    this.src = faker.image.sports(this.width, this.height, true);
  }

  @action
  onClick(e) {
    if (e) {
      e.preventDefault();
    }

    if (this.args.onClick) {
      return this.args.onClick();
    } else {
      console.debug('Click not handled')
    }
  }
}
