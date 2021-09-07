/* eslint-env node */

'use strict';

const path = require('path');

module.exports = function (env) {
  let _path = path.join(path.dirname(__dirname), `.env`);

  if (!['production', 'prod'].includes(env)) {
    _path += `.${env}`;
  }

  return {
    clientAllowedKeys: [],
    fastbootAllowedKeys: [],
    failOnMissingKey: false,
    path: _path,
  };
};
