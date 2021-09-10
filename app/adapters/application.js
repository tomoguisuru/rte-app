import RESTAdapter from '@ember-data/adapter/rest';
import { inject as service } from '@ember/service';

import ENV from 'client-app/config/environment';

export default class ApplicationAdapter extends RESTAdapter {
  @service session;

  host = ENV.APP.API_HOST;

  get headers() {
    let headers = {};

    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.token}`;
    }

    return headers;
  }
}
