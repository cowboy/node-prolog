var es = require('event-stream');
var throughPersist = require('./lib/through-persist');

function makeThing() {
  var out = es.through();

  var substream = es.through();
  substream.pipe(out);
  setInterval(function() {
    substream.write('internal data\n');
  }, 200);

  var buffered = '';
  var lineBuffer = throughPersist(
    function(data) {
      var parts = (buffered + data).split(/\r?\n/);
      buffered = parts.pop();
      for (var i = 0; i < parts.length; i++) {
        this.queue(parts[i] + '\n');
      }
    },
    function() {
      if (buffered) {
        this.queue(buffered + '\n');
        buffered = '';
      }
    }
  );
  return es.pipeline(lineBuffer, out);
}


var myThing = makeThing();
myThing.pipe(process.stdout);

// noise goes into thing
function makeNoise(str) {
  myThing.write('makeNoise (' + str + ')\n');
  var noise = es.through();
  noise.pipe(myThing);
  var counter = 0;
  var id = setInterval(function() {
    counter++;
    noise.write(str + '[' + counter + ']' + (counter % 5 === 0 ? '\n' : ' '));
    if (counter === 7) {
      clearInterval(id);
      noise.end('done');
      setTimeout(makeNoise.bind(null, str), 1000);
    }
  }, 150);
}
makeNoise('noise');
// makeNoise('NOISE');
