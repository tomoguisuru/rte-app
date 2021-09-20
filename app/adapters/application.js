import RESTAdapter from '@ember-data/adapter/rest';
import { inject as service } from '@ember/service';
import { underscore } from '@ember/string';

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

  updateRecord(store, type, snapshot) {
    const data = {};
    const changedAttributes = snapshot.changedAttributes();

    Object.keys(changedAttributes).forEach(attributeName => {
      // const newValue = changedAttributes[attributeName][1];
      // // Do something with the new value and the payload
      // // This will depend on what your server expects for a PATCH request
      data[underscore(attributeName)] = changedAttributes[attributeName][1]
    });

    const id = snapshot.id;
    const url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, 'PATCH', { data });
  }
}
