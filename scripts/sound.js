var context;
var x = 0;
var freqValues = [261.626, 293.665, 329.628, 349.228, 391.995,
		440, 493.883];
var oscillator;

function play() {
	oscillator.connect(context.destination);
	oscillator.noteOn(0);
}

function stop() {
  oscillator.disconnect();
}

function freqUp() {
	oscillator.frequency.value = freqValues[x++ % freqValues.length];
}


function getFreq(x) {
  try {
    oscillator.frequency.value = freqValues[x];
  }
  catch (IndexOutOfRangeException) {
    oscillator.freqquency.value = freqValues[0];
  }
  oscillator.noteOn(0);
  setTimeout(stop, 1000);
}

exports.audioinit = function () {
	context = new webkitAudioContext();
	oscillator = context.createOscillator();
	oscillator.connect(context.destination);
};

exports.play = play;
exports.stop = stop;
exports.getFreq = getFreq;
