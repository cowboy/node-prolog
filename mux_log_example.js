'use strict';

var Muxer = require('./lib/muxer').Muxer;
// var Progress = require('./lib/progress').Progress;

var EventEmitter2 = require('eventemitter2').EventEmitter2;

var colors = require('colors');

var log = {};
log.event = new EventEmitter2({wildcard: true});

var util = require('util');

log.formatStrings = {};

log.addLevel = function(name, formatString) {
  log[name] = log.event.emit.bind(log.event, name);
  log.formatStrings[name] = formatString;
};

log.addLevel('info', '[INFO] %s'.green);
log.addLevel('warn', '[WARN] %s'.yellow);
log.addLevel('err', '[ERR] %s'.red);

log.combine = function() {
  var muxer = new Muxer();
  [].slice.call(arguments).forEach(function(event) {
    log.event.on(event, function() {
      var message = util.format.apply(null, arguments);
      muxer.write(log.formatStrings[event], message);
    });
  });
  return muxer.stream;
};

log.combine('info', 'warn').pipe(process.stdout);
log.combine('err').pipe(process.stderr);

var through = require('through');
var fs = require('fs');
log.combine('info', 'warn', 'err')
  .pipe(through(function(data) {
    this.queue(colors.stripColors(data));
  }))
  .pipe(fs.createWriteStream('tmp/out2.txt'));



log.info('This is a test info.');
log.warn('This is a test warning.');
log.err('This is a test error.');
log.info('Testing info %s: %d, %j.', 'A', 123, {a: 1});
log.warn('Testing warning %s: %d, %j.', 'A', 123, {a: 1});
log.err('Testing error %s: %d, %j.', 'A', 123, {a: 1});

