'use strict';

var colors = require('colors');
var _ = require('lodash');
var util = require('util');

var Log = require('./lib/log').Log;
var log = new Log({
  filter: function(data) {
    // if (data.level === 'debug') { return false; }
    // if (data.logger !== log) { return false; }
  },
  format: function(data) {
    var pad = data.indent === 0 ? '' :
      ('├' + Array(data.indent * 2).join('─') + ' ').grey;
    var suffix = data.taskName ? ' (' + data.taskName + ')' : '';
    return util.format(data.format, pad, data.message, suffix);
  },
  levels: {
    task: '[tsk] %s'.green + '%s%s'.green,
    log: '[log] %s' + '%s%s',
    info: '[inf] %s'.cyan + '%s%s'.cyan,
    debug: '[dbg] %s'.magenta + '%s%s'.magenta,
    warn: '[wrn] %s'.yellow + '%s%s'.yellow,
    error: '[err] %s'.red + '%s%s'.red,
  },
});

log.event.onAny(function(data) {
  console.log(log.format(data));
});

var cmds = [
];void [
  // log.log.bind(log, 'This is a test log message.'),
  // log.info.bind(log, 'This is a test info message.'),
  // // log.debug.bind(log, 'This is a test debug message.'),
  // log.warn.bind(log, 'This is a test warning message.'),
  // log.error.bind(log, 'This is a test error message.'),
  // log.log.bind(log, 'Testing log %s: %d, %j.', 'A', 123, {a: 1}),
  // log.info.bind(log, 'Testing info %s: %d, %j.', 'A', 123, {a: 1}),
  // // log.debug.bind(log, 'Testing debug %s: %d, %j.', 'A', 123, {a: 1}),
  // log.warn.bind(log, 'Testing warning %s: %d, %j.', 'A', 123, {a: 1}),
  // log.error.bind(log, 'Testing error %s: %d, %j.', 'A', 123, {a: 1}),
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

function t(name) {
  return {
    name: name,
    fn: function(log, done) {
      var s = 'Task "' + name + '" says: ';
      var cmds = [
        log.log.bind(log, s + 'This is a test log message.'),
        log.group.bind(log),
        log.info.bind(log, s + 'This is a test info message.'),
        log.warn.bind(log, s + 'Testing info %s: %d, %j.', 'A', 123, {a: 1}),
        log.groupEnd.bind(log),
        log.error.bind(log, s + 'Testing error %s: %d, %j.', 'A', 123, {a: 1}),
      ];
      log.group();
      var id = setInterval(function() {
        var cmd = cmds.shift();
        if (cmd) {
          cmd();
        } else {
          clearInterval(id);
          log.groupEnd();
          done();
        }
      }, 100);
    }
  };
}

var async = require('async');
async.eachLimit([t('aa'), t('bbbb'), t('cccccc')], 1, function(o, next) {
  // var s = ' (' + o.name + ')';
  var taskLogger = new Log(log, {
    filter: function(data) {
      data.taskName = o.name;
    },
    levels: {
      task: null,
    }
    // levels: {
    //   log: ('[LOG] %s' + s),
    //   info: ('[INF] %s' + s).cyan,
    //   debug: ('[DBG] %s' + s).magenta,
    //   warn: ('[WRN] %s' + s).yellow,
    //   error: ('[ERR] %s' + s).red,
    // },
  });
  log.task('Task "' + o.name + '" starting.'),
  // log.group();
  o.fn(taskLogger, function() {
    // log.groupEnd();
    log.task('Task "' + o.name + '" done.'),
    next();
  });
});
