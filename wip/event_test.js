var EventEmitter2 = require('eventemitter2').EventEmitter2;

var a = new EventEmitter2({wildcard: true});
a.onAny(function(foo, bar) {
  console.log(this.event, foo, bar);
});
a.emit('a', 1, 2);
// logs a 1 2

// Is there a more elegant way of forwarding all events from one
// EventEmitter2 to another than using .apply and arguments like this?

var b = new EventEmitter2({wildcard: true});
// b -> a
b.onAny(function() {
  a.emit.apply(a, [this.event].concat([].slice.call(arguments)));
});
b.emit('b', 3, 4);
// logs b 3 4

var c = new EventEmitter2({wildcard: true});
// c -> b -> a
c.onAny(function() {
  b.emit.apply(b, [this.event].concat([].slice.call(arguments)));
});
c.emit('c', 5, 6);
// logs c 5 6
