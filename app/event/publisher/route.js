import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class PublisherRoute extends Route {
    @service('manifest')
    manifestService;

    beforeModel() {
        this.manifestService.includeStaged = true;
    }

    async setupController(controller, model) {
        super.setupController(controller, model);

        if (controller && model) {
            controller.streams = model.streams;
        }
    }
}
