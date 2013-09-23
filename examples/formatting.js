var ProLog = require('../lib/prolog').ProLog;
var $ = require('chalk');

// Logging level formatting string helper function.
function getFormat(options) {
  return options.name + ' ' + $.gray('${date}${debug}${padding}') +
    (options.message || $.green('${message}'));
}

// Formatting helper function.
function stringOrFiller(str, index) {
  return index === 0 ? str : new Array(str.length + 1).join('=');
}

// Instantiate logger with custom formatters and level formatting.
var log = new ProLog({
  // Ripped from the source.
  levels: {
    info:    {priority: 2, format: getFormat({name: $.cyan('info')})},
    data:    {priority: 3, format: getFormat({name: $.green('data')})},
    warn:    {priority: 4, format: getFormat({name: $.yellow('warn')})},
    debug:   {priority: 5, format: getFormat({name: $.magenta('dbug') })},
    error:   {priority: 6, format: getFormat({name: $.white.bgRed('ERR!'), message: $.red('${message}')})},
    header:  {priority: 2, format: getFormat({name: '>>>>', message: $.underline('${message}')})},
  },
  // Show some of the date...
  formatDate: function(data, index) {
    var s = '(' + String(new Date(data.timeStamp)).split(' ').slice(0, 5).join(' ');
    // ..but only if it's the first line.
    return stringOrFiller(s, index);
  },
  // Show the function name, file name, and line number (which is a silly thing
  // to show BEFORE the message if padding is being displayed, but whatever)...
  formatDebug: function(data, index) {
    var s = data.stack[0];
    var filename = require('path').basename(s.getFileName());
    var s = ' ' + s.getFunctionName() + ' ' + filename + ' ' + s.getLineNumber() + ') ';
    // ..but only if it's the first line.
    return stringOrFiller(s, index);
  },
  // Make padding look like an arrow!
  formatPadding: function(data, index) {
    return '=' + new Array(data.indent + 1).join('==') + '> ';
  },
});

function foo() {
  log.info('This info message is not indented.');
  log.timeGroup('Grouped messages');
  log.info('This info message should be indented once\nand split over two lines.');
  log.group('A second level of grouping:');
  log.data('This data message should be indented twice.');
  log.group('A third level of grouping:');
}

function bar() {
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
bar();
