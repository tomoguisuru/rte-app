import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action, computed} from '@ember/object';
import sdk from 'phenix-web-sdk';

export default class PublisherController extends Controller {
    queryParams = ['email', 'token']

    @service('phenix-channel-express')
    channelExpressService;

    @service('stream')
    streamService;

    footerCenterControls = document.getElementById('footer_center_controls');

    @tracked showPublisher = true;
    @tracked hasPublisher = false;

    audioInputOptions = [];
    audioOutputOptions = [];
    videoInputOptions = [];

    publisherElementSelector = '#publisherStream'
    publisher = null;
    stream = null;

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
            audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
            video: {deviceId: videoSource ? {exact: videoSource} : undefined}
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

    initChannelExpress() {
        const {
            connectionInfo: {
                pcastDomain,
                tags,
                tokenUrl,
            },
        } = this.model;

        this.channelExpressService.tokenUrl = tokenUrl;

        const data = {
            channelAlias: this.stream.alias,
            tags,
        };

        const adminApiProxyClient = this.channelExpressService
            .createAdminApiProxyClient(data, 'publish');
        const pcastExpress = new sdk.express.PCastExpress({
            adminApiProxyClient,
        });
        const pcast = pcastExpress.getPCast();
        pcast._baseUri = pcastDomain;

        this.channelExpress = new sdk.express.ChannelExpress({
            adminApiProxyClient,
            pcastExpress,
        });

        this.hasJoined = true;
    }

    publishCallback(error, response) {
        if (error) {
            console.log('Error!!! ', error);
        }

        if (response.status !== 'ok' && response.status !== 'ended' && response.status !== 'stream-ended') {
            this.stop();

            throw new Error(response.status);
        }

        if (response.status === 'ok' && response.publisher) {
            this.publisher = response.publisher;
            this.hasPublisher = true;

            // this.captureTask = setInterval(
            //     () => this.capture(),
            //     this.captureIntervalInMS,
            // );
        }
    }

    @action
    async onInsert() {
        const element = document.querySelector(this.publisherElementSelector);

        await this.getUserMedia();

        element.muted = true;

        element.srcObject = this.mediaStream;
    }

    @action
    async publishStream() {
        if (!this.email || !this.token) {
            throw new Error('Email and Token must be valid');
        }

        try {
            this.stream = await this.streamService
                .getStream(this.model.id, this.email, this.token);
        } catch (e) {
            console.log(e.message);
        }

        this.initChannelExpress();

        const videoElement = document.querySelector(this.publisherElementSelector);
        const {
            alias,
            external_name: name,
            stream_quality,
        } = this.stream;

        const options = {
            videoElement,
            capabilities: [
                stream_quality,
                'streaming',
                // 'broadcast',
                // 'multi-bitrate',
            ],
            channel: {
                name,
                alias,
            },
            userMediaStream: this.mediaStream,
            frameRate: 24,
        };

        this.channelExpress.publishToChannel(
            options,
            (error, response) => this.publishCallback(error, response),
        )
    }

    @action
    async stop() {
        if (this.publisher) {
            if (!this.publisher.hasEnded()) {

                await this.publisher.stop();
                this.publisher = null;
                this.hasPublisher = false;
            }
        }

        this.hasJoined = false;

        // if (this.mediaStream) {
        //     this.mediaStream.getTracks().forEach(t => t.stop());

        //     this.mediaStream = null;
        // }
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
