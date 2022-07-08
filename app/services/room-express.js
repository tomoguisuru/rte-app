import Service, { inject as service } from '@ember/service';
import sdk from 'phenix-web-sdk';

export default class ChannelExpressService extends Service {
  @service('event')
  eventService;

  eventId = null;

  async getPublishToken(options, requestType = 'publish', args) {
    if (requestType === 'stream') {
      return this.getToken(options, 'publish', args);
    }

    return this.getToken(options, requestType, args);
  }

  async getToken(options, requestType = 'stream', args) {
    return this.eventService.getToken(
      this.eventId,
      requestType,
      options,
      args,
    );
  }
}
