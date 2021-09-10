import ApplicationAdapter from './application';

export default class StreamAdapter extends ApplicationAdapter {
  async ready(model) {
    const url = `${this.host}/streams/${model.id}/ready`;
    const data = { timestamp: 0 };

    return this.ajax(url, 'post', { data });
  }
}
