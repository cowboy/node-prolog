/*
 * grunt-log
 * https://github.com/gruntjs/grunt-log
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');
var through = require('through');
var _ = require('lodash');

function Muxer(options) {
  this.options = _.defaults({}, options, {
    formatString: '%s',
  });
  this.stream = through();

  // Only piped input should be split on newlines.
  this.buffer = '';
  this.stream._write = this.stream.write;
  this.stream.write = function(data) {
    var parts = (this.buffer + data).split(/\r?\n/);
    this.buffer = parts.pop();
    for (var i = 0; i < parts.length; i++) {
      this.stream._write(this.format(parts[i]));
    }
  }.bind(this);

  this.stream._end = this.stream.end;
  this.stream.end = function(data) {
    this.stream._write(this.format(this.buffer));
    this.buffer = '';
    this.stream._end(data); // does this actually do anything?
  }.bind(this);

  this.lastProgress = {length: 0, instance: null};
}

exports.Muxer = Muxer;

Muxer.prototype.format = function() {
  var parts = this.formatParts.apply(this, arguments);
  return parts.leading + parts.message + parts.trailing;
};

Muxer.prototype.formatParts = function() {
  var args = [].slice.call(arguments);
  var progress = args[1];
  var isProgress = progress && typeof progress.getProgress === 'function';
  var interrupt = this.lastProgress.instance && progress !== this.lastProgress.instance;
  var leading = interrupt ? '\n' : '';
  var trailing = '';
  if (isProgress) {
    if (interrupt) { this.lastProgress.length = 0; }
    if (progress === this.lastProgress.instance) { leading += '\r'; }
    this.lastProgress.instance = progress.completed ? null : progress;
    args[1] = progress.getProgress();
    trailing = this.progressPadding(progress);
    if (progress.completed) {
      trailing += '\n';
    }
  } else {
    this.lastProgress = {length: 0, instance: null};
    trailing = '\n';
  }
  return {
    leading: leading,
    message: util.format.apply(null, args),
    trailing: trailing,
  };
};

Muxer.prototype.progressPadding = function(progress) {
  var length = progress.getProgress().length;
  var delta = this.lastProgress.length - length;
  this.lastProgress.length = length;
  return delta > 0 ? new Array(delta + 1).join(' ') : '';
};

Muxer.prototype.write = function() {
  var args = [].slice.call(arguments);
  return this.writef.apply(this, [this.options.formatString].concat(args));
};

Muxer.prototype.writef = function(formatString) {
  var args = [].slice.call(arguments, 1);
  var parts = this.formatParts.apply(this, args);
  var msg = util.format(formatString, parts.message);
  this.stream._write(parts.leading + msg + parts.trailing);
};
