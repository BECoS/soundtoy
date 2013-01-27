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


exports.audioinit = function () {
	context = new webkitAudioContext();
	oscillator = context.createOscillator();
	oscillator.connect(context.destination);
};

exports.play = play;
exports.stop = stop;
