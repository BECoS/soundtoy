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
//var audioAnalyser = context.createAnalyser();

function initialize() {
  exports.gainNode = context.createGainNode();
  exports.audioAnalyser = context.createAnalyser();
  synths = [
    new AdditiveSynth(2, context, tuner, "C3"),
    new AdditiveSynth(2, context, tuner, "D3"),
    new AdditiveSynth(2, context, tuner, "E3"),
    new AdditiveSynth(2, context, tuner, "F3"),
    new AdditiveSynth(2, context, tuner, "G3"),
    new AdditiveSynth(2, context, tuner, "A3"),
    new AdditiveSynth(2, context, tuner, "B3"),
    new AdditiveSynth(2, context, tuner, "C4"),
    new AdditiveSynth(2, context, tuner, "D4"),
    new AdditiveSynth(2, context, tuner, "E4"),
    new AdditiveSynth(2, context, tuner, "F4"),
    new AdditiveSynth(2, context, tuner, "G4"),
    new AdditiveSynth(2, context, tuner, "A4"),
    new AdditiveSynth(2, context, tuner, "B4"),
    new AdditiveSynth(2, context, tuner, "C5"),
    new AdditiveSynth(2, context, tuner, "D5"),
  ];
  synths.reverse();
  sequence = [
  /*C3*/ [ 2, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  /*D3*/ [ 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,],
  /*E4*/ [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,],
  /*F3*/ [ 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,],
  /*G3*/ [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,],
  /*A3*/ [ 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,],
  /*B3*/ [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0,],
  /*C4*/ [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,],
  /*D4*/ [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,],
  /*E4*/ [ 0, 1, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,],
  /*F4*/ [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,],
  /*G4*/ [ 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,],
  /*A4*/ [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,],
  /*B4*/ [ 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,],
  /*C5*/ [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0,],
  /*B5*/ [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,],
  ];
  Util.dbg.sequence = sequence;

  totalBeats = sequence[0].length;
  exports.gainNode.connect(exports.audioAnalyser);
  exports.audioAnalyser.connect(context.destination);
  console.log("soundModel initialized");
}

function attack(atk) {
  synths.forEach( function(e, i, A) {
    A[i].attack = atk; 
  });  
}

function decay(dcy) {
  synths.forEach( function(e, i, A) {
    A[i].decay = dcy; 
  });  
}

function sustain(sus) {
  synths.forEach( function(e, i, A) {
    A[i].sustain = sus; 
  });  
}

function release(rls) {
  synths.forEach( function(e, i, A) {
    A[i].release = rls; 
  });  
}

function getNoteFromInstr(instr) {
  return synths[instr].lastNote;
}

function isPlaying() {
  return (handle !== null);
}

function beatMarkTimeout(selector) {
  setTimeout(function() {
    selector.removeClass('playing');
  }, 200);
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
          $('.col' + beat).addClass('playing');
          beatMarkTimeout($('.col' + beat));
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

function getState(voice, note) {
  var state;
  try {
   state = sequence[voice][note];
  } catch (e) {
    console.log("No note at " + x + ", " + y);
  }
  return state;
}

function stop() {
  clearInterval(handle);
  handle = null;
  for (var i = 0; i < synths.length; i++) {
    synths[i].keyUp();
  }
}

function updateState(voice, note, state) {
  sequence[voice][note] = state;
  return sequence[voice][note];
}

function getTime() {
  return context.currentTime;
}

function numVoices() {
  return sequence.length;
}

function numNotes() {
  return sequence[0].length;
}

exports.initialize = initialize;
exports.start = start;
exports.stop = stop;
exports.updateState = updateState;
exports.getActiveColumn = getActiveColumn;
exports.getState = getState;
exports.isPlaying = isPlaying;
exports.getTime = getTime;
exports.getNoteFromInstr = getNoteFromInstr;
exports.numVoices = numVoices;
exports.numNotes = numNotes;
exports.attack = attack;
exports.decay = decay;
exports.sustain = sustain;
exports.release = release;
