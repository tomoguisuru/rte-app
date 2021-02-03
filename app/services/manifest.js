import Service from '@ember/service';
import ENV from 'client-app/config/environment';

import AuthParams from '../utils/auth-params'

export default class ManifestService extends Service {
    async getManifest(eventId) {
        const url = `/rts/events/${eventId}/manifest`;

        return this.request(url);
    }

    async raw(method, url, app_id = null, credential_id = null, data = null) {
        const body = {
            app_id,
            credential_id,
            data,
            url,
            method,
        };

        return this.request(`/rts/admin`, 'post', body);
    }

    async request(url, method = 'get', data = null) {
        const request = this._buildRequest(method, data);

        const resp = await fetch(`${ENV.API_V4}${url}`, request);

        if (resp.ok) {
            const json = await resp.json();

            return json.event;
        }
    }

    _buildRequest(method, data) {
        const authParams = AuthParams();
        const headers = {
            'Authorization': `${authParams.msg} ${authParams.sig}`,
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
