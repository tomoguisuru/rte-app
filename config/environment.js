'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'client-app',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      API_HOST: process.env.API_HOST,
      SERVICES: {
        OWNER_ID: process.env.CMS_OWNER_ID,
        API_HOST: process.env.CMS_HOST,
        API_V4: `${process.env.CMS_HOST}/api/v4`,
        API_KEY: process.env.CMS_API_KEY,
      },
    },
    contentSecurityPolicy: {
      'default-src': ["'none'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'connect-src': [
        "'self'",
        'http://*.localhost:3000',
        'http://localhost:3000',
        'http://*.localhost:4200',
        'http://localhost:4200',
      ],
      'img-src': ["'self'", 'data:'],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com/',
      ],
      'media-src': ["'self'"],
    },
  };

  // ENV['ember-simple-auth'] = {
  //   routeAfterAuthentication: '/events',
  //   routeIfAlreadyAuthenticated: '/events',
  // };

  // ENV['ember-simple-auth-token'] = {
  //   authorizationHeaderName: 'Authorization', // Header name added to each API request
  //   authorizationPrefix: 'Bearer ', // Prefix added to each API request
  //   refreshAccessTokens: true,
  //   refreshTokenPropertyName: 'refreshToken',
  //   refreshLeeway: 300, // refresh 5 minutes
  //   serverTokenEndpoint: `${ENV.APP.API_HOST}/users/login`,
  //   serverTokenRefreshEndpoint: `${ENV.APP.API_HOST}/auth/token/refresh`,
  //   tokenPropertyName: 'token',
  // };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    // ENV['ember-simple-auth-token'] = {
    //   refreshAccessTokens: false,
    //   tokenExpirationInvalidateSession: false,
    // };
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
