import Service from '@ember/service';
import sdk from 'phenix-web-sdk';

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
        const {
            backendUri,
            authenticationData,
        } = options;

        const adminApiProxyClient = new sdk.net.AdminApiProxyClient();
        adminApiProxyClient.setBackendUri(`${ENV.CMS_DOMAIN}${backendUri}`);


        const {tags = []} = authenticationData;

        tags.push(this.clientTag);

        authenticationData['tags'] = tags;

        adminApiProxyClient.setAuthenticationData(authenticationData);

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

    setup(event) {
        const {
            id,
            adminProxyClient,
        } = event;

        this.eventId = id;
        const adminApiProxyClient = this.createAdminApiProxyClient(adminProxyClient);

        this.pcastExpress = new sdk.express.PCastExpress({
            adminApiProxyClient,
        })
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
}
