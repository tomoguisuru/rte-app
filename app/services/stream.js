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
}
