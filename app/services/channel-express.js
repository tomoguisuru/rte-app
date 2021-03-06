import Service, { inject as service } from '@ember/service';
import sdk from 'phenix-web-sdk';

export default class PhenixChannelExpressService extends Service {
  @service('event')
  eventService;

  eventId = null;
  pcastExpress = null;

  createAdminApiProxyClient(options, type = 'stream') {
    const adminApiProxyClient = new sdk.net.AdminApiProxyClient();

    adminApiProxyClient.setRequestHandler(
      async (requestType, args, callback) => {
        let token = null;
        let error = null;

        try {
          if (type === 'publish') {
            token = await this.getPublishToken(
              options,
              requestType,
              args,
            );
          } else {
            token = await this.getToken(options, requestType, args);
          }
        } catch (err) {
          error = err.message;
        }

        callback(error, token);
      },
    );

    return adminApiProxyClient;
  }

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
