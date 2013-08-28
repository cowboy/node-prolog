var ProLog = require('../lib/prolog').ProLog;
var $ = require('chalk');
var util = require('util');

// Instantiate logger with custom options.
var log = new ProLog({
  // Custom formatting function (fancy padding).
  format: function(data) {
    var pad = data.indent === 0 ? '' :
      $.gray('├' + Array(data.indent * 2).join('─') + ' ');
    return data.message.split('\n').map(function(line) {
      return util.format(data.format, pad, line);
    }).join('\n');
  },
  // Custom logging levels and format strings.
  levels: {
    log: {priority: 1, format: 'log' + ' %s' + '%s'},
    info: {priority: 2, format: $.cyan('inf') + ' %s' + $.cyan('%s')},
    success: {priority: 3, format: $.green('yay') + ' %s' + $.green('%s')},
    error: {priority: 4, format: $.bgRed.white('wtf') + ' %s' + $.red('%s')},
  },
});

// You can log a single string.
log.log('This is a test log message.');
log.info('This is a test info message.');
log.error(new Error('This is a test error message.').stack);
log.success('This is a test success message.');

// Or anything you'd send to console.log, really.
log.log('Testing log %s: %d, %j.', 'A', 1, {a: 1});
log.log([['This', 'array', 'will', 'be'], ['logged', 'over'], ['multiple', 'lines.']]);
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
