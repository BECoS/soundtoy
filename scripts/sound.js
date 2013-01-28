var context;
var x = 0;
var freqValues = [261.626, 293.665, 329.628, 349.228, 391.995,
    440, 493.883];
var oscillators = [], gainNodes = [], 
    num = 8, x;

function play(x) {
  gainNodes[x].gain.value = 1;
  setTimeout(stop(x), 250);
}

function stop(x) {
  gainNodes[x].gain.value = 0;
}


exports.audioinit = function () {
  context = new webkitAudioContext();
  for (x = 0; x < num; x++) {
    oscillators[x]  = context.createOscillator();
    gainNodes[x] = context.createGainNode();
    oscillators[x].frequency.value = freqValues[x % freqValues.length];
    gainNodes[x].gain.value = 0;
    oscillators[x].connect(gainNodes[x]);
    gainNodes[x].connect(conext.destination);
  }
};

exports.play = play;
exports.stop = stop;
exports.playFreq = playFreq;
