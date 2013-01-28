var context;
var freqValues = [261.626, 293.665, 329.628, 349.228, 391.995,
    440, 493.883];
var oscillators = [], gainNodes = [], 
    num = 8;

function play(x) {
  if (!gainNodes[x].playedAlready) {
    stopAllBut(x);
    gainNodes[x].gain.value = 1;
    gainNodes[x].playedAlready = true;
  } 
}

function stop(x) {
  gainNodes[x].gain.value = 0;
}

function stopAllBut(x) {
  for (var i = 0; i < num; i++) {
    if (i != x) {
      gainNodes[i].gain.value = 0;
      gainNodes[i].playedAlready = false;
    }
  }
}

exports.audioinit = function () {
  context = new webkitAudioContext();
  for (var x = 0; x < num; x++) {
    oscillators[x]  = context.createOscillator();
    gainNodes[x] = context.createGainNode();
    oscillators[x].frequency.value = freqValues[x % freqValues.length];
    gainNodes[x].gain.value = 0;
    gainNodes[x].playedAlready = false;
    oscillators[x].noteOn(0);
    oscillators[x].connect(gainNodes[x]);
    gainNodes[x].connect(context.destination);
  }
};

exports.play = play;
exports.stop = stop;
exports.stopAllBut = stopAllBut;
