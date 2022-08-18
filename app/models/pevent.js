import Model, { attr, hasMany }from '@ember-data/model';

export default class PublicEventModel extends Model {
    @attr('string') desc;
    @attr('string') title;
    @attr('string') state;

    @hasMany('stream') streams;
}
