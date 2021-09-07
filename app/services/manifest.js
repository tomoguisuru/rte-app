import Service, { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

export default class ManifestService extends Service {
  @service('hyperion')
  hyperionApi;

  @tracked event = null;
  @tracked excludedStreams = A([]);
  @tracked allStreams = A([]);

  includeStaged = false;

  // @filter('streams', function (stream, _index, _array) {
  //     return stream.included;
  // })
  // includedStreams;

  get streams() {
    return this.allStreams.filter(
      s => !this.excludedStreams.includes(s.id),
    );
  }

  async getManifest(eventId) {
    let url = `/rts/events/${eventId}/manifest`;

    if (this.includeStaged) {
      const queryParams = new URLSearchParams({ include_staged: true });

      url = `${url}?${queryParams}`;
    }

    const json = await this.hyperionApi.request(url);

    if (!json?.event) {
      return null;
    }

    const { event } = json;

    this.event = event;

    this.setStreams();
  }

  async setManifest(manifest_data) {
    this.event = manifest_data;

    this.setStreams();
  }

  setStreams() {
    const { streams = [] } = this.event;

    this._updateCollection(this.allStreams, streams);
  }

  _updateCollection(collectionA, collectionB) {
    const existingIds = collectionA.map(s => s.id);
    const expectedIds = collectionB.map(s => s.id);

    const idsToAdd = expectedIds.filter(id => !existingIds.includes(id));
    const idsToRemove = existingIds.filter(
      id => !expectedIds.includes(id),
    );

    idsToAdd.forEach(id => {
      const stream = collectionB.find(s => s.id === id);
      collectionA.pushObject(stream);
    });

    idsToRemove.forEach(id => {
      const stream = collectionA.find(s => s.id === id);
      if (stream) {
        collectionA.removeObject(stream);
      }
    });
  }
}
