import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class EventController extends Controller {
    @service('phenix-channel-express')
    channelExpressService;

    @service('manifest')
    manifestServices;

    pollInterval = 10 * 1000;
    isProcessing = false;

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

            this.updateStreams(this.streams, event.streams);
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

    async doSomething() {
        // const resp = await this.manifestServices.raw(
        //     'get',
        //     `/channels`,
        //     'verizondigitalmedia.com',
        // );

        // const channel = 'us-southwest#verizondigitalmedia.com#asdfasd.jSlTr6Pu6e7R'
        // const resp = await this.manifestServices.raw(
        //     'get',
        //     `/channel/${encodeURIComponent(channel)}/publishers/count`,
        //     'cfd3574dde9b4593b05d7c6a2ac1b33c',
        // );

        // console.log(resp)
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
}
