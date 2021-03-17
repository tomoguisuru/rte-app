import Service, {inject as service} from '@ember/service';

export default class StreamService extends Service {
    @service('hyperion')
    hyperionApi;

    async getStream(eventId, email, publisher_token) {
        const url = `/rts/events/${eventId}/publishers`;

        const data = {
            email,
            publisher_token,
        };

        const json = await this.hyperionApi.request(url, 'post', data);

        return json['@included'][0];
    }

    async readyStream(id) {
        const url = `/rts/streams/${id}/ready`;
        const timestamp = Math.trunc(Date.now() / 1000);
        const data = {timestamp};

        await this.hyperionApi.request(url, 'put', data);
    }

    async leaveStream(id) {
        const url = `/rts/streams/${id}/leave`;
        const timestamp = Math.trunc(Date.now() / 1000);
        const data = {timestamp};

        await this.hyperionApi.request(url, 'put', data);
    }
}
