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

  @controller('authenticated.event')
  eventController;

  @tracked hasPublisher = false;

  publisher = null;
  channelExpress = null;

  get domain() {
    return this.eventController.model.domain;
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

  async publishToChannel(userMediaStream, videoElement) {
    const publishOptions = {
      capabilities: [
        this.model.quality,
        'streaming',
        'on-demand',
      ],
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
      // frameRate: 24,
      userMediaStream,
      videoElement,
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

  async reset() {
    if (this.publisher) {
      try {
        await this.publisher.stop();
      } catch (err) {
        console.debug(err);
      }
    }

    try {
      await this.model.leaveStream();
    } catch (err) {
      console.debug(err);
    }

    this.hasJoined = false;
    this.publisher = null;
    this.hasPublisher = false;
    this.channelExpress = null;
  }

  @action
  async publishStream(mediaStream, videoElement) {
    try {
      await this.model.readyStream();
    } catch (e) {
      console.error(e.message);
    }

    if (!this.channelExpress) {
      this.initChannelExpress();
    }

    this.publishToChannel(mediaStream, videoElement);
  }

  @action
  async stop() {
    await this.reset();
  }
}
