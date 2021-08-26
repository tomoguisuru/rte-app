import Service, {inject as service} from '@ember/service';
import sdk from 'phenix-web-sdk';

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

export default class PhenixChannelExpressService extends Service {
    @service('rts-api')
    api;

    @service('event')
    eventService;

    eventId = null;
    pcastExpress = null;

    createAdminApiProxyClient(options, type = 'stream') {
        const adminApiProxyClient = new sdk.net.AdminApiProxyClient();

        adminApiProxyClient.setRequestHandler(async (requestType, args, callback) => {
            let token = null;
            let error = null;

            try {
                if (type === 'publish') {
                    token = await this.getToken(options, 'publish', args);
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

    async getToken(options, requestType = 'stream', args) {
        return this.eventService.getToken(this.eventId, requestType, options, args);
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
