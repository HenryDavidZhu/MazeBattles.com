/**
 * Copyright 2017 Keymetrics. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var debug = console.log;
var LEVELS = ['disabled', 'error', 'warn', 'info', 'debug'];

/**
 * Creates a logger object.
 * @constructor
 */
function Logger (level, name) {
  if (name) {
    debug = require('debug')(typeof name === 'string' ? name : 'vxx');
  }
  this.level = level;
  this.debug('Logger started');
}

Logger.prototype.error = function () {
  if (LEVELS.indexOf('error') <= this.level) {
    debug.apply(this, arguments);
  }
};

Logger.prototype.warn = function () {
  if (LEVELS.indexOf('warn') <= this.level) {
    debug.apply(this, arguments);
  }
};

Logger.prototype.info = function () {
  if (LEVELS.indexOf('info') <= this.level) {
    debug.apply(this, arguments);
  }
};

Logger.prototype.debug = function () {
  if (LEVELS.indexOf('debug') <= this.level) {
    debug.apply(this, arguments);
  }
};

Logger.LEVELS = LEVELS;
module.exports = Logger;
