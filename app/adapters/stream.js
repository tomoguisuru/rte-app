import ApplicationAdapter from './application';

export default class StreamAdapter extends ApplicationAdapter {
  async leave(model) {
    const url = `${this.host}/streams/${model.id}/leave`;
    const data = { timestamp: Math.trunc(Date.now() / 1000) };

    return this.ajax(url, 'post', { data });
  }

  async ready(model) {
    const url = `${this.host}/streams/${model.id}/ready`;
    const data = { timestamp: Math.trunc(Date.now() / 1000) };

    return this.ajax(url, 'post', { data });
  }
}
