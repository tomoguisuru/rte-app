import Service, { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

export default class ManifestService extends Service {
  @service('rts-api') api;

  @tracked event = null;
  @tracked excludedStreams = A([]);
  @tracked allStreams = A([]);

  get streams() {
    return this.allStreams.filter(
      s => !this.excludedStreams.includes(s.id),
    );
  }

  async getManifest(eventId, { withTokens = false, useSockets = false, withStaged = false }) {
    let url = `/events/${eventId}/manifest`;

    const queryParams = new URLSearchParams();

    if (withStaged) {
      queryParams.set('include_staged', true);
    }

    if (useSockets) {
      queryParams.set('update_via_websocket', true);
    }

    if (withTokens) {
      queryParams.set('include_tokens', true);
    }

    url = queryParams ? `${url}?${queryParams}` : url;

    const json = await this.api.request(url);

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
