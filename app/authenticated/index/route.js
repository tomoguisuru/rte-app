import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class AuthenticatedRoute extends Route {
    @service currentUser;

    async beforeModel() {
        this.transitionTo('authenticated.events');
    }
}