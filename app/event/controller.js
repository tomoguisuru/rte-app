import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class EventController extends Controller {
    @service('manifest')
    manifestService;

    pollInterval = 10 * 1000;
    isProcessing = false;

    @tracked
    showStreamList = false;

    // @tracked
    // streams = [];

    /**
     * Polls for changes from the manifest.
     *
     * NOTE: This will eventually be handled through web sockets
     */
    async updateManifest() {
        if (this.isProcessing || document.hidden || !this.model) {
            return;
        }

        try {
            this.isProcessing = true;
            await this.manifestService.getManifest(this.model.id);

            const {event} = this.manifestService;

            [
                'desc',
                'state',
                'title',
            ].forEach(p => {
                if (this.model[p] !== event[p]) {
                    this.model[p] = event[p];
                }
            });
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

    @action
    toggleStreamList() {
        this.toggleProperty('showStreamList');
    }
}
