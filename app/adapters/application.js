import RESTAdapter from '@ember-data/adapter/rest';

export default class ApplicationAdapter extends RESTAdapter {
    host = 'https://api.example.com';
}
