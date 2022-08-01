import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { Channels } from '@phenixrts/sdk';
import ChannelState from '../../constants/channel-state';

export default class PhenixChannelComponent extends Component {
    @service('channel-express') channelExpressService;
    @service('stream') streamService;
    @service('rts-api-manifest') manifestService;


    channel = null;
    mediaStream = null;
    videoElement = null;

    @tracked isMuted = false;

    stream = null;
    token = null;

    get isActive() {
      return this.manifestService?.activeStreamId === this.stream?.id;
    }

    constructor() {
      super(...arguments);

      const {
        stream,
      } =  this.args;

      const { streamToken } = stream;

      this.stream = stream;
      this.token = streamToken;
    }

    isDestroying() {
      // Perform teardown
    }

    async joinChannel() {
      let token = this.token;

      if (!token) {
        token = await this.getToken('stream');
      }

      this.channel = Channels.createChannel({
        token,
        videoElement: this.videoElement,
      });

      this.channel.authorized.subscribe(async authorized => {
        if (!authorized) {
          const token = await this.getToken('stream');
          this.channel.token = token;
        }
      });

      this.channel.state.subscribe(state => {
        console.info(this.stream.alias, ChannelState[state]);
      });
    }

    async getToken(type = 'stream') {
      const options = {
        expiresIn: 1800, // 30 minutes
      };

      return this.streamService.getToken(this.stream, type, options);
    }

    @action
    toggleMute(e) {
      if (e) {
        e.preventDefault();
      }

      this.isMuted = !this.isMuted;

      this.videoElement.muted = this.isMuted;
    }

    @action
    onInsert(element) {
      this.videoElement = element.querySelector('video');

      this.toggleMute();

      setTimeout(async () => {
        await this.joinChannel();
      }, 750);
    }

    @action
    setActive() {
      this.manifestService.setActiveStream(this.stream.id);
    }
}
