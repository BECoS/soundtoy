//var context = new webkitAudioContext();
//

var Tune = require('./Tuner.js');
var AdditiveSynth = require('./AdditiveSynth.js').AdditiveSynth;
var tuner = new Tune.Tuner(); // = new Tuner();
var synths = [];
var sequence = [];

//TODO: Get this stuff from the metronome
var beat = 0;
var timePerBeat = 0.5;
var startTime = 0;
var totalBeats;

var handle;
var context = new webkitAudioContext();

function initialize() {
  synths = [
    new AdditiveSynth(2, context, tuner, "C3"),
    new AdditiveSynth(2, context, tuner, "D3"),
    new AdditiveSynth(2, context, tuner, "E3"),
    new AdditiveSynth(2, context, tuner, "F3"),
    new AdditiveSynth(2, context, tuner, "G3"),
    new AdditiveSynth(2, context, tuner, "A3"),
    new AdditiveSynth(2, context, tuner, "B3"),
    new AdditiveSynth(2, context, tuner, "C4"),
  ];
  sequence = [
  /*C3*/ [ 1, 0, 0, 0, 0, 0, 0, 0,],
  /*D3*/ [ 0, 1, 0, 0, 0, 0, 0, 0,],
  /*E4*/ [ 0, 0, 1, 0, 0, 0, 0, 0,],
  /*F3*/ [ 0, 0, 0, 1, 0, 0, 0, 0,],
  /*G3*/ [ 0, 0, 0, 0, 1, 0, 0, 0,],
  /*A3*/ [ 0, 0, 0, 0, 0, 1, 0, 0,],
  /*B3*/ [ 0, 0, 0, 0, 0, 0, 1, 0,],
  /*C4*/ [ 0, 0, 0, 0, 0, 0, 0, 1,],
  ];
  totalBeats = sequence[0].length;
}

function isPlaying() {
  return (handle !== null);
}

function start() {
  handle = setInterval(function () {
    var time = context.currentTime;
    var delta = time - startTime;
    if (delta >= timePerBeat) { 
      startTime = time;
      var nextBeatTime = Math.ceil(time) + timePerBeat;
      beat %= totalBeats;
      for (var i = 0; i < sequence.length; i++) {
        if (sequence[i][beat] === 1) {
          synths[i].keyDown(nextBeatTime);
        } else {
          synths[i].keyUp();
        }
      } 
      beat++;
    }
  }, 0);
}

function getActiveColumn() {
  return beat % totalBeats;
}

function getState(x, y) {
  return sequence[x][y];
}

function stop() {
  clearInterval(handle);
  handle = null;
  for (var i = 0; i < synths.length; i++) {
    synths[i].keyUp();
  }
}

function updateSequence(beat, voice, state) {
  sequence[voice][beat] = state;
}

function getTime() {
  return context.currentTime;
}

exports.initialize = initialize;
exports.start = start;
exports.stop = stop;
exports.updateSequence = updateSequence;
exports.getActiveColumn = getActiveColumn;
exports.getState = getState;
exports.isPlaying = isPlaying;
exports.getTime = getTime;
