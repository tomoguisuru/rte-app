import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { tracked } from '@glimmer/tracking';

import { ROOM_ROLLS } from 'client-app/services/room';

export default class RoomsJoinController extends Controller {
  @service store;
  @service router;
  @service('room') roomService;

  @tracked errorMessage = '';
  @tracked hasPublisher = false;
  @tracked model = null;
  @tracked screenName = '';

  publisher = null;

  roomId = null;

  get roomExpress() {
    return this.roomService.roomExpress;
  }

  onConnect(error, response) {
    if (error) {
      // Handle error
    }

    if (response.status !== 'ok') {
      // Handle error
    }

    // Successfully published to room
    if (response.status === 'ok' && response.publisher) {
      // Do something with publisher
      this.publisher = response.publisher;
    }
  }

  @action
  async onJoin(userMediaStream, videoElement) {
    try {
      await this.roomService.join(
        {
          role: ROOM_ROLLS.PRESENTER,
          screenName: this.screenName,
        },
      );

      const options = {
        userMediaStream,
        videoElement,
        room: {
          name: this.model.roomName,
          alias: this.model.alias,
        },
        streamType: 'User',
        memberRole: ROOM_ROLLS.PARTICIPANT,
        publishToken: await this.roomService.getToken('publish'),
      }

      this.roomService.publish(options);
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  @action
  async onLeave() {
    if (this.publisher) {
      try {
        await this.publisher.stop();
        this.publisher = null;
      } catch (err) {
        console.debug(err);
      }
    }

    this.roomService.leave();
  }
}
