import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import sdk from 'phenix-web-sdk';

export default class PublisherController extends Controller {
  queryParams = [
    'email',
    'token',
  ];

  @service('phenix-channel-express')
  channelExpressService;

  @service('manifest')
  manifestService;

  @service('stream')
  streamService;

  @controller('event')
  eventController;

  @tracked hasPublisher = false;
  @tracked showPublisher = true;
  @tracked streamAudio = true;
  @tracked streamVideo = true;

  audioInputOptions = [];
  audioOutputOptions = [];
  videoInputOptions = [];

  publisher = null;
  stream = null;

  selectedAudioInput = null;
  selectedVideoInput = null;

  channelExpress = null;

  email = null;
  token = null;

  get domain() {
    return this.eventController.model.domain;
  }

  get footerCenterControls() {
    return document.getElementById('footer_center_controls');
  }

  get videoElement() {
    return document.getElementById('publisherStream');
  }

  constructor() {
    super(...arguments);

    this.getUserMediaSources();
  }

  async getUserMedia() {
    const audioSource = this.selectedAudioInput;
    const videoSource = this.selectedVideoInput;
    const constraints = {
      audio: this.streamAudio
        ? { deviceId: audioSource ? { exact: audioSource } : undefined }
        : false,
      video: this.streamVideo
        ? { deviceId: videoSource ? { exact: videoSource } : undefined }
        : false,
    };

    this.mediaStream = await navigator.mediaDevices.getUserMedia(
      constraints,
    );

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
      connectionInfo: { pcastDomain, tags, tokenUrl },
    } = this.model;

    this.channelExpressService.tokenUrl = tokenUrl;

    const data = {
      channelAlias: this.stream.alias,
      tags,
    };

    const adminApiProxyClient =
          this.channelExpressService.createAdminApiProxyClient(
            data,
            'publish',
          );
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

      return;
    }

    this.stop();

    console.debug(response);
  }

  publishToChannel() {
    const { alias, external_name: name, stream_quality } = this.stream;

    const options = {
      videoElement: this.videoElement,
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

    this.channelExpress.publishToChannel(options, (error, response) =>
      this.publishCallback(error, response),
    );
  }

  stopTrack() {
    const { srcObject } = this.videoElement;

    if (!srcObject) {
      return;
    }

    const tracks = srcObject.getTracks();

    tracks.forEach(t => t.stop());
  }

  async updateStream() {
    this.stopTrack();
    await this.getUserMedia();

    this.videoElement.srcObject = this.mediaStream;
  }

  @action
  async onInsert() {
    this.updateStream();

    this.videoElement.muted = true;
  }

  @action
  async publishStream() {
    if (!this.email || !this.token) {
      throw new Error('Email and Token must be valid');
    }

    try {
      this.stream = await this.streamService.getStream(
        this.model.id,
        this.email,
        this.token,
      );

      await this.streamService.readyStream(this.stream.id);

      this.manifestService.includeStaged = true;
      this.eventController.updateManifest();
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
        await this.streamService.leaveStream(this.stream.id);
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
    this.streamAudio = !this.strea;
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
    this.streamVideo = !this.streamVideo;
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
    this.showPublisher = !this.showPublisher;
  }

  @action
  updateSelectedAudio(e) {
    this.selectedVideoInput = e.target.value;
    this.updateStream();
  }

  @action
  updateSelectedVideo(e) {
    this.selectedVideoInput = e.target.value;
    this.updateStream();
  }
}
