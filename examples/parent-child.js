var ProLog = require('../lib/prolog').ProLog;
var $ = require('chalk');

function makeFormat(level, messageColor) {
  return '<% if (date) { %>' + $.gray('${date}') + '<% } %>' +
    level + ' ' +
    '<% if (padding) { %>' + $.gray('${padding}') + '<% } %>' +
    $[messageColor]('${message}') +
    '<% if (debug) { %>' + $.gray('${debug}') + '<% } %>';
}

// Instantiate logger with custom levels.
var parentLog = new ProLog({
  levels: {
    header:     {priority: 0, format: makeFormat('>>>', 'underline')},
    log:        {priority: 1, format: makeFormat('log', 'reset')},
    parentonly: {priority: 2, format: makeFormat($.green('par'), 'green')},
    error:      {priority: 3, format: makeFormat($.red('err'), 'red')},
  },
});

// This child logger will send all logging messages to its parent. Note that
// the "output" option is set to false by default for child loggers.
var childLogs = [];
var childLog = new ProLog(parentLog, {
  levels: {
    // Don't inherit the parent-only level.
    parentonly: null,
    // Create a child-only level.
    childonly: {priority: 2, format: makeFormat($.cyan('chi'), 'cyan')},
  },
  // Totally custom output just for the child logger.
  // Push un-colored formatted message onto an array.
  output: function(data) {
    childLogs.push($.stripColor(this.format(data)));
  },
  // Don't split output across multiple lines.
  format: function(data) {
    return data.format(this.dataPlus(data));
  },
  // Show date and debugging info.
  formatDate: true,
  formatDebug: true,
  // Simplify padding.
  formatPadding: function(data) {
    return new Array(data.indent + 1).join('  ');
  },
});

console.log('===== Parent and Child Logs =====\n');

function parentExample() {
  parentLog.group('Logging levels that don\'t exist on a logger can\'t be called.');
  parentLog.log('This log message comes from the parent.');
  parentLog.parentonly('This "parentonly" message comes from the parent.');
  try {
    parentLog.childonly('This will throw an exception.');
  } catch (err) {
    parentLog.error('Exception: %s', err.message);
  }
  parentLog.groupEnd();
}

function childExample() {
  childLog.group('But will be passed-through.');
  childLog.log('This log message comes from the child.');
  childLog.childonly('This "childonly" message comes from the child.');
  try {
    childLog.parentonly('This will throw an exception.');
  } catch (err) {
    childLog.error('Exception: %s', err.message);
  }
  childLog.groupEnd();
}

function groupingExample() {
  parentLog.header('Note that indentation is cumulative.');
  parentLog.log('This parent log message should not be indented.');
  childLog.log('This child log message should not be indented.');
  parentLog.group('[1] Increase parentLog indent');
  parentLog.log('This parent log message should be indented once.');
  childLog.log('This child log message should be indented once.');
  childLog.group('[2] Increase childLog indent');
  parentLog.log('This parent log message should still be indented once.');
  childLog.log('This child log message should be indented twice.');
  childLog.log([['This array will be indented twice'], ['and logged over'], ['multiple lines.']]);
  childLog.log('Testing twice-indented child log message %s: %d, %j.', 'A', 1, {a: 1});
  childLog.groupEnd();
  childLog.header('[2] Decrease childLog indent');
  parentLog.log('This parent log message should still be indented once.');
  childLog.log('This child log message should be indented once.');
  parentLog.groupEnd();
  parentLog.header('[1] Decrease parentLog indent');
  parentLog.log('This parent log message should not be indented.');
  childLog.log('This child log message should not be indented.');
  childLog.group('[3] Increase childLog indent');
  parentLog.log('This parent log message should not be indented.');
  childLog.log('This child log message should be indented once.');
  childLog.groupEnd();
  childLog.header('[3] Decrease childLog indent');
}

parentExample();
childExample();

// Help differentiate childLog messages visually.
childLog.filter = function(data) {
  data.message = this.eachLine(data.message, $.yellow);
};
childLog.log('All childlog messages should now be yellow.');

groupingExample();

console.log('\n===== Just Child Logs =====\n');
console.log(childLogs.join('\n'));
