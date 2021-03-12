import Service, {inject as service} from '@ember/service';

export default class ManifestService extends Service {
    @service('hyperion')
    hyperionApi;

    excludedStreams = [];

    async getManifest(eventId) {
        const url = `/rts/events/${eventId}/manifest`;

        const json = await this.hyperionApi.request(url);

        return json.event;
    }
}
