var Tune = require('./Tuner.js'),
    AdditiveSynth = require('./AdditiveSynth.js'),
    Track = require('./Track.js');

var beat = 0;
var timePerBeat = 0.5 / 4;
var startTime = 0;
var totalBeats, track;

function init() {
  exports.gainNode = audioContext.createGainNode();
  exports.gainNode.gain.value = 0.1;

  exports.audioAnalyser = audioContext.createAnalyser();
  exports.compressor = audioContext.createDynamicsCompressor();

  exports.hiShelf = audioContext.createBiquadFilter();
  exports.hiShelf.type = 4;
  exports.hiShelf.frequency = 880;
  exports.hiShelf.gain.value = 0;

  exports.midShelf = audioContext.createBiquadFilter();
  exports.midShelf.type = 5;
  exports.midShelf.frequency = 440;
  exports.midShelf.gain.value = 0;
  exports.midShelf.Q.Value = 10;

  exports.loShelf = audioContext.createBiquadFilter();
  exports.loShelf.type = 3;
  exports.loShelf.frequency = 220;
  exports.loShelf.gain.value = 0;
    
  exports.compressor.connect(exports.loShelf);
  exports.loShelf.connect(exports.midShelf);
  exports.midShelf.connect(exports.hiShelf);
  exports.hiShelf.connect(exports.gainNode);
  exports.gainNode.connect(exports.audioAnalyser);
  exports.audioAnalyser.connect(audioContext.destination);

  track = new Track(16, 32);
}

exports.extend = function() {
  track.extend('right');
};

exports.scale = function() {
  track.attachControls($('.currentTray'));
};

exports.length = function () {
  return track.sequence.length;
};

exports.width = function () {
  return track.sequence[0].length;
};

function clear() {
  for (var i = 0; i < track.sequence.length; i++) {
    for (var j = 0; j < track.sequence[i].length; j++) {
      track.sequence[i][j] = 0;
    }
  }
}

function attack(atk) {
  track.synths.forEach( function(e, i, A) {
    A[i].attack = atk; 
  });  
}

function decay(dcy) {
  track.synths.forEach( function(e, i, A) {
    A[i].decay = dcy; 
  });  
}

function sustain(sus) {
  track.synths.forEach( function(e, i, A) {
    A[i].sustain = sus; 
  });  
}

function release(rls) {
  track.synths.forEach( function(e, i, A) {
    A[i].release = rls; 
  });  
}

function getNoteFromInstr(instr) {
  return track.synths[instr].lastNote;
}

function isPlaying() {
  return (window.handle !== null);
}

function beatMarkTimeout(selector) {
  setTimeout(function() {
    selector.removeClass('playing');
  }, timePerBeat * 1200);
}

function start() {
  return setInterval(function () {
    var time = audioContext.currentTime;
    var delta = time - startTime;
    if (delta >= timePerBeat) { 
      startTime = time;
      var nextBeatTime = time + timePerBeat;
      beat %= track.sequence[0].length;
      for (var i = 0; i < track.synths.length; i++) {
        var beatLength = track.sequence[i][beat];

        if ( beatLength >= 1) {
          track.synths[i].keyDown(nextBeatTime);
          
          var synth = track.synths[i];

          track.synths[i].keyUp(beatLength * timePerBeat);
        }

        $('[col="' + beat + '"]').addClass('playing');
        beatMarkTimeout($('[col="' + beat + '"]'));
      } 
      beat++;
    }
  }, 0);
}

function getActiveColumn() {
  return beat % totalBeats;
}

function getState(note, voice) {
  var state;
  try {
   state = track.sequence[voice][note];
  } catch (e) {
    console.log("No note at " + voice + ", " + note);
  }
  return state;
}

function stop(handle) {
  clearInterval(handle);
  for (var i = 0; i < track.width; i++) {
    track.synths[i].keyUp();
    $('[col="' + beat + '"][row="' + i +'"]').addClass('playing');
  }
}

function updateState(note, voice, state) {
  track.sequence[voice][note] = state;
  return track.sequence[voice][note];
}

function numVoices() {
  return track.length;
}

function numNotes() {
  return track.length;
}

function setTimePerBeat(tempo) {
  timePerBeat = (60 / tempo) / 4;
}

exports.init= init;
exports.start = start;
exports.stop = stop;
exports.updateState = updateState;
exports.getActiveColumn = getActiveColumn;
exports.getState = getState;
exports.isPlaying = isPlaying;
exports.setBeat = function (newBeat) { beat = newBeat; };
exports.getNoteFromInstr = getNoteFromInstr;
exports.numVoices = numVoices;
exports.numNotes = numNotes;
exports.attack = attack;
exports.decay = decay;
exports.sustain = sustain;
exports.release = release;
exports.clear = clear;
