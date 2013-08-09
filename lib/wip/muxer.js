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
    progressState: {},
  });
  this.progressState = this.options.progressState;

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
}

exports.Muxer = Muxer;

Muxer.prototype.format = function() {
  var parts = this.formatParts(arguments);
  return parts.leading + parts.message + parts.trailing;
};

Muxer.prototype.formatParts = function(args) {
  args = _.toArray(args);
  var progress = args[1];
  var isProgress = progress && typeof progress.getProgress === 'function';
  var interrupt = this.progressState.instance && progress !== this.progressState.instance;
  if (interrupt && this.progressState.muxer) {
    this.progressState.muxer.stream._write('\n');
  }
  var leading = '';
  var trailing = '';
  if (isProgress) {
    if (interrupt) { this.progressState.length = 0; }
    if (progress === this.progressState.instance) { leading += '\r'; }
    this.progressState.instance = progress.completed ? null : progress;
    this.progressState.muxer = progress.completed ? null : this;
    args[1] = progress.getProgress();
    trailing = this.progressPadding(progress);
    if (progress.completed) {
      trailing += '\n';
    }
  } else {
    this.progressState.length = 0;
    this.progressState.instance = null;
    this.progressState.muxer = null;
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
  var delta = (this.progressState.length || 0) - length;
  this.progressState.length = length;
  return delta > 0 ? new Array(delta + 1).join(' ') : '';
};

Muxer.prototype.write = function(formatString, args) {
  var parts = this.formatParts(args);
  var message = util.format(formatString, parts.message);
  this.stream._write(parts.leading + message + parts.trailing);
};
