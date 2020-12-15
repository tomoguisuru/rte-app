import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
// import {tracked} from '@glimmer/tracking';

export default class EventController extends Controller {
    @service('phenix-channel-express')
    channelExpressService;

    // @tracked
    // channelExpress = null;

    // owner = ENV.OWNER_ID;
}
