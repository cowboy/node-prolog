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
  padding: false,
};

filter.update = function(cur, max, message) {
  var p = this.options.padding ? ' ' : '';
  return parseInt(100 * cur / max, 10) + p + '%' + (message ? p + message : '');
};

filter.done = function(message) {
  return message;
};
