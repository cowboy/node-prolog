/*
 * grunt-log
 * https://github.com/gruntjs/grunt-log
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

var filter = module.exports = {};

filter.defaults = {
  chars: ['|', '/', '-', '\\'],
};

filter.update = function(message) {
  if (!('counter' in this)) { this.counter = 0; }
  else if (++this.counter >= this.options.chars.length) { this.counter = 0; }
  return this.options.chars[this.counter] + (message || '');
};

filter.done = function(message) {
  return message;
};
