import Service from '@ember/service';
import sdk from 'phenix-web-sdk';

import AuthParams from '../utils/auth-params'

import ENV from 'client-app/config/environment';

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default class PhenixChannelExpressService extends Service {
    clientId = null;
    eventId = null;
    pcastExpress = null;

    get clientTag() {
        return `client_id:${this.clientId}`;
    }

    constructor() {
        super(...arguments);

        this.clientId = uuidv4();
    }

    createAdminApiProxyClient(options) {
        const adminApiProxyClient = new sdk.net.AdminApiProxyClient();

        adminApiProxyClient.setRequestHandler(async (requestType, args, callback) => {
            let token = null;
            let error = null;

            try {
                token = await this.getToken(options, requestType, args);
            } catch (err) {
                error = err.message;
            }

            callback(error, token);
        });

        return adminApiProxyClient;
    }

    createChannelExpress(channelOptions = {}) {
        if (!this.pcastExpress) {
            throw new Error('You must call "init" first.');
        }

        const adminApiProxyClient = this.pcastExpress.getAdminAPI();
        const defaultOptions = {
            adminApiProxyClient,
            features: ['real-time', 'dash', 'hls', 'rtmp'],
            pcastExpress: this.pcastExpress,
        };

        const options = Object.assign({}, defaultOptions, channelOptions);

        return new sdk.express.ChannelExpress(options);
    }

    async getToken(options, requestType = 'stream', args = {}) {
        const {
            backendUri,
            authenticationData,
        } = options;

        const {tags = []} = authenticationData;

        tags.push(this.clientTag);

        authenticationData['tags'] = tags;

        const url = `${ENV.API_HOST}${backendUri}/${requestType}`;
        const data = Object.assign({}, args, authenticationData);

        const request = this._buildRequest('post', data);
        const resp = await fetch(url, request);

        if (resp.ok) {
            const json = await resp.json();

            return json.authenticationToken;
        }
    }

    setup(event) {
        const {
            id,
            adminProxyClient,
            domain,
        } = event;

        this.eventId = id;
        const adminApiProxyClient = this.createAdminApiProxyClient(adminProxyClient);

        this.pcastExpress = new sdk.express.PCastExpress({
            adminApiProxyClient,
        });


        const pcast = this.pcastExpress.getPCast();
        pcast._baseUri = domain;
    }

    joinChannel(channelExpress, options, onJoin, onSubscribe) {
        const {subscriberOptions = {}} = options;
        const {tags = []} = subscriberOptions;

        tags.push(this.clientTag);

        channelExpress.joinChannel(options, onJoin, onSubscribe);
    }

    setClientId(clientId) {
        this.clientId = clientId;
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
