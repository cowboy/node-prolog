'use strict';

var through = require('through');

// https://github.com/dominictarr/through/issues/18
module.exports = function throughPersist(write, end) {
  var stream = through(write);
  stream.end = function(data) {
    if (arguments.length) { write.call(this, data); }
    if (end) { end.call(stream); }
    stream.writable = stream.readable = true; // Unsure if this is necessary.
    return stream;
  };
  return stream;
};
