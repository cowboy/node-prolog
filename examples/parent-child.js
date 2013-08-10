var ProLog = require('../lib/prolog').ProLog;
var $ = require('chalk');

// Instantiate logger with custom levels.
var parentLog = new ProLog({
  levels: {
    header: $.underline('%s%s'),
    parentonly: $.green('[par] %s%s'),
    log: '[log] %s%s',
    error: $.red('[err] %s%s'),
  },
});

// This child logger will send all logging messages to its parent. Note that
// the "output" option is set to false by default for child loggers.
var childLog = new ProLog(parentLog, {
  levels: {
    parentonly: null,                // Don't inherit the parent-only level.
    childonly: $.cyan('[chi] %s%s'), // Create a child-only level.
  },
});

parentLog.header('Logging levels that don\'t exist on a logger can\'t be called.');

parentLog.log('This log message comes from the parent.');
parentLog.parentonly('This "parentonly" message comes from the parent.');
try {
  parentLog.childonly('This will throw an exception.');
} catch (err) {
  parentLog.error('Exception: %s', err.message);
}

parentLog.header('But will be passed-through.');

childLog.log('This log message comes from the child.');
childLog.childonly('This "childonly" message comes from the child.');
try {
  childLog.parentonly('This will throw an exception.');
} catch (err) {
  childLog.error('Exception: %s', err.message);
}


parentLog.header('Also, indentation is cumulative!');

parentLog.log('This parent log message should not be indented.');
childLog.log('This child log message should not be indented.');
parentLog.group();
parentLog.log('This parent log message should be indented once.');
childLog.log('This child log message should be indented once.');
childLog.group();
parentLog.log('This parent log message should be indented once.');
childLog.log('This child log message should be indented twice.');
childLog.log([['This array will be indented twice'], ['and logged over'], ['multiple lines.']]);
childLog.log('Testing twice-indented child log message %s: %d, %j.', 'A', 1, {a: 1});
childLog.groupEnd();
parentLog.log('This parent log message should be indented once.');
childLog.log('This child log message should be indented once.');
parentLog.groupEnd();
parentLog.log('This parent log message should not be indented.');
childLog.log('This child log message should not be indented.');
