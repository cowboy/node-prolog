'use strict';

var colors = require('colors');
var _ = require('lodash');

var Log = require('./lib/log').Log;
var log = new Log({
  log: '[LOG] %s',
  info: '[INFO] %s'.cyan,
  debug: '[DEBUG] %s'.magenta,
  warn: '[WARN] %s'.yellow,
  error: '[ERROR] %s'.red,
});

log.event.onAny(console.log);

var through = require('through');

log.muxer = function() {
  var muxers = {};
  var progressState = {};
  var logLevels = log.getLevels(Object.keys(log.levels), arguments);
  logLevels.forEach(function(name) {
    var muxer = muxers[name] = new log.Muxer({progressState: progressState});
    log.event.on(name, function(data) {
      muxer.write(log.levels[data.level].formatString, data.args); // allow per-muxer formatString override
    });
  });

  var inMuxer = new log.Muxer({progressState: progressState});
  function filter() {
    var filtered = through();
    filtered.logLevels = log.getLevels(logLevels, arguments);
    filtered.logLevels.forEach(function(name) {
      muxers[name].stream.pipe(filtered);
    });
    if (_.toArray(arguments).indexOf('_input') !== -1) {
      inMuxer.stream.pipe(filtered);
    }
    filtered.filter = filter;
    return filtered;
  }
  var muxed = filter();
  // muxed.pipe(inMuxer.stream);
  muxed.filter = filter;
  // // filtered._write = filtered.write;
  // muxed.write = function() {
  //   // inMuxer.stream.write.apply(inMuxer, arguments);
  // };
  return muxed;
};

log.getLevels = function(superset, subset) {
  subset = _.isArray(subset[0]) ? subset[0] : _.toArray(subset);
  var map = _.groupBy(subset, function(s) {
    return /^!/.test(s) ? 'exclude' : 'include';
  });
  var result = map.include ? _.intersection(map.include, superset) : superset;
  if (map.exclude) {
    result = _.difference(result, _.invoke(map.exclude, 'slice', 1));
  }
  return result;
};

// set up streams

/*
var logStdio;
var debugMode = 0;
if (debugMode) {
  logStdio = log.muxer();
  logStdio.filter('debug').pipe(process.stdout);
} else {
  logStdio = log.muxer('!debug');
}
logStdio.filter('_input', 'log', 'info').pipe(process.stdout);
logStdio.filter('warn', 'error').pipe(process.stderr);
console.log('log.muxer levels:', logStdio.logLevels);
// logStdio.pipe(process.stdout);

log.muxer()
  .pipe(through(function(data) {
    data = colors.stripColors(data);
    data = data.replace(/\r/g, '\n'); // only do this if you want to cat the output file
    this.queue(data);
  }))
  .pipe(require('fs').createWriteStream('tmp/out3.txt'));
*/

// simulation

var cmds = [
  log.log.bind(log, 'This is a test log message.'),
  log.info.bind(log, 'This is a test info message.'),
  log.debug.bind(log, 'This is a test debug message.'),
  log.warn.bind(log, 'This is a test warning message.'),
  log.error.bind(log, 'This is a test error message.'),
  log.log.bind(log, 'Testing log %s: %d, %j.', 'A', 123, {a: 1}),
  log.info.bind(log, 'Testing info %s: %d, %j.', 'A', 123, {a: 1}),
  log.debug.bind(log, 'Testing debug %s: %d, %j.', 'A', 123, {a: 1}),
  log.warn.bind(log, 'Testing warning %s: %d, %j.', 'A', 123, {a: 1}),
  log.error.bind(log, 'Testing error %s: %d, %j.', 'A', 123, {a: 1}),
];

var done;
var id1 = setInterval(function() {
  var cmd = cmds.shift();
  if (cmd) {
    cmd();
  } else {
    clearInterval(id1);
    done = true;
  }
}, 200);

// var p = log.log.progress('Progress...');
// var max = 33;
// var counter = 0;
// var id2 = setInterval(function() {
//   p.update(++counter, max);
//   if (counter === max) {
//     p.done('OK');
//     clearInterval(id2);
//   }
// }, 50);

// var split = require('split');
// var noise = through();
// noise.pipe(logStdio);
// // noise.pipe(process.stdout);
// var noiseCounter = 0;
// var id = setInterval(function() {
//   if (done) {
//     clearInterval(id);
//     noise.end();
//     console.log('noise total =', noiseCounter);
//   } else {
//     noiseCounter++;
//     noise.write('noise[' + noiseCounter + '] ' + (noiseCounter % 5 === 0 ? '<BR>\n' : ''));
//   }
// }, 35);

// node log2_example.js; echo ---; cat tmp/out3.txt
// node log2_example.js >/dev/null; echo ---; cat tmp/out3.txt
// node log2_example.js 2>/dev/null; echo ---; cat tmp/out3.txt
