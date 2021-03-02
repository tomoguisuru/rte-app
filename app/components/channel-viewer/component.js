import Component from '@glimmer/component';
// import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class ChannelViewerComponent extends Component {
    channelService = null;
    mediaStream = null;
    videoElement = null;

    @tracked isActive = true;

    @service('phenix-channel-express')
    channelExpressService;

    @action
    toggleActive() {
        this.isActive = !this.isActive;
    }

    @action
    onInsert(element) {
        this.videoElement = element.querySelector('video');

        setTimeout(() => {
            this.joinChannel();
        }, 750);
    }

    isDestroying() {
        if (this.channelService) {
            this.channelService.leaveChannel();
            this.channelService = null;
        }
    }

    joinChannel() {
        const {
            alias,
            subscriberOptions
        } = this.args.stream;

        const options = {
            alias,
            subscriberOptions,
            videoElement: this.videoElement,
        }

        this.channelExpressService.joinChannel(
            this.args.channelExpress,
            options,
            (error, response) => this.onJoin(error, response),
            (error, response) => this.onSubscribe(error, response),
        )
    }

    onJoin(error, response) {
        const {title} = this.args.stream;
        if (error) {
            console.log(`Unable to join stream ${title}: ${error}`);
        }

        if (response.status !== 'ok') {
            console.log('status not ok: ', response);
        }

        if (response.status === 'ok' && response.channelService) {
            this.channelService = response.channelService;
            console.log(`Joined stream for ${title}`);
        } else {
            console.log('could not find channelService instance', response);
        }
    }

    onSubscribe(error, response) {
        const {title} = this.args.stream;

        if (error) {
            console.log(error);
        }

        if (response.status === 'no-stream-playing') {
            // Handle no stream playing in channel - Wait for one to start
            console.log(response);
        } else if (response.status !== 'ok') {
            // Handle error
            console.log(`status error: ${response}`);
        }

        // Successfully subscribed to most recent channel presenter
        if (response.status === 'ok' && response.mediaStream) {
            // Do something with mediaStream
            this.mediaStream = response.mediaStream;
        } else {
            this.mediaStream = null;
        }

        if (response.renderer) {
            // Returned if videoElement option passed in - Do something with renderer

            response.renderer.on('autoMuted', () => {
                // The browser refused to play video with audio therefore the stream was started muted.
                // Handle this case properly in your UI so that the user can unmute its stream
                console.log('automuted');
            });

            response.renderer.on('failedToPlay', reason => {
                if (reason === 'failed-to-play') {
                    // Failed to play media stream
                }
                if (reason === 'failed-to-play-unmuted') {
                    // Failed to play media stream given the auto mute was disabled
                }
                if (reason === 'paused-by-background') {
                    // Unable to resume playback after pause in Safari
                }

                this.notification.error(`Streamed ${title} failed with reason: ${reason}`);
            });
        }
    }
}
