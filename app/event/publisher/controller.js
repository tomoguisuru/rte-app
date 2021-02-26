import Controller from '@ember/controller';
import {tracked} from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PublisherController extends Controller {
    footerCenterControls = document.getElementById('footer_center_controls');

    @tracked showPublisher = true;

    @action
    togglePublisher() {
        this.toggleProperty('showPublisher');
    }
}
