var ProLog = require('../lib/prolog').ProLog;
var colors = require('colors');

// Instantiate logger with custom levels.
var parentLog = new ProLog({
  levels: {
    header: '%s%s'.underline,
    parentonly: '[par] %s%s'.green,
    log: '[log] %s%s',
    error: '[err] %s%s'.red,
  },
});

// This child logger will send all logging messages to its parent. Note that
// the "output" option is set to false by default for child loggers.
var childLog = new ProLog(parentLog, {
  levels: {
    parentonly: null,             // Don't inherit the parent-only level.
    childonly: '[chi] %s%s'.cyan, // Create a child-only level.
  },
});

parentLog.header('Logging levels that don\'t exist on a logger can\'t be called.');

parentLog.log('This log message comes from the parent.');
parentLog.parentonly('This "parentonly" message comes from the parent.');
try {
  parentLog.childonly('This will throw an exception.');
} catch (err) {
  parentLog.error('Exception: %s (expected)', err.message);
}

parentLog.header('But will be passed-through.');

childLog.log('This log message comes from the child.');
childLog.childonly('This "childonly" message comes from the child.');
try {
  childLog.parentonly('This will throw an exception.');
} catch (err) {
  childLog.error('Exception: %s (expected)', err.message);
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
childLog.groupEnd();
parentLog.log('This parent log message should be indented once.');
childLog.log('This child log message should be indented once.');
parentLog.groupEnd();
parentLog.log('This parent log message should not be indented.');
childLog.log('This child log message should not be indented.');
