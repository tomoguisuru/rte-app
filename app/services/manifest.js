import Service from '@ember/service';
import ENV from 'client-app/config/environment';

import AuthParams from '../utils/auth-params'

export default class ManifestService extends Service {
    async getManifest(eventId) {
        const url = `${ENV.API_V4}/rts/events/${eventId}/manifest`;
        const request = this._buildRequest();

        const resp = await fetch(url, request);

        if (resp.ok) {
            const json = await resp.json();

            return json.event;
        }
    }

    async raw(method, url, app_id = null, credential_id = null, data = null) {
        const body = {
            app_id,
            credential_id,
            data,
            url,
            method,
        };

        const _url = `${ENV.API_V4}/rts/admin`;
        const request = this._buildRequest('post', body);
        const resp = await fetch(_url, request);

        if (resp.ok) {
            const json = await resp.json();

            return json;
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
