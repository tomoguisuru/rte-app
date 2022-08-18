import ApplicationAdapter from './application';

export default class EventPublicAdapter extends ApplicationAdapter {
  urlForFindAll() {
    let baseUrl = this.buildURL('event');
    return `${baseUrl}/list`;
  }
}
