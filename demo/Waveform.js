function Waveform(context, node) {
  if (typeof context === "undefined" || context === null) {
    throw "No AudioContext";
  } 
  this.gain = context.createGain();
  node.connect(this.gain);
}

Waveform.prototype.connect = function (node) {
  if (typeof node === "undefined" || node === null) {
    throw "No Node";
  }
  this.gain.connect(node);
  return this;
};

Waveform.prototype.off = function () {
  this.setLevel();
  return this;
};

Waveform.prototype.on = function() {
  this.setLevel(1);
};

Waveform.prototype.setLevel = function (level) {
  if (typeof level === "undefined" || level === null) {
    level = 0;
  } 
  this.gain.gain.value = level;
  return this; 
};

Waveform.prototype.wobble = function (freq) {
  clearInterval(this.wobbleHandle);
  this.wobbleHandle = setInterval(
      (function () {
        this.gain.gain.value = 2 * Math.sin(freq * 2 * Math.PI * context.currentTime); 
      }).bind(this), 
  QUANTUM);
  return this;
};
