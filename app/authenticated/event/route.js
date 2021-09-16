import { inject as service } from '@ember/service';

import BaseRoute from '../../event/route';

export default class EventRoute extends BaseRoute {
  @service('channel-express')
  channelExpressService;

  afterModel(model) {
    super.afterModel(model);

    this.channelExpressService.eventId = model.id;
  }
}
