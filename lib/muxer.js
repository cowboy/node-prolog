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

var Progress = require('./progress').Progress;

function Muxer() {
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

  this.lastProgress = {maxlen: 0, instance: null};
}

exports.Muxer = Muxer;

Muxer.prototype.formatProgressMessage = function(progress) {
  var str = progress.toString();
  var len = str.length;
  if (len < this.lastProgress.maxlen) {
    // TODO: return the progress string and padding string separately?
    str += new Array(this.lastProgress.maxlen - len + 1).join(' ');
  }
  this.lastProgress.maxlen = len;
  if (progress.completed) {
    str += '\n';
  }
  return str;
};

Muxer.prototype.format = function() {
  var str;
  var args = arguments;
  var progress = args[1];
  var interrupt = this.lastProgress.instance && progress !== this.lastProgress.instance;
  if (progress instanceof Progress) {
    if (interrupt) {
      this.lastProgress.maxlen = 0;
    }
    args[1] = this.formatProgressMessage(progress);
    str = '\r' + util.format.apply(this, args);
    this.lastProgress.instance = progress.completed ? null : progress;
  } else {
    this.lastProgress = {maxlen: 0, instance: null};
    str = util.format.apply(this, args) + '\n';
  }
  return (interrupt ? '\n' : '') + str;
};

Muxer.prototype.write = function() {
  this.stream._write(this.format.apply(this, arguments));
};
