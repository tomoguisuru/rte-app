import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';

import { tracked } from '@glimmer/tracking';

import sdk from 'phenix-web-sdk';

export default class PublisherController extends Controller {
  @service('channel-express')
  channelExpressService;

  @service('rts-api-manifest')
  api;

  @service('event')
  eventService;

  @controller('authenticated.event')
  eventController;

  @tracked hasPublisher = false;
  @tracked showPublisher = true;
  @tracked streamAudio = true;
  @tracked streamVideo = true;

  audioInputOptions = [];
  audioOutputOptions = [];
  videoInputOptions = [];

  publisher = null;

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
      console.error('An error occurred while determining media sources', err);
    }
  }

  async initChannelExpress() {
    const authOptions = {
      channelAlias: this.model.alias,
      expiresIn: 3600,
    };

    const authToken = await this.channelExpressService.getToken(
      authOptions,
      'auth',
    );

    this.channelExpress = new sdk.express.ChannelExpress({
      authToken,
      uri: this.domain,
    });
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

  async publishToChannel() {
    const publishOptions = {
      capabilities: [this.model.streamQuality, 'streaming', 'on-demand'],
      channelAlias: this.model.alias,
      expiresIn: 3600,
    };

    const publishToken = await this.channelExpressService.getToken(
      publishOptions,
      'publish',
    );

    const {
      alias,
      title: name,
    } = this.model;

    const options = {
      channel: {
        alias,
        name,
      },
      publishToken,
      frameRate: 24,
      userMediaStream: this.mediaStream,
      videoElement: this.videoElement,
    };

    try {
      this.channelExpress.publishToChannel(
        options,
        (error, response) => this.publishCallback(error, response),
      );
    } catch (err) {
      console.error('Unable to publish feed', err);
    }
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
    this.streamAudio = !this.streamAudio;
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
