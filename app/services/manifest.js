import Service, {inject as service} from '@ember/service';
// import {filter} from '@ember/object/computed';
import {computed} from '@ember/object';
import {A} from '@ember/array'

export default class ManifestService extends Service {
    @service('hyperion')
    hyperionApi;

    event = null;
    excludedStreams = A([]);
    publisherStreams = A([]);
    ingestStreams = A([]);
    includeStaged = false;

    // @filter('streams', function (stream, _index, _array) {
    //     return stream.included;
    // })
    // includedStreams;

    @computed('ingestStreams.@each.id', 'publisherStreams.@each.id', 'excludedStreams.[]')
    get streams() {
        const ingest = this.ingestStreams.filter(s => !this.excludedStreams.includes(s.id));
        const publisher = this.publisherStreams.filter(s => !this.excludedStreams.includes(s.id));

        return ingest.concat(publisher);
    }

    async getManifest(eventId) {
        let url = `/rts/events/${eventId}/manifest`;

        // if (this.includeStaged) {
        //     url += '?include_staged=true';
        // }

        const json = await this.hyperionApi.request(url);

        const {event} = json;

        this.event = event;

        this.setStreams();
    }

    setStreams() {
        const {
            streams = [],
            publisherStreams = [],
        } = this.event;

        this._updateCollection(this.ingestStreams, streams);
        this._updateCollection(this.publisherStreams, publisherStreams);
    }

    _updateCollection(collectionA, collectionB) {
        const existingIds = collectionA.map(s => s.alias);
        const expectedIds = collectionB.map(s => s.alias);

        const idsToAdd = expectedIds.filter(id => !existingIds.includes(id));
        const idsToRemove = existingIds.filter(id => !expectedIds.includes(id));

        idsToAdd.forEach(id => {
            const stream = collectionB.find(s => s.alias === id);
            collectionA.pushObject(stream);
        });

        idsToRemove.forEach(id => {
            const stream = collectionA.find(s => s.alias === id);
            if (stream) {
                collectionA.removeObject(stream)
            }
        });
    }
}
