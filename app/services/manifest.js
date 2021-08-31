import Service, {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {A} from '@ember/array'

export default class ManifestService extends Service {
    @service('hyperion')
    hyperionApi;

    event = null;
    excludedStreams = A([]);
    allStreams = A([]);

    // @filter('streams', function (stream, _index, _array) {
    //     return stream.included;
    // })
    // includedStreams;

    @computed('allStreams.@each.id', 'excludedStreams.[]')
    get streams() {
        return this.allStreams.filter(s => !this.excludedStreams.includes(s.id));
    }

    async getManifest(eventId) {
        let url = `/rts/events/${eventId}/manifest`;

        const queryParams = new URLSearchParams({});
        queryParams.set('update_via_websocket', true);
        queryParams.set('include_staged', true);
        url = queryParams ? `${url}?${queryParams}` : url;
        console.log(`Requesting manifest: ${url}`);
        const json = await this.hyperionApi.request(url);
        if (!json?.event) {
            return null;
        }
        const {event} = json;
        this.event = event;
        this.setStreams();
    }

    async setManifest(manifest_data) {
        this.event = manifest_data;
        this.setStreams();
    }

    setStreams() {
        const {
            streams = [],
        } = this.event;

        this._updateCollection(this.allStreams, streams);
    }

    _updateCollection(collectionA, collectionB) {
        // There is a bug here that occurs when you include/exclude a stream fast enough that collectionA is not yet flushed out.
        // For stream includ/exclude actions with few seconds gap in between works fine here.
        const existingIds = collectionA.map(s => s.id);
        const expectedIds = collectionB.map(s => s.id);

        const idsToAdd = expectedIds.filter(id => !existingIds.includes(id));
        const idsToRemove = existingIds.filter(id => !expectedIds.includes(id));

        idsToAdd.forEach(id => {
            const stream = collectionB.find(s => s.id === id);
            collectionA.pushObject(stream);
        });

        idsToRemove.forEach(id => {
            const stream = collectionA.find(s => s.id === id);
            if (stream) {
                collectionA.removeObject(stream)
            }
        });
    }
}
