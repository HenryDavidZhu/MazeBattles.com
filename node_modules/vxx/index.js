/**
 * Copyright 2015 Google Inc. All Rights Reserved.
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

/**
 * This file has been modified by Keymetrics
 */

'use strict';

var filesLoadedBeforeTrace = Object.keys(require.cache);

// Load continuation-local-storage first to ensure the core async APIs get
// patched before any user-land modules get loaded.
require('continuation-local-storage');

var Logger = require('./src/logger.js');
var extend = require('extend');
var constants = require('./src/constants.js');
var traceUtil = require('./src/util.js');
var TraceApi = require('./src/trace-api.js');
var pluginLoader = require('./src/trace-plugin-loader.js');

var modulesLoadedBeforeTrace = [];

for (var i = 0; i < filesLoadedBeforeTrace.length; i++) {
  var moduleName = traceUtil.packageNameFromPath(filesLoadedBeforeTrace[i]);
  if (moduleName && moduleName !== 'vxx' &&
      modulesLoadedBeforeTrace.indexOf(moduleName) === -1) {
    modulesLoadedBeforeTrace.push(moduleName);
  }
}

var onUncaughtExceptionValues = ['ignore', 'flush', 'flushAndExit'];

var initConfig = function(projectConfig) {
  var config = extend(true, {}, require('./config.js'), projectConfig);
  if (config.maximumLabelValueSize > constants.TRACE_SERVICE_LABEL_VALUE_LIMIT) {
    config.maximumLabelValueSize = constants.TRACE_SERVICE_LABEL_VALUE_LIMIT;
  }
  return config;
};

var traceApi = new TraceApi('Custom Span API');
var agent;

/**
 * Start the Trace agent that will make your application available for
 * tracing with Stackdriver Trace.
 *
 * @param {object=} config - Trace configuration
 *
 * @resource [Introductory video]{@link
 * https://www.youtube.com/watch?v=NCFDqeo7AeY}
 *
 * @example
 * trace.start();
 */
function start(projectConfig) {
  var config = initConfig(projectConfig);

  if (traceApi.isActive() && !config.forceNewAgent_) { // already started.
    throw new Error('Cannot call start on an already started agent.');
  }

  if (!config.enabled) {
    return traceApi;
  }

  if (config.logLevel < 0) {
    config.logLevel = 0;
  } else if (config.logLevel >= Logger.LEVELS.length) {
    config.logLevel = Logger.LEVELS.length - 1;
  }
  var logger = new Logger(config.logLevel, config.logger === 'debug' ? 'vxx' : undefined);

  if (onUncaughtExceptionValues.indexOf(config.onUncaughtException) === -1) {
    logger.error('The value of onUncaughtException should be one of ',
      onUncaughtExceptionValues);
    throw new Error('Invalid value for onUncaughtException configuration.');
  }

  var headers = {};
  headers[constants.TRACE_AGENT_REQUEST_HEADER] = 1;

  if (modulesLoadedBeforeTrace.length > 0) {
    logger.warn('Tracing might not work as the following modules ' +
      'were loaded before the trace agent was initialized: ' +
      JSON.stringify(modulesLoadedBeforeTrace));
  }

  agent = require('./src/trace-agent.js').get(config, logger);
  traceApi.enable_(agent);
  pluginLoader.activate(agent);

  traceApi.getCls = function() {
    return agent.getCls();
  };

  traceApi.getBus = function() {
    return agent.traceWriter;
  };

  return traceApi;
}

function get() {
  return traceApi;
}

global._google_trace_agent = traceApi;
module.exports = {
  start: start,
  get: get
};

// If the module was --require'd from the command line, start the agent.
if (module.parent && module.parent.id === 'internal/preload') {
  module.exports.start();
}
