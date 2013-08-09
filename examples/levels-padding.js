var ProLog = require('../lib/prolog').ProLog;
var colors = require('colors');
var util = require('util');

// Instantiate logger with custom options.
var log = new ProLog({
  // Custom formatting function (fancy padding).
  format: function(data) {
    var pad = data.indent === 0 ? '' :
      ('├' + Array(data.indent * 2).join('─') + ' ').grey;
    var suffix = data.taskName ? ' (' + data.taskName + ')' : '';
    return util.format(data.format, pad, data.message, suffix);
  },
  // Custom logging levels and format strings.
  levels: {
    log: '[log] %s' + '%s%s',
    info: '[inf] %s'.cyan + '%s%s'.cyan,
    error: '[wtf] %s'.red + '%s%s'.red,
    success: '[yay] %s'.green + '%s%s'.green,
  },
});

// You can log a single string.
log.log('This is a test log message.');
log.info('This is a test info message.');
log.error('This is a test error message.');
log.success('This is a test success message.');

// Or anything you'd send to console.log, really.
log.log('Testing log %s: %d, %j.', 'A', 1, {a: 1});
log.info('Testing info %s: %d, %j.', 'A', 2, {b: 2});
log.error('Testing error %s: %d, %j.', 'A', 5, {e: 5});
log.success('Testing success %s: %d, %j.', 'A', 6, {e: 6});

// You can group messages as well.
log.group();
log.log('This log message should be indented once.');
log.group();
log.info('This info message should be indented twice.');
log.groupEnd();
log.error('This error message should be indented once.');
log.groupEnd();
log.success('This success message should not be indented.');
