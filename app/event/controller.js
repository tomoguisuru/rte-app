import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class EventController extends Controller {
    @service('manifest')
    manifestService;

    @service mqtt;

    pollInterval = 10 * 1000;
    isProcessing = false;

    wsUrl = 'ws://localhost:31736/mqtt';
    isSubscribed = false;

    @tracked showStreamList = false;

    async updateManifest() {
        if (this.isSubscribed || this.isProcessing || document.hidden) {
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
            if(this.mqtt.connected && this.isSubscribed == false)
            {
                await this.subscribe();
            }
        }

    }

    async subscribe() {
        if(this.model){
            this.mqtt.subscribe(`rts/${this.model.id }`).then( ()=>{
                this.isSubscribed = true;

                this.mqtt.on('mqtt-message',  (sTopic, sMessage) => {
                    let decoded = new TextDecoder("utf-8").decode(sMessage)
                    let data = JSON.parse(decoded);
                    this.manifestService.setManifest(data.event);
                });

            }).catch( ()=>{
                this.isSubscribed = false;
            });
        }
    }

    pollTracker = null;

    init() {
        super.init();

        this.mqtt.connect(this.wsUrl);

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
