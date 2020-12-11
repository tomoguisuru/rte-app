import Route from '@ember/routing/route';
import ENV from 'client-app/config/environment';

import moment from 'moment';

import pako from 'pako';

import CryptoJS from 'crypto-js';

export default class ApplicationRoute extends Route {
    async model() {
        const id = 'd2a6647e9481480d9f4308161c977081'
        const params = this.buildParams();
        const qs = this.queryParams(params);

        const url = `${ENV.API_V4}/rts/events/${id}/manifest?${qs}`;
        const request = this.buildRequest();

        const resp = await fetch(url, request);

        if (resp.ok) {
            const json = await resp.json();

            console.log('json: ', json)

            return json.event;
        }
    }

    async setupController(controller, model) {
        super.setupController(controller, model);

        if (controller && model) {
            const {authenticationData} = model.adminProxyClient;
            const {channelExpressService} = controller;
            Object.assign(authenticationData, this.buildParams());

            channelExpressService.setup(model);

            controller.channelExpress = channelExpressService.createChannelExpress();
            console.log('Channel Express created', controller.channelExpress)
        }
    }

    buildRequest(method, data) {
        const headers = {};
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

    buildParams() {
        const tmp = {
            _owner: ENV.OWNER_ID,
            _timestamp: moment().unix(),
        }

        const json_str = JSON.stringify(tmp)

        const comp = pako.deflate(json_str, {level: 9})
        const compStr = String.fromCharCode(...comp)

        var msg = btoa(compStr);

        const sig = CryptoJS.HmacSHA256(msg, ENV.API_KEY).toString();

        return { msg, sig };
    }

    queryParams(params) {
        return Object.keys(params)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
            .join('&');
    }
}
