import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import sdk from 'phenix-web-sdk';

export default class PublisherController extends Controller {
    queryParams = ['email', 'token']

    @service('phenix-channel-express')
    channelExpressService;

    @service('rts-api-manifest')
    api;

    @service('event')
    eventService;

    @controller('authenticated.event')
    eventController;

    footerCenterControls = document.getElementById('footer_center_controls');

    @tracked hasPublisher = false;
    @tracked showPublisher = true;
    @tracked streamAudio = true;
    @tracked streamVideo = true;

    audioInputOptions = [];
    audioOutputOptions = [];
    videoInputOptions = [];

    publisherElementSelector = '#publisherStream'
    publisher = null;

    selectedAudioInput = null;
    selectedVideoInput = null;

    channelExpress = null;

    email = null;
    token = null;

    async init() {
        super.init(...arguments);

        await this.getUserMediaSources();
    }

    async getUserMedia() {
        const audioSource = this.selectedAudioInput;
        const videoSource = this.selectedVideoInput;
        const constraints = {
            audio: this.streamAudio ? {deviceId: audioSource ? {exact: audioSource} : undefined} : false,
            video: this.streamVideo ? {deviceId: videoSource ? {exact: videoSource} : undefined} : false,
        };

        this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        return this.mediaStream;
    }

    async getUserMediaSources() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();

            if (!devices) {
                throw new Error('No devices');
            }

            const audioInputOptions = [];
            const audioOutputOptions = [];
            const videoInputOptions = [];

            devices.forEach(device => {
                const value = device.deviceId;

                switch (device.kind) {
                    case 'audioinput':
                        audioInputOptions.push({
                            value,
                            text: device.label || `microphone ${audioInputOptions.length + 1}`,
                        });
                        break;
                    case 'audiooutput':
                        audioOutputOptions.push({
                            value,
                            text: device.label || `speaker ${audioOutputOptions.length + 1}`,
                        });
                        break;
                    case 'videoinput':
                        videoInputOptions.push({
                            value,
                            text: device.label || `camera ${videoInputOptions.length + 1}`,
                        });
                        break;
                    default:
                        // do nothing
                }
            });

            this.audioInputOptions = audioInputOptions;
            this.audioOutputOptions = audioOutputOptions;
            this.videoInputOptions = videoInputOptions;

            this.selectedAudioInput = audioInputOptions[0].value;
            this.selectedVideoInput = videoInputOptions[0].value;
        } catch (err) {
            console.log(err);
        }
    }

    async initChannelExpress() {
        // const {
        //     domain,
        // } = this.eventController.model;

        // const {
        //     tags,
        // } = this.model;

        // const data = {
        //     channelAlias: this.stream.channelAlias,
        //     tags,
        // };

        // const adminApiProxyClient = this.channelExpressService
        //     .createAdminApiProxyClient(data, 'publish');

        // const pcastExpress = new sdk.express.PCastExpress({
        //     adminApiProxyClient,
        // });

        // const pcast = pcastExpress.getPCast();
        // pcast._baseUri = domain;

        // this.channelExpress = new sdk.express.ChannelExpress({
        //     adminApiProxyClient,
        //     pcastExpress,
        // });

        // this.hasJoined = true;

        const {
            id,
        } = this.eventController.model;

        const {
            tags,
        } = this.model;

        const tokenOptions = {
            tags,
        };
        const authToken = await this.eventService.getToken(id, 'auth', tokenOptions)

        const options = {
            authToken,
        }

        this.channelExpress = new sdk.express.ChannelExpress(options);
    }

    publishCallback(error, response) {
        if (error || !response) {
            console.error(error || 'Unknown Error');
            return;
        }

        if (response.status === 'stream-ended') {
            this.stop();
            return;
        }

        if (response.status === 'ok' && response.publisher) {
            this.publisher = response.publisher;
            this.hasPublisher = true;

            return

            // this.captureTask = setInterval(
            //     () => this.capture(),
            //     this.captureIntervalInMS,
            // );
        }
        this.stop();

        console.debug(response);
    }

    async publishToChannel() {
        const videoElement = document.querySelector(this.publisherElementSelector);
        const {
            channelAlias: alias,
            channelName: name,
            streamQuality,
            tags,
        } = this.stream;


        const {
            id,
        } = this.eventController.model;

        const tokenOptions = {
            capabilities: [
                streamQuality,
                'streaming',
                'on-demand',
                // 'broadcast',
                // 'multi-bitrate',
            ],
            tags,
        };

        const publishToken = this.eventService.getToken(id, 'publish', tokenOptions);

        const options = {
            videoElement,
            publishToken,
            tags,
            // capabilities: [
            //     streamQuality,
            //     'streaming',
            //     'on-demand',
            //     // 'broadcast',
            //     // 'multi-bitrate',
            // ],
            channel: {
                name,
                alias,
            },
            frameRate: 24,
            userMediaStream: this.mediaStream,
        };

        this.channelExpress.publishToChannel(
            options,
            (error, response) => this.publishCallback(error, response),
        )
    }

    async updateStream() {
        await this.getUserMedia();

        const element = document.querySelector(this.publisherElementSelector);

        element.srcObject = this.mediaStream;
    }

    @action
    async onInsert() {
        this.updateStream();
        const element = document.querySelector(this.publisherElementSelector)

        element.muted = true;
    }

    @action
    async publishStream() {
        try {
            await this.eventService.readyStream(this.model.id);

        } catch (e) {
            console.debug(e.message);
        }

        if (!this.channelExpress) {
            this.initChannelExpress();
        }

        this.publishToChannel();
    }

    @action
    async stop() {
        if (this.publisher) {
            try {
                await this.publisher.stop();
                await this.eventService.leaveStream(this.stream.id);
            } catch (err) {
                console.debug(err);
            }
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(t => t.stop());

            this.mediaStream = null;
        }

        this.hasJoined = false;
        this.publisher = null;
        this.hasPublisher = false;
        this.channelExpress = null;

        this.onInsert();
    }

    @action
    toggleAudioInput() {
        this.toggleProperty('streamAudio');
        this.updateStream();

        if (this.publisher) {
            if (this.streamAudio) {
                this.publisher.enableAudio();
            } else {
                this.publisher.disableAudio();
            }
        }
    }

    @action
    toggleVideoInput() {
        this.toggleProperty('streamVideo');
        this.updateStream();

        if (this.publisher) {
            if (this.streamVideo) {
                this.publisher.enableVideo();
            } else {
                this.publisher.disableVideo();
            }
        }
    }

    @action
    togglePublisher() {
        this.toggleProperty('showPublisher');
    }

    @action
    updateSelectedAudio(value) {
        this.selectedAudioInput = value;
    }

    @action
    updateSelectedVideo(value) {
        this.selectedVideoInput = value;
    }
}
