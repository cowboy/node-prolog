var stream = require('readable-stream');
var Transform = stream.Transform;

function Logger() {
  Transform.call(this);
}
Logger.prototype = Object.create(Transform.prototype);
Logger.prototype._transform = function(chunk, encoding, done) {
  done(null, chunk);
};
Logger.prototype.log = function(message) {
  this.push(message + '\n');
};

var a = new Logger();
var b = new Logger();
b.pipe(a).pipe(process.stdout);

a.log('order: 1, stream: a');
b.log('order: 2, stream: b');
a.log('order: 3, stream: a');
b.log('order: 4, stream: b');

// order: 1, stream: a
// order: 3, stream: a
// order: 2, stream: b
// order: 4, stream: b


// var util = require('util');
// var _ = require('lodash');
// var $ = require('chalk')

// // Just serialize a object stream into lines of JSON
// function Serializer() {
//   Transform.call(this, {objectMode: true});
// }
// Serializer.prototype = Object.create(Transform.prototype, {constructor: {value: Serializer}});
// Serializer.prototype._transform = function(chunk, encoding, done) {
//   done(null, $.green(JSON.stringify(chunk)) + '\n');
// };

// // For each "log" method call, output an object. Allow indentation to be
// // increased and decreased. For any logger piped into this logger, increment
// // indentation cumulatively.
// var counter = 0;
// function Log(name, options) {
//   Transform.call(this, {objectMode: true});
//   this.name = name;
//   this.indent = 0;
// }
// Log.prototype = Object.create(Transform.prototype, {constructor: {value: Log}});
// Log.prototype._transform = function(chunk, encoding, done) {
//   console.log('[%s] %s', this.name, '_transform');
//   var obj = _.extend({}, chunk);
//   obj.indent += this.indent;
//   done(null, obj);
// };
// Log.prototype.group = function() {
//   console.log('[%s] %s', this.name, 'group');
//   this.indent++;
// };
// Log.prototype.groupEnd = function() {
//   console.log('[%s] %s', this.name, 'groupEnd');
//   this.indent--;
// };
// Log.prototype.log = function(message) {
//   console.log('[%s] %s "%s"', this.name, 'log', message);
//   this.push({
//     counter: ++counter,
//     logger: this.name,
//     message: message,
//     indent: this.indent,
//   });
// };

// // Create parent logger that will be serialized and output to stdout.
// var parent = new Log('parent');
// parent.pipe(new Serializer).pipe(process.stdout);

// // Create child logger that will be passed through the parent logger,
// // so that indentation can (theoretically) be accumulated, then serialized
// // and output to stdout.
// var child = new Log('child');
// child.pipe(parent);

// parent.log('indent should be 0');
// child.log('indent should stay at 0');
// parent.group();
// parent.log('indent should be 1');
// child.log('indent should go from 0→1');
// child.group();
// parent.log('indent should be 1');
// child.log('indent should go from 1→2');
// child.groupEnd();
// parent.log('indent should be 1');
// child.log('indent should go from 0→1');
// parent.groupEnd();
// child.group();
// parent.log('indent should be 0');
// child.log('indent should stay at 1');
// child.groupEnd();
