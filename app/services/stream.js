import Service, { inject as service } from '@ember/service';

const ALLOWED_PARAMS = [
  'capabilities',
  'expiresAt',
  'expiresIn',
  'originStreamId',
  'sessionId',
  'tags',
];

export default class StreamService extends Service {
  @service('rts-api') api;

  sessionId = null;

  async getToken(stream, type, options = {}) {
    if (!stream) {
      throw new Error('Unable to request token.');
    }

    if (this.sessionId) {
      options['sessionId'] = this.sessionId;
    }

    const url = `/streams/${stream.id}/token/${type}`;

    const resp = await this.api.request(
      url,
      'post',
      this.filterOptions(options),
    );

    if (!('token' in resp)) {
      throw new Error('Unable to retrieve token');
    }

    return resp.token;
  }

  filterOptions(options) {
    const data = {};

    ALLOWED_PARAMS.forEach(k => {
      const value = options[k];

      if (value) {
        data[k] = value;
      }
    });

    return data;
  }
}
