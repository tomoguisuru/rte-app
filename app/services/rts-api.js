import Service, {inject as service} from '@ember/service';
import ENV from 'client-app/config/environment';

export default class RtsApiService extends Service {
    @service session;

    async request(url, method = 'get', data = null) {
        return this.requestBase(`${ENV.APP.API_HOST}${url}`, method, data)
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
        const headers = {
            'Authorization': `Bearer ${this.session.data.authenticated.token}`,
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
        }
    }
}