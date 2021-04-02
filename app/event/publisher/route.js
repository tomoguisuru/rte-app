import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class PublisherRoute extends Route {
    @service('manifest')
    manifestService;

    beforeModel() {
        this.manifestService.includeStaged = true;
    }
}
