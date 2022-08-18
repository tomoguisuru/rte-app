import ApplicationSerializer from "./application";

export default class PublicEventSerializer extends ApplicationSerializer {
  normalizeResponse(store, primaryModelClass, payload) {
    // if ('events' in payload) {
    //   Object.assign(payload, { 'pevents': payload.items });
    // }

    // delete payload.items;
    delete payload.total_items;

    return super.normalizeResponse(...arguments);
  }
}
