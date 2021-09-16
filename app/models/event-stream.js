import Model, { belongsTo }from '@ember-data/model';

export default class EventStreamModel extends Model {
    @belongsTo('event') event;
    @belongsTo('owner') owner;
    @belongsTo('stream') stream;
    @belongsTo('user') user;
}
