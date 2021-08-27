import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

import {inject as service} from '@ember/service';
import {action} from '@ember/object';

import {Channels} from '@phenixrts/sdk';
import ChannelState from '../../constants/channel-state';

export default class PhenixChannelComponent extends Component {
    @service('channel-express')
    channelExpressService;

    channel = null;
    mediaStream = null;
    videoElement = null;

    @tracked isActive = true;
    @tracked isMuted = false;
    stream = null;

    constructor() {
        super(...arguments);

        this.stream = this.args.stream;
    }

    isDestroying() {
        // Perform teardown
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

        this.channel.state.subscribe(state => {
            console.info(this.stream.alias, ChannelState[state]);
        });
    }

    async getToken() {
        const {
            alias: channelAlias,
            tags,
        } = this.stream;

        const options = {
            tags,
            channelAlias,
            expiresIn: 1800, // 30 minutes
        };

        return this.channelExpressService.getToken(options, 'stream');
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

        setTimeout(async () => {
            await this.joinChannel();
        }, 750);
    }

    @action
    toggleActive() {
        this.isActive = !this.isActive;
    }
}
