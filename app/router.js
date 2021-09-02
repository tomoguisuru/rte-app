import EmberRouter from '@ember/routing/router';
import config from 'client-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

<<<<<<< HEAD
Router.map(function() {
  this.route('authenticated', { path: '/' }, function() {
    this.route('events');

    this.route('event', { path: '/events/:event_id' }, function() {
      this.route('publisher');
      this.route('pub');
    });
  });

  this.route('event', { path: '/event/:event_id'}, function() {
    this.route('publisher');
  });

  this.route('login');

  this.route('not-found');
});
=======
Router.map(function () {});
>>>>>>> 4771af4 (v3.22.0...v3.28.0)
