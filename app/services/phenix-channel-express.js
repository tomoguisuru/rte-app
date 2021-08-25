import Service, {inject as service} from '@ember/service';
import sdk from 'phenix-web-sdk';
import ENV from 'client-app/config/environment';

const ALLOWED_PARAMS = [
    "appId",
    "capabilities",
    "channelAlias",
    "expiresAt",
    "expiresIn",
    "originStreamId",
    "sessionId",
    "tags",
]

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default class PhenixChannelExpressService extends Service {
    @service('hyperion')
    hyperionApi;

    clientId = null;
    eventId = null;
    pcastExpress = null;
    tokenUrl = null;

    get clientTag() {
        return `client_id:${this.clientId}`;
    }

    constructor() {
        super(...arguments);

        this.clientId = uuidv4();
    }

    createAdminApiProxyClient(options, type = 'stream') {
        const adminApiProxyClient = new sdk.net.AdminApiProxyClient();

        adminApiProxyClient.setRequestHandler(async (requestType, args, callback) => {
            let token = null;
            let error = null;

            try {
                if (type === 'publish') {
                    token = await this.getPublishToken(options, requestType, args);
                } else {
                    token = await this.getToken(options, requestType, args);
                }

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
            // features: ['real-time', 'dash', 'hls', 'rtmp'],
            features: ['real-time'],
            pcastExpress: this.pcastExpress,
        };

        const options = Object.assign({}, defaultOptions, channelOptions);

        return new sdk.express.ChannelExpress(options);
    }

    async getToken(options, requestType = 'stream', args) {
        const {
            tags = [],
        } = options;

        if (!tags.includes(this.clientTag)) {
            tags.push(this.clientTag);
        }

        const url = this.getTokenUrl(requestType);

        options = Object.assign({}, options, args);

        const resp = await this.hyperionApi.requestBase(url, 'post', this.filterOptions(options));
        const {authenticationToken} = resp;

        return authenticationToken;
    }

    getTokenUrl(type) {
        return `${ENV.APP.SERVICES.API_HOST}${this.tokenUrl}/${type}`;
    }

    async getPublishToken(options, requestType = 'stream', args) {
        const {
            tags = [],
        } = options;

        if (!tags.includes(this.clientTag)) {
            tags.push(this.clientTag);
        }

        if (requestType === 'stream') {
            requestType = 'publish';
        }

        const url = this.getTokenUrl(requestType);

        options = Object.assign({}, options, args);

        const resp = await this.hyperionApi.requestBase(url, 'post', this.filterOptions(options));
        const {authenticationToken} = resp;

        return authenticationToken;
    }

    async getStreamToken(options) {
        const {
            tags = [],
        } = options;

        if (!tags.includes(this.clientTag)) {
            tags.push(this.clientTag);
        }

        const url = this.getTokenUrl('stream');

        const resp = await this.hyperionApi.requestBase(url, 'post', this.filterOptions(options));
        const {authenticationToken} = resp;

        return authenticationToken;
    }

    setup(event) {
        const {
            id,
            adminProxyClient,
            connectionInfo: {
                pcastDomain,
                tokenUrl,
            }
        } = event;

        this.tokenUrl = tokenUrl;
        this.eventId = id;

        const adminApiProxyClient = this.createAdminApiProxyClient(adminProxyClient);

        this.pcastExpress = new sdk.express.PCastExpress({
            adminApiProxyClient,
        });

        const pcast = this.pcastExpress.getPCast();
        pcast._baseUri = pcastDomain;
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

    filterOptions(options) {
        const data = {};

        ALLOWED_PARAMS.forEach(k => {
            const value = options[k];

            if (value) {
                data[k] = value;
            }
        });

        return data;
    }
}
