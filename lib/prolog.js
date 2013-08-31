/*
 * grunt-log
 * https://github.com/gruntjs/grunt-log
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var _ = require('lodash');
var $ = require('chalk');

// var Muxer = require('./muxer').Muxer;
var Progress = require('./progress').Progress;

function ProLog(log, options) {
  if (!(this instanceof ProLog)) { return new ProLog(log, options); }
  ProLog.super_.call(this);

  // this.Muxer = Muxer;
  this.Progress = Progress;
  this._indent = 0;
  this._timers = {};

  // If an output function if specified, call it for every 'log' event.
  this.on('log', function(data) { // TODO: remove?
    if (this.output) { this.output(data); }
  });

  var levels;
  if (log instanceof ProLog) {
    // Forward all log events to the specified logger.
    this.on('log', log.emit.bind(log, 'log'));
    // Override log levels with explicitly-specified levels.
    levels = _.defaults({}, options && options.levels, log._levels);
    // Override defaults, defaulting "output" to false.
    options = _.extend({}, this.defaults, {output: false}, options);
  } else {
    // Shuffle arguments.
    options = log;
    log = null;
    // Either use explicitly-specified levels or use defaults.
    levels = options && options.levels || this.defaults.levels;
    // Override defaults.
    options = _.extend({}, this.defaults, options);
  }
  // Init levels.
  this._levels = {};
  this.initLevels(levels);

  // Override default methods?
  if (options.filter) { this.filter = options.filter; }

  // If a function, override the default method with it. If true, just use
  // the default method. If falsy, don't use it (disabling that feature).
  [
    'output',
    'format',
    'formatDate',
    'formatDebug',
    'formatPadding',
  ].forEach(function(method) {
    if (_.isFunction(options[method])) { this[method] = options[method]; }
    else if (!options[method]) { this[method] = null; }
  }, this);

  this.timeLevel = options.timeLevel;
  this.groupLevel = options.groupLevel;
}

util.inherits(ProLog, EventEmitter);
exports.ProLog = ProLog;

// Internal helper function for creating default logging levels.
function getFormat(options) {
  options = _.defaults({}, options, {
    level: '????',
    message: '${message}',
  });
  return '<% if (date) { %>' + $.gray('${date}') + '<% } %>' +
    options.level + ' ' +
    '<% if (padding) { %>' + $.gray('${padding}') + '<% } %>' +
    options.message +
    '<% if (debug) { %>' + $.gray('${debug}') + '<% } %>';
}

ProLog.prototype.defaults = {
  levels: {
    silly:   {priority: 0, format: getFormat({level: $.black.bgWhite('sill')})},
    verbose: {priority: 1, format: getFormat({level: $.blue('verb')})},
    info:    {priority: 2, format: getFormat({level: $.cyan('info')})},
    data:    {priority: 3, format: getFormat({level: $.green('data')})},
    warn:    {priority: 4, format: getFormat({level: $.yellow('warn')})},
    debug:   {priority: 5, format: getFormat({level: $.magenta('dbug') })},
    error:   {priority: 6, format: getFormat({level: $.white.bgRed('ERR!'), message: $.red('${message}')})},
    header:  {priority: 2, format: getFormat({level: '>>>>', message: $.underline('${message}')})},
    spacer:  {priority: 2, format: ''},
  },
  timeLevel: 'header',
  groupLevel: 'header',
  output: true,
  format: true,
  formatDate: false,
  formatDebug: false,
  formatPadding: true,
};

// Overriding the .emit method allows the filter method to modify the data
// object or prevent the event from being emitted. Also, it allows the
// data.indent property to be modified when a logging event is emitted,
// which allows chained loggers to accumulate indentation.
ProLog.prototype.emit = function(event, data) {
  var isLog = event === 'log' && data && data.level;
  // Don't emit if the "filter" method returns false.
  if (isLog && this.filter && this.filter(data) === false) { return; }
  // Modify the data object, adding the correct indentation.
  var _indent = this._indent;
  var indent = isLog && typeof data.indent === 'number' && _indent !== 0;
  if (indent) { data.indent += _indent; }
  var result = ProLog.super_.prototype.emit.apply(this, arguments);
  if (indent) { data.indent -= _indent; }
  return result;
};

// Log each message to the console using the specified formatter, sending
// "warn" and "error" to stderr, and everything else to stdout. If format
// is false, output JSON.
ProLog.prototype.output = function(data) {
  var logger = /error|warn/.test(data.level) ? console.error : console.log;
  logger(this.format ? this.format(data) : JSON.stringify(data));
};

// Default message formatter.
ProLog.prototype.format = function(data) {
  // Iterate over each line in the message.
  return this.eachLine(data.message, function(line, index) {
    // Format message based on an augmented data object.
    var dataPlus = this.dataPlus(data, {message: line, index: index});
    return data.format(dataPlus);
  });
};

// Convenience method for simplifying multi-line formatting.
ProLog.prototype.eachLine = function(lines, formatter) {
  return lines.split('\n').map(formatter, this).join('\n');
};

// Augment a standard log data object with additional properties to make
// logging output much more EXCITING
ProLog.prototype.dataPlus = function(data, options) {
  options = _.defaults({}, options, {index: -1});
  var dataPlus = Object.create(data);
  // Add a few method-based properties.
  var self = this;
  ['Date', 'Debug', 'Padding'].forEach(function(name) {
    var method = 'format' + name;
    Object.defineProperty(dataPlus, name.toLowerCase(), {
      configurable: true,
      get: function() {
        return self[method] && self[method](dataPlus, options.index);
      },
    });
  });
  // Add EVEN MORE properties.
  Object.keys(options).forEach(function(prop) {
    Object.defineProperty(dataPlus, prop, {
      writable: true,
      configurable: true,
      value: options[prop],
    });
  });
  return dataPlus;
};

// Make the date look pretty. Return null to omit this.
ProLog.prototype.formatDate = function(data) {
  return '[' + new Date(data.timeStamp).toISOString() + '] ';
};

// A little stack info to help with debugging. Return null to omit this.
ProLog.prototype.formatDebug = function(data, index) {
  if (index > 0) { return null; }
  return ' (' + data.stack.method + ' ' + data.stack.file + ':' + data.stack.line + ')';
};

// The indentation is a little fancy by default. Return null to omit this.
ProLog.prototype.formatPadding = function(data, index) {
  if (data.indent === 0) { return ''; }
  return new Array(data.indent).join('│  ') + (index === 0 ? '├─ ' : '│  ');
};

// Optionally modify logging event "data" objects or prevent logging events
// from being emitted.
ProLog.prototype.filter = null;

// Increase indentation.
ProLog.prototype.group = function() {
  if (arguments.length > 0) {
    this.logArgs(this.groupLevel, _.toArray(arguments));
  }
  this._indent++;
  return this;
};

// Decrease indentation.
ProLog.prototype.groupEnd = function() {
  if (--this._indent < 0) { this._indent = 0; }
  return this;
};

// Store a time.
ProLog.prototype.time = function(label) {
  this._timers[label] = process.hrtime();
  return this;
};

// Return a time.
ProLog.prototype.timeEnd = function(label) {
  if (!this._timers[label]) { return null; }
  var diff = process.hrtime(this._timers[label]);
  delete this._timers[label];
  var nanoseconds = diff[0] * 1e9 + diff[1];
  var milliseconds = Math.floor(nanoseconds / 1e3) / 1e3;
  return this.log(this.timeLevel, label + ': ' + milliseconds + 'ms');
};

// I seemed to be doing this a lot.
ProLog.prototype.timeGroup = function(label) {
  return this.group(label).time(label);
};

ProLog.prototype.timeGroupEnd = function(label) {
  return this.groupEnd().timeEnd(label);
};

// Create level-named method(s) for each specified logging level,
// removing any falsy (null) levels.
ProLog.prototype.initLevels = function(levels) {
  _.each(levels, function(options, name) {
    if (options) {
      this.addLevel(name, options);
    } else if (name in this._levels) {
      this.removeLevel(name);
    }
  }, this);
};

// A generic log method.
ProLog.prototype.log = function(level) {
  return this.logArgs(level, _.toArray(arguments).slice(1));
};

// The most generic logging method.
ProLog.prototype.logArgs = function(level, args) {
  var data = {
    level: level,
    timeStamp: +new Date(),
    indent: 0, // This will get incremented as necessry when event is emitted.
    args: args,
    message: util.format.apply(util, args),
    priority: this._levels[level].priority,
    format: this._levels[level].format,
    stack: this.stackInfo(),
  };
  // Create logger property as non-enumerable so that it's omitted when
  // outputting JSON.stringify(data).
  Object.defineProperty(data, 'logger', {
    value: this,
    writable: true,
    configurable: true,
  });
  this.emit('log', data);
  return this;
};

// Get info for the first non-ProLog function call. This will probably
// need to be made smarter.
ProLog.prototype.stackInfo = function() {
  var result = {method: 'unknown', file: 'unknown', line: -1};
  _.some(new Error().stack.split('\n'), function(line) {
    var matches = line.match(/\s*at (.*) \((.*):(\d+):\d+\)/);
    if (matches && matches[2].indexOf(__dirname) === -1) {
      result.method = matches[1] === 'Object.<anonymous>' ? '<anonymous>' : matches[1];
      result.file = matches[2];
      result.line = Number(matches[3]);
      return true;
    }
  });
  return result;
};

// Create level-named method(s) for the specified logging level.
ProLog.prototype.addLevel = function(level, options) {
  var self = this;
  this._levels[level] = _.extend({}, options);
  if (_.isString(this._levels[level].format)) {
    this._levels[level].format = _.template(this._levels[level].format);
  }
  // Primary logging method for this level.
  this[level] = function() {
    return self.logArgs(level, _.toArray(arguments));
  };
  // Progress sub-method.
  this[level].progress = function(label) {
    return new this.Progress(label, {
      logger: self[level].bind(null, '%s')
    });
  };
  // Count sub-method. TODO: keep? make cross-level?
  var counts = {};
  this[level].count = function(label) {
    counts[label] = (counts[label] || 0) + 1;
    self[level](label + ': %d', counts[label]);
  };
};

// Remove level-named method(s) for the specified logging level.
ProLog.prototype.removeLevel = function(name) {
  delete this._levels[name];
  delete this[name];
};
