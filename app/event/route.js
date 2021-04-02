import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import RTSEvent from '../models/event';

export default class EventRoute extends Route {
    @service('manifest')
    manifestService;

    @service('phenix-channel-express')
    channelExpressService;

    async model(params) {
        await this.manifestService.getManifest(params.event_id);
        const {event} = this.manifestService;
        const model = new RTSEvent(event);
        const {connectionInfo: {tokenUrl}} = model;

        this.channelExpressService.tokenUrl = tokenUrl;

        return model;
    }
}
