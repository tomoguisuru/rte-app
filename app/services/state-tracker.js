import Service from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

export default class StateTrackerService extends Service {
  @tracked history = A([]);
  @tracked currentIndex = 0;

  get currentSet() {
    return this.history[this.currentIndex];
  }

  get count() {
    return this.history.length;
  }

  constructor() {
    super(...arguments);

    this.history.push([null, null, null]);
  }

  next() {
    this.currentIndex = this.currentIndex + 1;

    const hasSet = this.history[this.currentIndex];

    if (!hasSet) {
      const _set = this._generateSet();
      this.history.push(_set);
    }
  }

  previous() {
    let _index = this.currentIndex - 1;

    if (_index === -1) {
      const _set = this._generateSet();
      this.history.unshift(_set);

      _index = 0;
    }

    this.currentIndex = _index;
  }

  _generateColor() {
    const value = Math.floor(Math.random() * 16777215).toString(16);
    return `#${value}`;
  }

  _generateSet() {
    const _set = [];

    for (let i = 0; i < 3; i++) {
      const isOn = !Math.round(Math.random());
      const value = isOn ? this._generateColor() : null;

      _set.push(value);
    }

    return _set;
  }
}
