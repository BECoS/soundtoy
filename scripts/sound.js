var Synths = require('./AdditiveSynth.js');
var Tune = require('./Tuner.js');

var context, tuner;
var freqValues = [261.626, 293.665, 329.628, 349.228, 391.995,
    440, 493.883];
var synths = [], gainNodes = [], 
    num = 8;

var hasPlayed = false;

var delta = 0;
var lastCalled = 0;

function play(x) {
  var current = context.currentTime;
  delta += current - lastCalled;
  lastCalled = current;
  if (delta < 0.5) return;
  delta = 0;
  stop();
  synths[x].keyDown('C3');
}

function stop() {
  synths.forEach(function (e, i) {
    e.keyUp(); 
  });
}

exports.audioinit = function () {
  context = new webkitAudioContext();
  tuner = new Tune.Tuner();
  for (var x = 0; x < num; x++) {
    synths[x] = new Synths.AdditiveSynth(2, context, tuner);
  }
};

exports.play = play;
exports.stop = stop;
