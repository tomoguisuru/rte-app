import Service, { inject as service } from '@ember/service';

export default class CurrentUserService extends Service {
    @service('rts-api') api;

    user = null;

    async setCurrentUser() {
        const resp = await this.api.request('/users/me');
        this.user = resp.user;
    }

    clear() {
        this.user = null;
    }
}