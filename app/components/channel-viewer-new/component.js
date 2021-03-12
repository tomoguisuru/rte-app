import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

import {inject as service} from '@ember/service';
import {action} from '@ember/object';

import {Channels} from '@phenixrts/sdk';

export default class ChannelViewerNewComponent extends Component {
    @service('phenix-channel-express')
    channelExpressService;

    channel = null;
    mediaStream = null;
    videoElement = null;

    @tracked isActive = true;
    @tracked isMuted = false;

    isDestroying() {
    }

    async joinChannel() {
        this.channel = Channels.createChannel({
            token: await this.getToken(),
            videoElement: this.videoElement,
        });

        this.channel.authorized.subscribe(async authorized => {
            if (!authorized) {
                const token = await this.getToken();
                this.channel.token = token;
            }
        });

        // this.channel.state.subscribe(state => {
        //     const channelState = CHANNEL_STATE[state];

        //     if ([7].includes(state)) {
        //         this.setNotification(channelState.text, STREAM_STATE.WARN);
        //     } else if ([2, 3, 5, 6].includes(state)) {
        //         this.setNotification(channelState.text, STREAM_STATE.CONNECTING);
        //     } else if ([4].includes(state)) {
        //         this.setNotification(channelState.text, STREAM_STATE.ACTIVE);
        //     } else {
        //         const text = channelState ? channelState.text : 'Unknown Error';

        //         this.setNotification(text, STREAM_STATE.ERROR);
        //     }
        // });
    }

    async getToken() {
        const {
            connectionOptions,
        } = this.args.stream;

        return this.channelExpressService.getStreamToken(connectionOptions);
    }

    @action
    toggleMute() {
        this.isMuted = !this.isMuted;

        this.videoElement.muted = this.isMuted;
    }

    @action
    onInsert(element) {
        this.videoElement = element.querySelector('video');

        this.toggleMute();

        setTimeout(() => {
            this.joinChannel();
        }, 750);
    }

    @action
    toggleActive() {
        this.isActive = !this.isActive;
    }
}
