import Service, {inject as service} from '@ember/service';
import {camelize, underscore} from '@ember/string';

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

            return this._transform(json);
        }
    }

    _buildRequest(method, data) {
        const headers = {
            'Authorization': `Bearer ${this.session.data.authenticated.token}`,
        };
        let body;

        if (data) {
            data = this._transform(data, 'underscore');

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

    _transform(data, method = 'camelize') {
        if (!(typeof (data) == 'object')) {
            return data;
        }

        const keys = Object.keys(data);

        if (keys.length > 0) {
            return keys.reduce((rv, key) => {
                let value = data[key];

                if (Array.isArray(value)) {
                    value = value.map(d => this._transform(d, method));
                } else {
                    value = this._transform(value, method);
                }
                const _key = method === 'camelize' ? camelize(key) : underscore(key);
                rv[_key] = value;

                return rv
            }, {});
        }

        return data;
    }
}