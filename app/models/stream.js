import Model, { attr, belongsTo } from '@ember-data/model';

export default class StreamModel extends Model {
  @attr('string') alias;
  @attr('string') channelId;
  @attr('string') channelName;
  @attr('string') desc;
  @attr('string') eventId;
  @attr('string') ready;
  @attr('string') quality;
  @attr('string') title;
  @attr('string') userId;

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
