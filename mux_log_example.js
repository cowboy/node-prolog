'use strict';

var Muxer = require('./lib/muxer').Muxer;
var Progress = require('./lib/progress').Progress;

var colors = require('colors');

var log = {};

log.formatStrings = {};
log.progressState = {};

log.addLevel = function(name, formatString) {
  var level = log[name] = function() {
    var args = [log.formatStrings[name]].concat([].slice.call(arguments));
    level.muxer.writef.apply(level.muxer, args);
  };
  level.muxer = new Muxer({progressState: log.progressState});
  level.stream = level.muxer.stream;
  level.progress = function(prefix) {
    return new Progress(prefix, {
      logger: level.bind(null, '%s')
    });
  };
  log.formatStrings[name] = formatString;
};

log.addLevel('info', '[INFO] %s'.green);
log.addLevel('warn', '[WARN] %s'.yellow);
log.addLevel('err', '[ERR] %s'.red);

log.info.stream.pipe(process.stdout);
log.warn.stream.pipe(process.stdout);
log.err.stream.pipe(process.stderr);

var through = require('through');
var fs = require('fs');

var fileStream = through(function(data) {
  data = colors.stripColors(data);
  // data = data.replace(/\r/g, '\n');
  this.queue(data);
});
fileStream.pipe(fs.createWriteStream('tmp/out2.txt'));
log.info.stream.pipe(fileStream);
log.warn.stream.pipe(fileStream);
log.err.stream.pipe(fileStream);


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
