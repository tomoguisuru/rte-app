import { A } from '@ember/array';
import Service, { inject as service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import sdk from 'phenix-web-sdk';

const ALLOWED_PARAMS = [
  'capabilities',
  'expiresAt',
  'expiresIn',
  'originStreamId',
  'sessionId',
  'tags',
];

export const ROOM_ROLLS = {
  PARTICIPANT: 'Participant', // Member with streams and is visible to all members.
  AUDIENCE: 'Audience',       // Member with no streams and is not visible to other members.
  PRESENTER: 'Presenter',     // Presenter participant member.
  MODERATOR: 'Moderator',     // Privileged participant member.
}

export default class RoomService extends Service {
  @service('rts-api') api;

  @tracked isProcessing = false;

  @tracked members = A([]);
  @tracked room = null;
  @tracked roomService = null;
  @tracked publisher = null;
  @tracked screenName = '';

  roomExpress = null;

  get isJoined() {
    return !!this.roomService;
  }

  get sessionId() {
    return this.roomExpress?.getPCastExpress()
      .getSessionIdObservable()
      .getValue();
  }

  async createRoomExpress(room, options = {}) {
    const {
      tokenOptions = {},
      roomOptions = {},
    } = options;

    this.room = room;

    const authToken = await this.getToken('auth', tokenOptions);

    this.roomExpress = new sdk.express.RoomExpress({
      ...roomOptions,
      authToken,
    });
  }

  leave() {
    this.roomExpress.dispose();
    this.roomExpress = null;
  }

  join(options = {}) {
    console.debug('Join Options: ', options);

    const p = new Promise((resolve, reject) => {
      try {
        if (!options.screenName || options.screenName?.length === 0) {
          throw new Error('"screenName" is required in options');
        }

        this.isProcessing = true;

        options = Object.assign(
          {
            role: ROOM_ROLLS.AUDIENCE,
          },
          options,
          {
            alias: this.room.alias,
          },
        );

        this.roomExpress.joinRoom(
          options,
          (error, response) => this.onJoinRoom(error, response, resolve),
          members => this.onMembersChanged(members),
        );
      } catch (err) {
        console.error(err.message);
        reject(new Error('An error occurred when attempting to join room'));
      }
    });

    p.then(() => this.isProcessing == false);

    return p;
  }

  publish(options = {}) {
    const p = new Promise((resolve, reject) => {
      console.debug('Publish Options: ', options);

      try {
        this.isProcessing = true;

        this.roomExpress.publishToRoom(
          options,
          (error, response) => this.onPublish(error, response, resolve),
        );
      } catch (err) {
        console.error(err.message);
        reject(new Error('An error occurred when attempting to join room'));
      }
    });

    p.then(() => this.isProcessing == false);

    return p;
  }

  async getToken(type, options = {}) {
    if (!this.room) {
      throw new Error('Unable to request token.');
    }

    if (this.sessionId) {
      options['sessionId'] = this.sessionId;
    }

    const url = `/rooms/${this.room.id}/token/${type}`;
    // const { tags = [] } = options;

    // if (!tags.includes(this.clientTag)) {
    //   tags.push(this.clientTag);
    // }

    const resp = await this.api.request(
      url,
      'post',
      this.filterOptions(options),
    );

    if (!('token' in resp)) {
      throw new Error('Unable to retrieve token');
    }

    return resp.token;
  }

  onJoinRoom(error, response, resolve) {
    if (error) {
      console.error(error.message);
      throw new Error('Unknown error!');
    }

    if (response.status === 'room-not-found') {
      throw new Error('Cannot join. Room does not exist.');
    } else if (response.status !== 'ok') {
      // Handle error
      console.error(response.status);
      throw new Error('Room status not OK');
    }

    // Successfully joined room
    if (response.status === 'ok' && response.roomService) {
      this.roomService = response.roomService;
      this.members = A([]);
      resolve();
    }
  }

  onMembersChanged(members = []) {
    console.debug('Members: ', members);
    const mapped = members.map(m => this.mapMember(m));

    this.addMembers(mapped);
    this.removeMembers(mapped);
  }

  onPublish(error, response, resolve) {
    if (error) {
      // Handle error
      throw new Error('Unknown error!');
    }

    if (response.status !== 'ok') {
      // Handle error
      console.error(response);
      throw new Error('Cannot publish.');
    }

    // Successfully published to room
    if (response.status === 'ok' && response.publisher) {
      // Do something with publisher
      this.publisher = response.publisher;
      resolve();
    }
  }

  filterOptions(options) {
    const data = {};

    ALLOWED_PARAMS.forEach(k => {
      const value = options[k];

      if (value) {
        data[k] = value;
      }
    });

    return data;
  }

  addMembers(mapped) {
    const ids = this.members.map(m => m.id);

    // Add members
    mapped.forEach(m => {
      if (!(ids.includes(m.id))) {
        this.members.addObject(m);
      }
    });
  }

  removeMembers(mapped) {
    const mappedIds = mapped.map(m => m.id);
    const ids = this.members.map(m => m.id);

    ids.filter(id => !mappedIds.includes(id))
      .forEach(id => {
        const m = this.members.find(m => m.id === id);
        this.members.removeObject(m);
      });
  }

  mapMember(data) {
    return {
      id: data.getSessionId(),
      role: data.getObservableRole().getValue(),
      screenName: data.getObservableScreenName().getValue(),
      streams: data.getObservableStreams().getValue(),
    }
  }
}
