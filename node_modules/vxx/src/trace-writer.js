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

var util = require('util');
var traceLabels = require('./trace-labels.js');
var constants = require('./constants.js');
var EventEmitter = require('events').EventEmitter;

var headers = {};
headers[constants.TRACE_AGENT_REQUEST_HEADER] = 1;

/**
 * Creates a basic trace writer.
 * @param {!Logger} logger The Trace Agent's logger object.
 * @param {Object} config A config object containing information about
 *   authorization credentials.
 * @constructor
 */
function TraceWriter(logger, options) {
  options = options || {};

  EventEmitter.call(this);

  /** @private */
  this.logger_ = logger;

  /** @private */
  this.config_ = options;

  /** @private {Array<string>} stringified traces to be published */
  this.buffer_ = [];

  /** @private {Object} default labels to be attached to written spans */
  this.defaultLabels_ = {};

  /** @private {Boolean} whether the trace writer is active */
  this.isActive = true;
}

util.inherits(TraceWriter, EventEmitter);

TraceWriter.prototype.stop = function() {
  this.isActive = false;
};

/**
 * Ensures that all sub spans of the provided spanData are
 * closed and then queues the span data to be published.
 *
 * @param {SpanData} spanData The trace to be queued.
 */
TraceWriter.prototype.writeSpan = function(spanData) {
  for (var i = 0; i < spanData.trace.spans.length; i++) {
    if (spanData.trace.spans[i].endTime === '') {
      spanData.trace.spans[i].close();
    }
  }

  // Copy properties from the default labels.
  for (var k in this.defaultLabels_) {
    if (this.defaultLabels_.hasOwnProperty(k)) {
      spanData.addLabel(k, this.defaultLabels_[k]);
    }
  }
  if (process.env.NODE_ENV === 'test') {
    this.queueTrace_(spanData.trace);
  }

  this.emit('transaction', spanData.trace);
};

/**
 * Buffers the provided trace to be published.
 *
 * @private
 * @param {Trace} trace The trace to be queued.
 */
TraceWriter.prototype.queueTrace_ = function(trace) {
  var that = this;

  that.buffer_.push(JSON.stringify(trace));
  that.logger_.debug('queued trace. new size:', that.buffer_.length);

  // Publish soon if the buffer is getting big
  if (that.buffer_.length >= that.config_.bufferSize) {
    that.logger_.info('Flushing: trace buffer full');
    setImmediate(function() { that.flushBuffer_(); });
  }
};

/**
 * Flushes the buffer of traces at a regular interval
 * controlled by the flushDelay property of this
 * TraceWriter's config.
 */
TraceWriter.prototype.scheduleFlush_ = function() {
  this.logger_.info('Flushing: performing periodic flush');
  this.flushBuffer_();

  // Do it again after delay
  if (this.isActive) {
    setTimeout(this.scheduleFlush_.bind(this),
      this.config_.flushDelaySeconds * 1000).unref();
  }
};

/**
 * Serializes the buffered traces to be published asynchronously.
 *
 * @param {number} projectId The id of the project that traces should publish on.
 */
TraceWriter.prototype.flushBuffer_ = function() {
  if (this.buffer_.length === 0) {
    return;
  }

  // Privatize and clear the buffer.
  var buffer = this.buffer_;
  this.buffer_ = [];
  this.logger_.debug('Flushing traces', buffer);
};

/**
 * Publishes flushed traces to the network.
 *
 * @param {number} projectId The id of the project that traces should publish on.
 * @param {string} json The stringified json representation of the queued traces.
 */
TraceWriter.prototype.publish_ = function(projectId, json) {
  if (process.send) {
    process.send({
      type: 'axm:trace',
      data: json
    });
  }
};

/**
 * Export TraceWriter.
 * FIXME(ofrobots): TraceWriter should be a singleton. We should export
 * a get function that returns the instance instead.
 */
module.exports = TraceWriter;
