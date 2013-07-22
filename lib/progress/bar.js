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
  barsize: 10,
  barfill: '#',
  barempty: ' ',
  barends: ['[', ']'],
  padding: false,
};

filter.update = function(cur, max, message) {
  var a = parseInt(this.options.barsize * cur / max, 10);
  var b = this.options.barsize - a;
  var p = this.options.padding ? ' ' : '';
  return this.options.barends[0] + p +
    new Array(a + 1).join(this.options.barfill) +
    new Array(b + 1).join(this.options.barempty) +
    p + this.options.barends[1] + (message ? p + message : '');
};

filter.done = function(message) {
  return message;
};
