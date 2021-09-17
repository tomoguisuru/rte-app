import EmberRouter from '@ember/routing/router';
import config from 'client-app/config/environment';

export default class Router extends EmberRouter {
    location = config.locationType;
    rootURL = config.rootURL;
}

Router.map(function () {
  this.route('authenticated', { path: '/' }, function () {
    this.route('events');

    this.route('event', { path: '/events/:event_id' }, function () {
      this.route('publisher');
    });

    this.route('admin', function() {
      this.route('events', function() {
        this.route('event', { path: '/:event_id' });
      });

      this.route('users');
    });
  });

  this.route('event', { path: '/event/:event_id' });

  this.route('login');

  this.route('not-found');
});
