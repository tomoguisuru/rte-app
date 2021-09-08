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

    isSubscribed = false;

    subscribeTopics = [
        'manifest',
        'message'
    ]

    @tracked showStreamList = false;

    // async updateManifest() {
    //     if (this.isSubscribed || this.isProcessing || document.hidden) {
    //         return;
    //     }

    //     try {
    //         this.isProcessing = true;
    //         await this.manifestService.getManifest(this.model.id);

    //         const {event} = this.manifestService;

    //         [
    //             'desc',
    //             'state',
    //             'title',
    //         ].forEach(p => {
    //             if (this.model[p] !== event[p]) {
    //                 this.model[p] = event[p];
    //             }
    //         });
    //     } catch (err) {
    //         console.log(err);
    //     } finally {
    //         this.isProcessing = false;
    //         if(this.mqtt.connected && this.isSubscribed == false)
    //         {
    //             await this.subscribe();
    //         }
    //     }

    // }

    async subscribe() {
        if(this.model){
            this.subscribeTopics.forEach(topicName => {
                const topic = `rts/${this.model.id}/${topicName}`
                this.mqtt.subscribe(topic).then( (info)=>{
                    this.isSubscribed = true;
                    console.log(`Successfully subscribed to topic: ${topic}`);
                }).catch(err => {
                    console.err(err);
                    this.isSubscribed = false;
                    console.log(`Error subscribing to topic: ${topic}`);
                });
            });
        }
    }

    setupMqttListeners() {
        this.mqtt.on('mqtt-connected',  () => {
            console.log('MQTT connected.');

        });

        this.mqtt.on('mqtt-disconnected',  () => {
            console.log('MQTT disconnected.');
            this.isSubscribed = false;
        });

        this.mqtt.on('mqtt-close',  () => {
            console.log('MQTT close.');
            this.isSubscribed = false;
        });

        this.mqtt.on('mqtt-error',  () => {
            console.log('MQTT Error.');

        });

        this.mqtt.on('mqtt-message',  (sTopic, sMessage) => {
            console.log('message', sTopic);
            if (sTopic === `rts/${this.model.id}/message`) {
                let decoded = new TextDecoder("utf-8").decode(sMessage);
                let data = JSON.parse(decoded);
                // Implement this to the UI for onscreen messages
                console.log('Message DATA:')
                console.log(data);
            } else if (sTopic === `rts/${this.model.id}/manifest`) {
                let decoded = new TextDecoder("utf-8").decode(sMessage);
                let data = JSON.parse(decoded);
                this.manifestService.setManifest(data);
            }
        });
    }
    initMqtt() {
        let sub = this.model.sub;
        this.setupMqttListeners();
        this.mqtt.connect(sub.url, this.model.id, sub.jwt)
        .then(() => {
            // this.updateManifest();
            this.subscribe();
        })
        .catch(err => {
            console.err(err);
        });
    }

    @action
    toggleStreamList() {
        this.toggleProperty('showStreamList');
    }
}
