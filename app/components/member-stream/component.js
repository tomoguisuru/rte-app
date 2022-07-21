import Component from '@glimmer/component';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
// import { tracked } from '@glimmer/tracking';

export default class MemberStreamComponent extends Component {
  @service('room') roomService;

  mediaStream;

  get memberStream() {
    return this.args.mediaStream;
  }

  get roomExpress() {
    return this.roomService.roomExpress;
  }

  get videoElement() {
    return document.getElementById('publisherStream');
  }

  willDestroy() {
    // Disconnect here
    super.willDestroy(...arguments);

    debugger;
  }

  onConnect(error, response) {
    if (error) {
      // Handle error
    }

    if (response.status !== 'ok') {
      // Handle error
    }

    // Successfully subscribed to stream
    if (response.status === 'ok' && response.mediaStream) {
      // Do something with mediaStream
      this.mediaStream = response.mediaStream;
    }
  }

  @action
  async onInsert() {
    // if (!this.roomExpress) {
    //   throw new Error('roomExpress not set');
    // }

    // const options = {
    //   videoElement: this.videoElement,
    //   streamToken: await this.roomService.getToken('stream'),
    // };

    // this.roomExpress.subscribeToMemberStream(
    //   this.memberStream,
    //   options,
    //   (error, response) => this.onConnect(error, response),
    // );
  }
}
