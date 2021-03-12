import Route from '@ember/routing/route';

export default class PublisherRoute extends Route {
    async setupController(controller, model) {
        super.setupController(controller, model);

        if (controller && model) {
            controller.streams = model.streams;
        }
    }
}
