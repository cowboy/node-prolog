'use strict';

var colors = require('colors');

var log = {};

log.Muxer = require('./lib/muxer').Muxer;
log.Progress = require('./lib/progress').Progress;

log.levels = {};
log.progressState = {};

log.addLevel = function(name, formatString) {
  var level = log[name] = function() {
    var args = [log.levels[name].formatString].concat([].slice.call(arguments));
    level.muxer.writef.apply(level.muxer, args);
  };
  level.muxer = new log.Muxer({progressState: log.progressState});
  level.stream = level.muxer.stream;
  level.progress = function(prefix) {
    return new log.Progress(prefix, {
      logger: level.bind(null, '%s')
    });
  };
  log.levels[name] = {
    formatString: formatString,
  };
};

var through = require('through');
log.combine = function() {
  var stream = through();
  [].slice.apply(arguments).forEach(function(level) {
    log[level].stream.pipe(stream);
  });
  return stream;
};

// add logging level methods / streams

log.addLevel('info', '[INFO] %s'.green);
log.addLevel('warn', '[WARN] %s'.yellow);
log.addLevel('error', '[ERROR] %s'.red);

// set up streams

log.combine('info', 'warn').pipe(process.stdout);
log.error.stream.pipe(process.stderr);

log.combine('info', 'warn', 'error')
  .pipe(through(function(data) {
    data = colors.stripColors(data);
    data = data.replace(/\r/g, '\n');
    this.queue(data);
  }))
  .pipe(require('fs').createWriteStream('tmp/out2.txt'));

// simulation

var cmds = [
  log.info.bind(log, 'This is a test info.'),
  log.warn.bind(log, 'This is a test warning.'),
  log.error.bind(log, 'This is a test error.'),
  log.info.bind(log, 'Testing info %s: %d, %j.', 'A', 123, {a: 1}),
  log.warn.bind(log, 'Testing warning %s: %d, %j.', 'A', 123, {a: 1}),
  log.error.bind(log, 'Testing error %s: %d, %j.', 'A', 123, {a: 1}),
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

// node mux_log_example.js; echo ---; cat tmp/out2.txt
// node mux_log_example.js >/dev/null; echo ---; cat tmp/out2.txt
// node mux_log_example.js 2>/dev/null; echo ---; cat tmp/out2.txt
