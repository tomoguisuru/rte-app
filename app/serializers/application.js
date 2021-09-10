import RESTSerializer from '@ember-data/serializer/rest';
import { underscore } from '@ember/string';

export default class ApplicationSerializer extends RESTSerializer {
  keyForAttribute(attr, method) {
    return underscore(attr);
  }

  keyForRelationship(key, relationship, method) {
    key = underscore(key);

    if (relationship === 'belongsTo') {
      return `${key}_id`;
    } else {
      return `${key}_ids`;
    }
  }
}
