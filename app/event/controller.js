import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class EventController extends Controller {
    @service('manifest')
    manifestServices;

    pollInterval = 10 * 1000;
    isProcessing = false;

    @tracked hasJoined = false;
    @tracked showStreamList = false;

    @tracked
    streams = [];

    async updateManifest() {
        if (this.isProcessing || document.hidden) {
            return;
        }

        try {
            this.isProcessing = true;
            const event = await this.manifestServices.getManifest(this.model.id);

            [
                'state',
                'title',
            ].forEach(p => {
                if (this.model[p] !== event[p]) {
                    this.model[p] = event[p];
                }
            });

            this.updateStreams(this.streams, event.streams.concat(event.publisherStreams));
        } catch (err) {
            console.log(err);
        } finally {
            this.isProcessing = false;
        }
    }

    pollTracker = null;

    init() {
        super.init();

        this.pollTracker = setInterval(() => {
            this.updateManifest();
        }, this.pollInterval);
    }

    isDestroying() {
        if (this.pollTracker) {
            clearInterval(this.pollTracker);
            this.pollTracker = null
        }
    }

    updateStreams(collectionA, collectionB) {
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

    @action
    joinEvent() {
        this.showSettings = false;
        this.hasJoined = true;
    }

    @action
    leaveEvent() {
        this.showSettings = true;
        this.hasJoined = false;
    }

    @action
    toggleStreamList() {
        this.toggleProperty('showStreamList');
    }
}
