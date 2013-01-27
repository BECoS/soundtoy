var context;
var x = 0;
var freqValues = [261.626, 293.665, 329.628, 349.228, 391.995,
		440, 493.883];
var osc;

function Osc(freqIndex) {
  this.play = function () {
    this.gainNode.gain.value = 1;
  };
  this.stop = function () {
    this.gainNode.gain.value = 0;
  };
  this.osc = context.createOscillator();
  this.gainNode = context.createGainNode();
  this.stop();
  this.osc.connect(gainNode);
  this.gainNode.connect(context.destination);
  this.osc.noteOn(0);
  this.osc.frequency.value = freqValues[freqIndex];
  this.setFreq = function (x) {
    try {
      this.frequency.value = freqValues[x];
    } catch (IndexOutOfRangeException) {
      this.frequency.value = freqValues[0];
    }
  };
  return this;
}

exports.audioinit = function () {
  console.log('ok');
  //osc = new Osc(0);
  context = new webkitAudioContext();
};



