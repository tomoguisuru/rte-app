import Service, {inject as service} from '@ember/service';

const ALLOWED_PARAMS = [
    "capabilities",
    "channelAlias",
    "expiresAt",
    "expiresIn",
    "originStreamId",
    "sessionId",
    "tags",
]

function filterOptions(options) {
    const data = {};

    ALLOWED_PARAMS.forEach(k => {
        const value = options[k];

        if (value) {
            data[k] = value;
        }
    });

    return data;
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default class EventService extends Service {
    @service('rts-api')
    api;

    events = [];
    streams = [];

    clientId = null;

    constructor() {
        super(...arguments);

        this.clientId = uuidv4();
    }

    get clientTag() {
        return `client_id:${this.clientId}`;
    }

    async getEvent(eventId) {
        await this.getStreams();

        return this.events.find(e => e.id === eventId);
    }

    /**
     * Returns the event stream
     * @param {string} eventId
     * @returns
     */
    async getStream(eventId) {
        const event = await this.getEvent(eventId);

        return event.stream;
    }

    async getStreams() {
        const url = `/streams`;

        const resp = await this.api.request(url, 'get');

        const {
            items = [],
            included = [],
        } = resp;

        const events = [];

        included.forEach(event => {
            event['stream'] = items.find(i => i.eventId == event.id);
            events.push(event);
        });

        this.events = events;
        this.streams = items;
    }

    async getToken(eventId, type, options = {}, args = {}) {
        const url = `/events/${eventId}/token/${type}`;
        const {
            tags = [],
        } = options;

        if (!tags.includes(this.clientTag)) {
            tags.push(this.clientTag);
        }

        options = Object.assign({}, options, args);

        const resp = await this.api.request(
            url,
            'post',
            filterOptions(options),
        );

        if (!('token' in resp)) {
            throw new Error('Unabled to retrieve token');
        }

        return resp.token;
    }

    async readyStream(id) {
        const url = `/streams/${id}/ready`;

        await this.api.request(url, 'post');
    }

    async leaveStream(id) {
        const url = `/streams/${id}/leave`;

        await this.api.request(url, 'post');
    }
}
