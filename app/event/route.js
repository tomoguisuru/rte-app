import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

// import AuthParams from '../utils/auth-params'

export default class EventRoute extends Route {
    @service('manifest')
    manifestService;

    @service('phenix-channel-express')
    channelExpressService;

    async model(params) {
        const model = await this.manifestService.getManifest(params.event_id);
        const {connectionInfo: {tokenUrl}} = model;

        this.channelExpressService.tokenUrl = tokenUrl;

        return model;
    }
}
