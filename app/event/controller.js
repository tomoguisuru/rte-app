import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EventController extends Controller {
  @service('rts-api-manifest')
  manifestService;

  @service mqtt;

  pollInterval = 10 * 1000;
  pollTracker = null;

  isProcessing = false;
  isSubscribed = false;

  subscribeTopics = [
    'manifest',
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
      console.error(err);
    } finally {
      this.isProcessing = false;

      if (this.mqtt.connected && this.isSubscribed == false) {
        await this.subscribe();
      }
    }
  }

  async subscribe() {
    if (!this.model) {
      return;
    }

    this.subscribeTopics.forEach(topicName => {
      this.mqtt
        .subscribe(`rts/${this.model.id}/${topicName}`)
        .then(info => {
          console.debug(`Successfully subscribed to topic: ${topicName}`, info);
          this.isSubscribed = true;
        })
        .catch(() => {
          this.isSubscribed = false;
          console.log(`Error subscribing to topic: ${topicName}`);
        });
    });
  }

  setupMqttListeners() {
    this.mqtt.on('mqtt-connected',  () => {
      console.info('MQTT connected.');
    });

    this.mqtt.on('mqtt-disconnected',  () => {
      console.info('MQTT disconnected.');
      this.isSubscribed = false;
    });

    this.mqtt.on('mqtt-close',  () => {
      console.info('MQTT close.');
      this.isSubscribed = false;
    });

    this.mqtt.on('mqtt-error',  () => {
      console.info('MQTT Error.');
    });

    this.mqtt.on('mqtt-message', (sTopic, sMessage) => {
      console.info('Message', sTopic);
      if (sTopic === `rts/${this.model.id}/message`) {
        let decoded = new TextDecoder('utf-8').decode(sMessage);
        let data = JSON.parse(decoded);
        // Implement this to the UI for onscreen messages
        console.info('Message DATA:');
        console.info(data);
      } else if (sTopic === `rts/${this.model.id}/manifest`) {
        let decoded = new TextDecoder('utf-8').decode(sMessage);
        let data = JSON.parse(decoded);
        this.manifestService.setManifest(data);
      }
    });
  }

  async initMqtt() {
    try {
      const {
        id,
        sub: { url, jwt },
      } = this.model;

      this.setupMqttListeners();

      await this.mqtt.connect(url, id, jwt);
      this.subscribe();
    } catch (err) {
      console.info('Cannot connect to MQTT');

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
