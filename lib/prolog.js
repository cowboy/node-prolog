/*
 * grunt-log
 * https://github.com/gruntjs/grunt-log
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');

var EventEmitter2 = require('eventemitter2').EventEmitter2;
var _ = require('lodash');

// var Muxer = require('./muxer').Muxer;
// var Progress = require('./progress').Progress;

function ProLog(log, options) {
  var self = this;
  // this.Muxer = Muxer;
  // this.Progress = Progress;
  this.event = new EventEmitter2({wildcard: true, maxListeners: 0});
  this.indent = 0;

  // Overriding event.emit allows the "filter" method to modify the "data"
  // object or prevent the event from being emitted. Also, it allows the
  // data.indent property to be modified when a logging event is emitted,
  // which allows chained loggers to accumulate indentation.
  this.event._emit = this.event.emit;
  this.event.emit = function(level, data) {
    var isEvent = self.levels[level] && data && data.level;
    // Don't emit if the "filter" method returns false.
    if (isEvent && self.filter && self.filter(data) === false) { return; }
    // Modify the data object, adding the correct indentation.
    var selfIndent = self.indent;
    var indent = isEvent && typeof data.indent === 'number' && selfIndent !== 0;
    if (indent) { data.indent += selfIndent; }
    var result = self.event._emit.apply(this, arguments);
    if (indent) { data.indent -= selfIndent; }
    return result;
  };

  // Call output function if specified.
  this.event.onAny(function(data) {
    if (self.output) { self.output(data); }
  });

  if (log instanceof ProLog) {
    // Forward all logging events to the specified logger.
    this.forwardLogEventsTo(log);
    // Override log levels with explicitly-specified levels.
    this.levels = _.defaults({}, options && options.levels, log.levels);
    options = _.extend({}, this.defaults, {output: false}, options);
  } else {
    options = log;
    log = null;
    // Either use explicitly-specified levels or use defaults.
    this.levels = options && options.levels || this.defaults.levels;
    options = _.extend({}, this.defaults, options);
  }
  // Override default methods?
  if (options.format) { this.format = options.format; }
  if (options.filter) { this.filter = options.filter; }
  if (_.isFunction(options.output)) { this.output = options.output; }
  else if (!options.output) { this.output = null; }
  // Create level-named method(s) for each specified logging level,
  // removing any falsy (null) levels.
  _.each(this.levels, function(format, name, obj) {
    if (format) {
      self._addLevel(name);
    } else {
      delete obj[name];
    }
  });
}

exports.ProLog = ProLog;

ProLog.prototype.defaults = {
  levels: {
    log: '[log] %s%s',
    info: '[inf] %s%s',
    debug: '[dbg] %s%s',
    warn: '[wrn] %s%s',
    error: '[err] %s%s',
  },
  output: true,
  format: null,
  filter: null,
};

// Log each message to the console using the specified formatter, logging
// "warn" and "error" to stderr, and everything else to stdout.
ProLog.prototype.output = function(data) {
  var logger = /error|warn/.test(data.level) ? console.error : console.log;
  logger(this.format(data));
};

// Default message formatter.
ProLog.prototype.format = function(data) {
  var pad = data.indent === 0 ? '' : new Array(data.indent + 1).join('  ');
  return data.message.split('\n').map(function(line) {
    return util.format(data.format, pad, line);
  }).join('\n');
};

// Optionally modify logging event "data" objects or prevent logging events
// from being emitted.
ProLog.prototype.filter = null;

// Forward all logging events to the specified logger.
ProLog.prototype.forwardLogEventsTo = function(recipient) {
  var self = this;
  this.event.onAny(function(data) {
    if (self.levels[this.event] && data && data.level) {
      recipient.event.emit(data.level, data);
    }
  });
};

// Increase indentation.
ProLog.prototype.group = function() {
  this.indent++;
  return this;
};

// Decrease indentation.
ProLog.prototype.groupEnd = function() {
  if (--this.indent < 0) { this.indent = 0; }
  return this;
};

// Create level-named method(s) for the specified logging level.
ProLog.prototype._addLevel = function(name) {
  var self = this;
  // var level =
  this[name] = function() {
    var data = {
      logger: self,
      level: name,
      timeStamp: +new Date(),
      indent: 0, // Incremented when event is emitted
      args: _.toArray(arguments),
      message: util.format.apply(util, arguments),
      format: self.levels[name],
    };
    this.event.emit(name, data);
    return self;
  };
  // level.progress = function(prefix) {
  //   return new self.Progress(prefix, {
  //     logger: level.bind(null, '%s')
  //   });
  // };
};
