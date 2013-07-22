/*
 * grunt-log
 * https://github.com/gruntjs/grunt-log
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

var Progress = require('./progress').Progress;

var _ = require('lodash');

function Level(level, log) {
  var instance = function() {
    return instance.__default__.apply(instance, arguments);
  };
  instance.__proto__ = Level.prototype;
  instance.level = level;
  instance.log = log;
  return instance;
}

exports.Level = Level;

Level.prototype.__proto__ = Function.prototype;

// Write a full line.
Level.prototype.writeln = function(message) {
  this.log.write(this.log.formatMessage(this.level, message) + '\n');
};

// Write a partial line. Used to log progresses.
Level.prototype.write = function(message) {
  this.log.write(this.log.formatMessage(this.level, message));
};

// Create a new progress instance at this level.
Level.prototype.progress = function(prefix, options) {
  options = _.extend({logger: this.write.bind(this)}, options);
  return new Progress(prefix, options);
};

Level.prototype.__default__ = Level.prototype.writeln;
