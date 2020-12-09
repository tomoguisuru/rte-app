import Controller from '@ember/controller';
import ENV from 'client-app/config/environment';

export default class ApplicationController extends Controller {
    owner = ENV.OWNER_ID;
}
