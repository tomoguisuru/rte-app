import Service from '@ember/service';
import ENV from 'client-app/config/environment';

import AuthParams from '../utils/auth-params'

export default class ManifestService extends Service {
    async getManifest(eventId) {
        // const params = this.buildParams();
        // const qs = this.queryParams(params);

        const url = `${ENV.API_V4}/rts/events/${eventId}/manifest`;
        const request = this._buildRequest();

        const resp = await fetch(url, request);

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
        }

        return {
            body,
            method,
            headers,
        }
    }
}
