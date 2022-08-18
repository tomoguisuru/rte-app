import Model, { attr, belongsTo } from '@ember-data/model';

export default class StreamModel extends Model {
  @attr('string') alias;
  @attr('string') roomId;
  @attr('string') roomName;
  @attr('string') desc;
  @attr('string') eventId;
  @attr('string') title;

  @belongsTo('event') event;
  @belongsTo('user') user;

  async leaveStream() {
    const adapter = this.store.adapterFor('stream');
    return adapter.leave(this);
  }

  async readyStream() {
    const adapter = this.store.adapterFor('stream');
    return adapter.ready(this);
  }
}
