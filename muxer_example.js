var Muxer = require('./lib/muxer').Muxer;
var Progress = require('./lib/progress').Progress;

var muxer = new Muxer();
muxer.stream.pipe(process.stdout);

muxer.write('[foo] This is a test.');
muxer.write('[foo] Testing %s: %d, %j.', 'A', 123, {a: 1});

var progress = new Progress('Progress... ', {
  logger: muxer.write.bind(muxer, '[foo] %s')
});

var through = require('through');
var split = require('split');
var noise = through();
noise.pipe(muxer.stream);
var done;
var noiseCounter = 0;
var id = setInterval(function() {
  if (done) {
    clearInterval(id);
    noise.end();
    console.log('noise total =', noiseCounter);
  } else {
    noiseCounter++;
    noise.write('noise[' + noiseCounter + '] ' + (noiseCounter % 5 === 0 ? '<BR>\n' : ''));
  }
}, 35);

var counter = 0;
var max = 10;
(function loopy() {
  counter++;
  progress.update(counter, max);
  if (counter < max) {
    setTimeout(loopy, 100);
  } else {
    // console.log('[con] Testing %s: %d, %j.', 'B', 456, {a: 2});
    muxer.write('[foo] Testing %s: %d, %j.', 'B', 456, {a: 2});
    progress.done('OK');
    muxer.write('[foo] Testing %s: %d, %j.', 'C', 789, {a: 3});
    done = true;
  }
}());
