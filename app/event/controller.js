import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EventController extends Controller {
  @service('manifest')
  manifestService;

  @service mqtt;

  pollInterval = 10 * 1000;
  pollTracker = null;

  isProcessing = false;
  isSubscribed = false;

  subscribeTopics = [
    'manifest', //
    'message',
  ];

  @tracked showStreamList = false;

  async updateManifest() {
    if (this.isSubscribed || this.isProcessing || document.hidden) {
      return;
    }

    try {
      this.isProcessing = true;
      await this.manifestService.getManifest(this.model.id);

      const { event } = this.manifestService;

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
      if (this.mqtt.connected && this.isSubscribed == false) {
        await this.subscribe();
      }
    }
  }

  async subscribe() {
    if (this.model) {
      this.subscribeTopics.forEach(topicName => {
        this.mqtt
          .subscribe(`rts/${this.model.id}/${topicName}`)
          .then(info => {
            console.debug('info: ', info);
            this.isSubscribed = true;
          })
          .catch(() => {
            this.isSubscribed = false;
          });
      });
    }
  }

  setupMqttOn() {
    this.mqtt.on('mqtt-message', (sTopic, sMessage) => {
      if (sTopic === `rts/${this.model.id}/message`) {
        let decoded = new TextDecoder('utf-8').decode(sMessage);
        let data = JSON.parse(decoded);
        // Implement this to the UI for onscreen messages
        console.log('Message DATA:');
        console.log(data);
      } else if (sTopic === `rts/${this.model.id}/manifest`) {
        let decoded = new TextDecoder('utf-8').decode(sMessage);
        let data = JSON.parse(decoded);
        this.manifestService.setManifest(data);
      }
    });
  }

  initMqtt() {
    let sub = this.model.sub;

    try {
      this.mqtt.connect(sub.url, 'ClientApp', sub.jwt).then(() => {
        this.setupMqttOn();
        this.updateManifest();
      });
    } catch (e) {
      console.log(e);
      this.initPolling();
    }
  }

  initPolling() {
    if (this.pollTracker) {
      return;
    }

    this.pollTracker = setInterval(() => {
      this.updateManifest();
    }, this.pollInterval);
  }

  isDestroying() {
    if (this.pollTracker) {
      clearInterval(this.pollTracker);
      this.pollTracker = null;
    }
  }

  @action
  toggleStreamList() {
    this.showStreamList = !this.showStreamList;
  }
}
