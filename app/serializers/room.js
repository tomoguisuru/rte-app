import ApplicationSerializer from "./application";

export default class RoomSerializer extends ApplicationSerializer {
  normalizeResponse(store, primaryModelClass, payload) {
    if ('items' in payload) {
      Object.assign(payload, { rooms: payload.items });

      delete payload.items;
    }

    return super.normalizeResponse(...arguments);
  }
}
