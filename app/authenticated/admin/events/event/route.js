import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EventRoute extends Route {
  @service session;
  @service store;

  async beforeModel() {
    return this.store.findAll('user');
  }

  async model(params) {
    return this.store.findRecord('event', params.event_id, { include: 'streams' });
  }
}
