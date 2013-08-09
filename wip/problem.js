var es = require('event-stream');
var throughp = require('./lib/through-persist');

var myThrough = throughp(null, function() {
  this.queue('(DONE)\n');
});

myThrough.pipe(process.stdout);

var noise1 = es.through();
noise1.pipe(myThrough);
noise1.write('This is test #1.\n');
noise1.end('Done #1!\n');

var noise2 = es.through();
noise2.pipe(myThrough);
noise2.write('This is test #2.\n');
noise2.end('Done #2!\n');

console.log('All done.');