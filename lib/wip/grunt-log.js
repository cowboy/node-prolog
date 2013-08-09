/*
 * grunt-log
 * https://github.com/gruntjs/grunt-log
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

var Stream = require('stream');
var Progress = require('./progress').Progress;
var Level = require('./level').Level;

var _ = require('lodash');

function Log(options) {
  this.options = options = _.extend({
    levels: ['error', 'warn', 'info'],
  }, options);

  this.stream = new Stream();
  // Can this go away in Node.js 0.10.0?
  this.stream.write = this.stream.emit.bind(this.stream, 'data');

  this._levels = [];
  this.setLevels(this.options.levels);

  this.lastProgress = {maxlen: 0, instance: null};
}

exports.Log = Log;
exports.Progress = Progress;

Log.prototype.setLevels = function(levels) {
  var self = this;
  // Remove any levels that no longer exist.
  self._levels.filter(function(level) {
    return levels.indexOf(level) === -1;
  }).forEach(function(level) {
    delete self[level];
  });
  // Add only new levels that don't already exist.
  levels.filter(function(level) {
    return self._levels.indexOf(level) === -1;
  }).forEach(function(level) {
    self[level] = new Level(level, self);
    // // Shortcut to write a full line.
    // self[level] = function(message) {
    //   self[level].writeln(message);
    // };
    // // Write a full line.
    // self[level].writeln = function(message) {
    //   self.write(self.formatMessage(level, message) + '\n');
    // };
    // // Write a partial line. Used to log progresses.
    // self[level].write = function(message) {
    //   self.write(self.formatMessage(level, message));
    // };
    // // Create a new progress instance at this level.
    // self[level].progress = function(prefix, options) {
    //   options = _.extend({logger: self[level].write}, options);
    //   return new Progress(prefix, options);
    // };
  });
  self._levels = levels;
};


Log.prototype.formatProgressMessage = function(progress) {
  var str = progress.toString();
  var len = str.length;
  if (len < this.lastProgress.maxlen) {
    str += new Array(this.lastProgress.maxlen - len + 1).join(' ');
  }
  this.lastProgress.maxlen = len;
  if (progress.completed) {
    str += '\n';
  }
  return str;
};

Log.prototype.formatMessage = function(level, value) {
  var prefix = '[' + level.toUpperCase() + '] ';
  var str;
  var interrupt = this.lastProgress.instance && value !== this.lastProgress.instance;
  if (value instanceof Progress) {
    if (interrupt) {
      this.lastProgress.maxlen = 0;
    }
    str = '\r' + prefix + this.formatProgressMessage(value);
    this.lastProgress.instance = value.completed ? null : value;
  } else {
    this.lastProgress = {maxlen: 0, instance: null};
    str = prefix + value;
  }
  return (interrupt ? '\n' : '') + str;
};

Log.prototype.write = function(message) {
  this.stream.write(message);
};
