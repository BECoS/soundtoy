function Sinusoidal(context) {
  this.node = context.createOscillator();
  Waveform.apply(this, [context, this.node]);
}

Sinusoidal.prototype = Object.create(Waveform.prototype);

Sinusoidal.prototype.constructor = Sinusoidal;

Sinusoidal.prototype.setFreq = function (freq) {
  this.node.frequency.value = freq;
};
