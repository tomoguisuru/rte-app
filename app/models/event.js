import Model, { attr, hasMany }from '@ember-data/model';

export default class EventModel extends Model {
    @attr('string') desc;
    @attr('string') title;
    @attr('string') state;

    @hasMany('stream') streams;
}
