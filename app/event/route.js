import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import RTSEvent from '../objects/event';

export default class EventRoute extends Route {
  @service('rts-api-manifest')
  manifestService;

  @service('channel-express')
  channelExpressService;

  @service router;

  // Needed so that shared implementations can share the template
  templateName = 'event'

  async model(params) {
    const options = {
      withTokens: true,
      // useSockets: true,
    };

    await this.manifestService.getManifest(params.event_id, options);
    const { event } = this.manifestService;

    if (event) {
      const model = new RTSEvent(event);

      return model;
    }
  }

  afterModel(model) {
    if (!model) {
      return this.router.transitionTo('not-found');
    }

    this.channelExpressService.eventId = model.id;
  }

  setupController(controller) {
    super.setupController(...arguments);

    // Add mqtt listener (websocket)
    controller.initMqtt();
  }
}
