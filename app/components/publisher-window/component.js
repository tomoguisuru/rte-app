import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublisherWindowComponent extends Component {
  @tracked streamAudio = true;
  @tracked streamVideo = true;

  @tracked audioInputOptions = [];
  @tracked audioOutputOptions = [];
  @tracked videoInputOptions = [];

  @tracked selectedAudioInput = null;
  @tracked selectedVideoInput = null;

  get videoElement() {
    return document.getElementById('publisherStream');
  }

  constructor() {
    super(...arguments);

    this.getUserMediaSources();
  }

  async willDestroy() {
    this.mediaStream.getTracks().forEach(t => t.stop());

    this.mediaStream = null;

    super.willDestroy(...arguments);
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

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints,
      );
    } catch {
      // this.mediaStream = null;
    }
  }

  stopTrack(kind = null) {
    const { srcObject } = this.videoElement;

    if (!srcObject) {
      return;
    }

    let tracks = srcObject.getTracks();

    if (kind) {
      tracks = tracks.filter(t => t.kind === kind);
    }

    tracks.forEach(t => t.stop());
  }

  async updateStream(kind = null) {
    this.stopTrack(kind);
    await this.getUserMedia();

    this.videoElement.srcObject = this.mediaStream;
  }

  /**********************/
  /*      Actions       */
  /**********************/

  @action
  async onJoin() {
    if (this.args.onJoin) {
      this.args.onJoin(this.mediaStream, this.videoElement);
    }
  }

  @action
  async onLeave() {
    if (this.args.onLeave) {
      await this.args.onLeave(this.mediaStream, this.videoElement);
    }

    this.onInsert();
  }

  @action
  async onInsert() {
    this.updateStream();

    this.videoElement.muted = true;
  }

  @action
  toggleAudio() {
    this.streamAudio = !this.streamAudio;
    this.updateStream('audio');

    const { onAudioToggle } = this.args;

    if (onAudioToggle && typeof(onAudioToggle) === 'function') {
      onAudioToggle(this.streamAudio);
    }
  }

  @action
  toggleVideo() {
    this.streamVideo = !this.streamVideo;
    this.updateStream('video');

    const { onVideoToggle } = this.args;

    if (onVideoToggle && typeof(onVideoToggle) === 'function') {
      onVideoToggle(this.streamVideo);
    }
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
