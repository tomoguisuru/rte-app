import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
// import {v4 as uuidv4} from 'uuid';

export default class EventController extends Controller {
    @service('manifest')
    manifestService;

    @service mqtt;

    pollInterval = 10 * 1000;
    isProcessing = false;

    // 8083 maps to 31060 on my local computer
    // run: kubectl get svc
    // to get mapping
    // wsUrl = 'ws://emqx-ausw2-dp-1.downlynk.net:31736/mqtt';
    wsUrl = 'ws://localhost:30710/mqtt';
    isSubscribed = false;

    subscribeTopics = [
        'manifest',
        'message'
    ]

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
            this.subscribeTopics.forEach(topicName => {
                this.mqtt.subscribe(`rts/${this.model.id}/${topicName}`).then( (info)=>{
                    this.isSubscribed = true;
                }).catch( ()=>{
                    this.isSubscribed = false;
                });
            });
        }
    }

    setupMqttOn() {
        this.mqtt.on('mqtt-message',  (sTopic, sMessage) => {
            if (sTopic === `rts/${this.model.id}/message`) {
                let decoded = new TextDecoder("utf-8").decode(sMessage);
                let data = JSON.parse(decoded);
                // Implement this to the UI for onscreen messages
                console.log('Message DATA:')
                console.log(data);
            } else if (sTopic === `rts/${this.model.id}/manifest`) {
                let decoded = new TextDecoder("utf-8").decode(sMessage);
                let data = JSON.parse(decoded);
                this.manifestService.setManifest(data.event);
            }
        });
    }
    initMqtt() {
        this.mqtt.connect(this.wsUrl).then(() => {
            this.setupMqttOn();
            this.updateManifest();
        });
    }

    @action
    toggleStreamList() {
        this.toggleProperty('showStreamList');
    }
}
