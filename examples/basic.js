var ProLog = require('../lib/prolog').ProLog;

// Instantiate logger. The default "output" method will log "warn" and
// "error" to stderr, and everything else to stdout.
var log = new ProLog();

// // Plain JSON output:
// var log = new ProLog({format: false});

// // Add timestamp and debugging info using default formatting:
// var log = new ProLog({formatDate: true, formatDebug: true});

// // Add custom date and padding formatters, using default formatting:
// var log = new ProLog({
//   formatDate: function(data, index) {
//     return '[' + require('moment')(data.timeStamp).format('HH:mm:ss') + '] ';
//   },
//   formatPadding: function(data, index) {
//     return new Array(data.indent + 1).join('> ');
//   },
// });

// // Completely customize output:
// var log = new ProLog({output: false});
// log.on('log', function(data) { console.log('[%s] %s', data.level, data.message); });

// There's a generic log method.
log.time('Generic log method');
log.log('header', 'Generic log method');
log.log('silly', 'This is a test "silly" message logged generically.');
log.log('verbose', 'This is a test "verbose" message logged generically.');
log.log('info', 'This is a test "info" message logged generically.');
log.log('data', 'This is a test "data" message logged generically.');
log.log('warn', 'This is a test "warn" message logged generically.');
log.log('debug', 'This is a test "debug" message logged generically.');
log.log('error', 'This is a test "error" message logged generically.');
log.timeEnd('Generic log method');
log.spacer();

// And per-level helper methods.
log.time('Per-level helper methods');
log.group('Per-level helper methods');
log.silly('This is a test silly message.');
log.verbose('This is a test verbose message.');
log.info('This is a test info message.');
log.data('This is a test data message.');
log.error(new Error('This is a test error message (with stack trace).').stack);
log.warn('This is a test warn message.');
log.debug('This is a test debug message.');
log.groupEnd();
log.timeEnd('Per-level helper methods');
log.spacer();

// You can log more complex things than just strings.
log.timeGroup('More visually complex messages');
log.silly('Testing silly %s: %d, %j.', 'A', 1, {a: 1});
log.verbose('Testing verbose %s: %d, %j.', 'A', 1, {a: 1});
log.info('Testing info %s: %d, %j.', 'A', 1, {a: 1});
log.data('Testing data %s: %d, %j.', 'A', 2, {b: 2});
log.debug('Testing debug %s: %d, %j.', 'A', 3, {c: 3});
log.warn('Testing warn %s: %d, %j.', 'A', 4, {d: 4});
log.error('Testing error %s: %d, %j.', 'A', 5, {e: 5});
log.timeGroupEnd('More visually complex messages');
log.spacer();

// Objects can be logged different ways.
var obj = {
  a: 1,
  b: ['x', 'y', 'z'],
  toString: function() {
    return '[object Fancypants]';
  },
};
log.timeGroup('Logging objects a few ways');
log.data('Objects can be inspected:', obj);
log.info('Objects can be logged as strings: %s', obj);
log.verbose('Objects can be logged as JSON: %j', obj);
log.silly([['Things might be'], ['logged over'], ['multiple lines.'], obj]);
log.timeGroupEnd('Logging objects a few ways');
log.spacer();

// Messages can be counted.
log.timeGroup('Counted messages');
log.debug.count('This is a counted message');
log.debug.count('This is another counted message');
log.info.count('This is a counted message');
log.debug.count('This is a counted message');
log.timeGroupEnd('Counted messages');
log.spacer();

// You can group messages as well.
function foo() {
  log.timeGroup('Grouped messages');
  log.info('This info message should be indented once\nand split over two lines.');
  log.group('A second level of grouping:');
  log.data('This data message should be indented twice.');
  log.group('A third level of grouping:');
  log.error('This error message should be indented three times\nand split over two lines.');
  log.warn('This warn message should be indented three times.');
  log.groupEnd();
  log.debug('This debug message should be indented twice\nand split over two lines.');
  log.info('This info message should be indented twice.');
  log.groupEnd();
  log.warn('This warn message should be indented once.');
  log.timeGroupEnd('Grouped messages');
  log.error('This error message should not be indented.');
}

foo();