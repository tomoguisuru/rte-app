import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

import AuthParams from '../utils/auth-params'

export default class EventRoute extends Route {
    @service('manifest')
    manifestService;

    async model(params) {
        return this.manifestService.getManifest(params.event_id);
    }

    async setupController(controller, model) {
        super.setupController(controller, model);

        if (controller && model) {
            const {authenticationData} = model.adminProxyClient;
            const {channelExpressService} = controller;
            Object.assign(authenticationData, AuthParams);

            channelExpressService.setup(model);

            controller.channelExpress = channelExpressService.createChannelExpress();
            controller.streams = model.streams;
        }
    }
}
