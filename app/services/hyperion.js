import Service from '@ember/service';
import ENV from 'client-app/config/environment';
import AuthParams from '../utils/auth-params';

export default class HyperionService extends Service {
  async request(url, method = 'get', data = null) {
    return this.requestBase(
      `${ENV.APP.SERVICES.API_V4}${url}`,
      method,
      data,
    );
  }

  async requestBase(url, method = 'get', data = null) {
    const request = this._buildRequest(method, data);

    const resp = await fetch(url, request);

    if (resp.ok) {
      const json = await resp.json();

      return json;
    }
  }

  _buildRequest(method, data) {
    const authParams = AuthParams();
    const headers = {
      Authorization: `${authParams.msg} ${authParams.sig}`,
    };
    let body;

    if (data) {
      body = JSON.stringify(data);

      headers['Content-Length'] = body.length;
      headers['Content-Type'] = 'application/json';
    }

    return {
      body,
      method,
      headers,
    };
  }
}
