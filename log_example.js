var Log = require('./lib/grunt-log').Log;
var log = new Log({
  // levels: ['error', 'warn', 'info'],
});

// For testing, etc.
log.stream.pipe(process.stdout);

function start(id, delay, level, message, max, interrupt) {
  log[level]('Before' + id);
  // var chars = '•oO';
  // var chars = ['[     ]','[  #  ]','[ ### ]','[#####]','[ ### ]','[  #  ]'];
  var chars = ['[     ]','[#    ]','[##   ]','[###  ]','[ ### ]','[  ###]','[   ##]','[    #]'];
  // var chars = ['(     )','(  O  )','( OOO )','(OOOOO)','( OOO )','(  O  )'];
  // var chars = ['      ', '  <>  ', ' <<>> ', '<<<>>>', ' <<>> ', '  <>  '];
  // var chars = ['[WORKING]', '[-ORKING]', '[W-RKING]', '[WO-KING]', '[WOR-ING]', '[WORK-NG]', '[WORKI-G]', '[WORKIN-]'];
  var progress = log[level].progress(message, {filter: 'spinner', chars: chars});
  var i = 0;
  (function loopy() {
    if (i && i % interrupt === 0) { log[level]('Random interruption 1'); }
    i++;
    var message = 'abcdefghijk'.slice(0, Math.random() * 10 + 1);
    // progress.update(parseInt(100 * (max - i + 1) / max) + '%');
    // progress.update({value: max - i + 1, max: max, pct: true});
    // progress.update(i /*max - i + 1*/, max);
    // progress.update({value: max - i + 1, max: max});
    // progress.update({add: '.'});
    progress.update();
    if (i === max) {
      progress.done('OK' + id);
      // progress.done({add: 'OK' + id});
      log.info('After' + id);
    } else {
      setTimeout(loopy, delay);
    }
  }());

}

// start(1, 20, 'info', 'Doing something...', 333, 50);
start(1, 50, 'info', 'Doing something ', 50);
// start(1, 150, 'info', 'Doing something... ', 11);
// start(2, 50, 'warn', 'Doing something else...', 60, 30);
