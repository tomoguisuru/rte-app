import Model, { attr, belongsTo }from '@ember-data/model';

export default class StreamModel extends Model {
  @attr('string') alias;
  @attr('string') channelId;
  @attr('string') channelName;
  @attr('string') desc;
  @attr('string') ready;
  @attr('string') streamQuality;
  @attr('string') title;

  @belongsTo('event') event;

  async readyStream() {
    const adapter = this.store.adapterFor('stream');
    return adapter.ready(this);
  }
}
