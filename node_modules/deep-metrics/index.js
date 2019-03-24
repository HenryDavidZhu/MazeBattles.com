/*******************************************************************************
 * Copyright 2014, 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
'use strict';

var VERSION = require('./package.json').version;
var assert = require('assert');
var path = require('path');
var main_filename = require.main != null ? require.main.filename : '';
var module_dir = path.dirname(module.filename);
var aspect = require('./lib/aspect.js');
var request = require('./lib/request.js');
var fs = require('fs');
var EventEmitter = require('events');
var Emitter = new EventEmitter();

var probes = [];
var traceProbe;

var dirPath = path.join(__dirname, 'probes');
var files = fs.readdirSync(dirPath);

files.forEach(function(fileName) {
  var file = path.join(dirPath, fileName);
  var probeModule = new (require(file))();
  if (probeModule.name === 'trace') {
    traceProbe = probeModule;
  } else {
    probes.push(probeModule);
  }
});

var latencyData = {
  count: 0,
  min: 1 * 60 * 1000,
  max: 0,
  total: 0
};

var latencyCheck = function() {
  var start = process.hrtime();
  setImmediate(function(start) {
    var delta = process.hrtime(start);
    var latency = delta[0] * 1000 + delta[1] / 1000000;
    latencyData.count++;
    latencyData.min = Math.min(latencyData.min, latency);
    latencyData.max = Math.max(latencyData.max, latency);
    latencyData.total = latencyData.total + latency;
  }, start);
};

var latencyReport = function() {
  if (latencyData.count == 0) return;
  var latency = {
    min: latencyData.min,
    max: latencyData.max,
    avg: latencyData.total / latencyData.count,
  };
  module.exports.emit('eventloop', { time: Date.now(), latency: latency });
  latencyData.count = 0;
  latencyData.min = 1 * 60 * 1000;
  latencyData.max = 0;
  latencyData.total = 0;
};

var latencyCheckInterval = 500;
var latencyReportInterval = 5000;
var latencyRunning = true;
var latencyCheckLoop = setInterval(latencyCheck, latencyCheckInterval);
var latencyReportLoop = setInterval(latencyReport, latencyReportInterval);
latencyCheckLoop.unref();
latencyReportLoop.unref();


/*
 * Patch the module require function to run the probe attach function
 * for any matching module. This loads the monitoring probes into the modules
 */
var data = {};

/* eslint no-proto:0 */
aspect.after(module.__proto__, 'require', data, function(obj, methodName, args, context, ret) {
  if (ret == null || ret.__ddProbeAttached__) {
    return ret;
  } else {
    for (var i = 0; i < probes.length; i++) {
      if (probes[i].name === args[0]) {
        ret = probes[i].attach(args[0], ret, module.exports);
      }
      if (probes[i].name === 'trace') {
        ret = probes[i].attach(args[0], ret);
      }
    }
    return ret;
  }
});

/*
 * Provide API to enable data collection for a given data type.
 * Profiling is done via a control message to the core monitoring agent.
 * Requests require asking all probes to enable request events
 * Other requests are passed to any probe matching the name
 */
module.exports.enable = function(data, config) {
  switch (data) {
  case 'requests':
    probes.forEach(function(probe) {
      probe.enableRequests();
    });
    break;
  case 'trace':
    if (probes.indexOf(traceProbe) === -1) {
      probes.push(traceProbe);
    }
    traceProbe.enable();
    break;
  case 'eventloop':
    if (latencyRunning === true) break;
    latencyRunning = true;
    latencyCheckLoop = setInterval(latencyCheck, latencyCheckInterval);
    latencyReportLoop = setInterval(latencyReport, latencyReportInterval);
    break;
  default:
    probes.forEach(function(probe) {
      if (probe.name == data) {
        probe.enable();
      }
    });
  }
};

module.exports.ee = Emitter;

/*
 * Provide API to disable data collection for a given data type.
 * Profiling is done via a control message to the core monitoring agent.
 * Requests require asking all probes to disable request events
 * Other requests are passed to any probe matching the name
 */
module.exports.disable = function(data) {
  switch (data) {
  case 'requests':
    probes.forEach(function(probe) {
      probe.disableRequests();
    });
    break;
  case 'eventloop':
    if (latencyRunning === false) break;
    latencyRunning = false;
    clearInterval(latencyCheckLoop);
    clearInterval(latencyReportLoop);
    break;
  default:
    probes.forEach(function(probe) {
      if (probe.name == data) {
        probe.disable();
      }
    });
  }
};

// Export emit() API for JS data providers
module.exports.emit = function(topic, data) {
  data = JSON.stringify(data);
  Emitter.emit(topic, data);
};

// Export monitor() API for consuming data in-process
module.exports.monitor = function() {
  this.start();
};

module.exports.start = function start() {
  process.on('exit', function() {
    // take the event loop latency methods off the loop
    if (latencyRunning === true) {
      clearInterval(latencyCheckLoop);
      clearInterval(latencyReportLoop);
    }
  });

  // Start the probes
  probes.forEach(function(probe) {
    probe.start();
  });

  return this;
};
