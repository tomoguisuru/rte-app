import Service, { inject as service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service('rts-api') api;
  @service store;

  @tracked
  user = null;

  async load() {
    this.user = await this.store.queryRecord('user', { me: true });
  }

  clear() {
    this.user = null;
  }
}
