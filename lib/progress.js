/*
 * grunt-log
 * https://github.com/gruntjs/grunt-log
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');

function Progress(prefix, options) {
  this.prefix = prefix;
  this.message = '';
  this.lastMessage = null;
  this.completed = false;
  this.options = options = _.extend({}, this.defaults, options);
  if (typeof options.filter === 'string') {
    options.filter = require('./progress/' + options.filter);
  }
  _.defaults(this.options, options.filter.defaults);
}

exports.Progress = Progress;

Progress.prototype.defaults = {
  filter: 'pct',
  logger: function(p) {
    process.stdout.write('\r' + String(p) + (p.completed ? '\n' : ''));
  },
};

Progress.prototype.update = function() {
  var message = this.options.filter.update.apply(this, arguments);
  if (message !== this.message) {
    this.message = message;
    this.options.logger(this);
  }
};

Progress.prototype.done = function() {
  this.message = this.options.filter.done.apply(this, arguments);
  this.completed = true;
  this.options.logger(this);
};

// TODO: change to .getProgress and use duck-typing?
Progress.prototype.toString = function() {
  return this.prefix + (this.message || '');
};
