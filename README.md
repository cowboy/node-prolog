# prolog [![Build Status](https://secure.travis-ci.org/cowboy/prolog.png?branch=master)](http://travis-ci.org/cowboy/prolog)

An event- and stream-aware logger for pros. Meaning, professionals.

## Getting Started
Install the module with: `npm install prolog`

```javascript
// Create a logger. Simple.
var ProLog = require('prolog').ProLog;
var log = new ProLog();
log.log('This goes to stdout.');
log.error('This goes to stderr.');
log.group();
log.info('This is indented...');
log.groupEnd();
log.warn('But this is not!');

// This logger forwards all its messages to the parent "log" logger, but
// adds an additional child-only "childonly" level and *removes* the "error"
// level. Also, group indentation is cumulative.
var childlog = new ProLog(log, {
  levels: {
    error: null,
    childonly: '[child] %s%s',
  },
});
childlog.log('This goes to the parent, then to stdout.');
childlog.childonly('This goes to the parent, then to stdout.');
childlog.error('This throws an exception, whoops!');
```

## Documentation

_Total work-in-progress. Haven't added the stream or progress stuff yet._

See the [examples](examples) directory for code-as-documentation.

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 "Cowboy" Ben Alman  
Licensed under the MIT license.
