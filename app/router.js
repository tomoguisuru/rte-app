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

    this.route('rooms');
    this.route('room', { path: '/rooms/:room_id' }, function() {
      this.route('join');
    });

    this.route('admin', function() {
      this.route('events', function() {
        this.route('event', { path: '/:event_id' });
      });

      this.route('users', function() {
        this.route('new');
        this.route('edit', { path: '/:user_id/edit' });
      });

      this.route('rooms', function() {
        this.route('new');
        this.route('edit', { path: '/:room_id/edit' });
      });
    });
  });

  this.route('home', function() {
    this.route('login');
  });

  this.route('event', { path: '/event/:event_id' });

  this.route('login');

  this.route('not-found');
});
