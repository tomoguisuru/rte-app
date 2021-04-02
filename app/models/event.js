import {tracked} from '@glimmer/tracking';

export default class RTSEvent {
    @tracked desc;
    @tracked state;
    @tracked title;

    constructor(obj = {}) {
        Object.assign(this, obj);
    }
}