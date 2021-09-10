import ApplicationSerializer from "./application";

export default class EventSerializer extends ApplicationSerializer {
  normalizeResponse(store, primaryModelClass, payload) {
    if ('items' in payload) {
      Object.assign(payload, { events: payload.items });

      delete payload.items;
    }

    return super.normalizeResponse(...arguments);
  }
}
