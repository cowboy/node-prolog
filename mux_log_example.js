'use strict';

var Muxer = require('./lib/muxer').Muxer;
var Progress = require('./lib/progress').Progress;

var EventEmitter2 = require('eventemitter2').EventEmitter2;

var colors = require('colors');

var log = {};
log.event = new EventEmitter2({wildcard: true});

var util = require('util');

log.formatStrings = {};

log.addLevel = function(name, formatString) {
  log[name] = log.event.emit.bind(log.event, name);
  log[name].progress = function(prefix) {
    return new Progress(prefix, {
      logger: log[name].bind(null, '%s')
    });
  };
  log.formatStrings[name] = formatString;
};

log.addLevel('info', '[INFO] %s'.green);
log.addLevel('warn', '[WARN] %s'.yellow);
log.addLevel('err', '[ERR] %s'.red);

log.combine = function() {
  var muxer = new Muxer();
  [].slice.call(arguments).forEach(function(event) {
    log.event.on(event, function() {
      var args = [log.formatStrings[event]].concat([].slice.call(arguments));
      muxer.writef.apply(muxer, args);
    });
  });
  return muxer.stream;
};

if (0) {
  log.combine('info', 'warn').pipe(process.stdout);
  log.combine('err').pipe(process.stderr);
} else {
  log.combine('info', 'warn', 'err').pipe(process.stdout);
}

var through = require('through');
var fs = require('fs');
log.combine('info', 'warn', 'err')
  .pipe(through(function(data) {
    data = colors.stripColors(data);
    data = data.replace(/\r/g, '\n');
    this.queue(data);
  }))
  .pipe(fs.createWriteStream('tmp/out2.txt'));



var cmds = [
  log.info.bind(log, 'This is a test info.'),
  log.warn.bind(log, 'This is a test warning.'),
  log.err.bind(log, 'This is a test error.'),
  log.info.bind(log, 'Testing info %s: %d, %j.', 'A', 123, {a: 1}),
  log.warn.bind(log, 'Testing warning %s: %d, %j.', 'A', 123, {a: 1}),
  log.err.bind(log, 'Testing error %s: %d, %j.', 'A', 123, {a: 1}),
];

var id1 = setInterval(function() {
  var cmd = cmds.shift();
  if (cmd) {
    cmd();
  } else {
    clearInterval(id1);
  }
}, 200);

var p = log.info.progress('Progress...');
var max = 11;
var counter = 0;
var id2 = setInterval(function() {
  p.update(++counter, max);
  if (counter === max) {
    p.done('OK');
    clearInterval(id2);
  }
}, 150);
