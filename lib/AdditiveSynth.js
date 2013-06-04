AdditiveSynth.SINE = 0;
AdditiveSynth.SQUARE = 1;
AdditiveSynth.SAW = 2;
AdditiveSynth.TRIANGLE = 3;

function AdditiveSynth(wavetype, context, tuner, note) {
  if (typeof note !== "undefined" && note !== null) {
    this.lastNote = note;  
  } else {
    this.lastNote = "A4";
  }
  this.tuner = tuner;
  this.buildPartials(440, wavetype, 8);
  this.oscs = [];
  this.gain = context.createGainNode(); 
  this.gain.connect(context.destination);
  this.gain.gain.value = 0;
  this.context = context;
  this.envelope = new Float32Array();
  this.envelopeOn = true;
  this.attack = 0;
  this.decay = 0.05;
  this.sustain = 1;
  this.release = 0.1;
  for (var i = 0; i < this.partials.length; i++) {
    var osc = context.createOscillator();
    osc.type = this.partials[i].type;
    osc.frequency.value = this.partials[i].freq;
    osc.gain = context.createGain();
    osc.gain.gain.value = this.partials[i].gain;
    osc.connect(osc.gain);
    osc.gain.connect(this.gain);
    osc.noteOn(0);
    this.oscs.push(osc);
  }
  var freq = this.tuner.classic2Freq(this.lastNote);
  this.oscs.forEach(function(e, i) {
    e.frequency.value = freq * (i + 1);
  });
  return this;
}

AdditiveSynth.prototype.buildPartials = function (fundamental, type, num) {
  var tone = {
    freq : fundamental,
    gain : 1,
    type : type,
  };
  var partials = [tone];
  for (var i = 1; i < num; i++) {
    var partial = Object.create(tone);
    partial.freq = partials[i-1].freq * (i + 1);
    partial.gain = Math.log(partials[i-1].gain / (i+1));
    partial.type = type;
    partials.push(partial);
  }
  this.partials = partials;
  return this;
};

AdditiveSynth.prototype.keyUp = function () {
  this.gain.gain.cancelScheduledValues(0);
  if (this.envelopeOn) {
    var currentTime = this.context.currentTime;
    this.gain.gain.linearRampToValueAtTime(0, currentTime + this.release);
    return this;
  } 
  this.gain.gain.value = 0;
  return this;
};

AdditiveSynth.prototype.keyDown = function (time, note) {
  var shouldChangeFreq = true;
  if (typeof time === 'undefined' || time === null) {
    time = 0;
    note = this.lastNote;
    shouldChangeFreq = false;
  } else if (typeof note === 'undefined' || note === null) {
    note = this.lastNote;
    shouldChangeFreq = false;
  }
  this.gain.gain.cancelScheduledValues(0);
  this.gain.gain.value = 0;
  var freq = this.tuner.classic2Freq(note);
  var currentTime = this.context.currentTime;
  time += currentTime;
  if (shouldChangeFreq) {
    this.oscs.forEach(function(e, i) {
      e.frequency.value = freq * (i + 1);
    });
  }
  if (this.envelopeOn) {
    this.gain.gain.cancelScheduledValues(0);
    this.gain.gain.setValueAtTime(1, 0);
    this.gain.gain.linearRampToValueAtTime(1, currentTime + this.attack);
    this.gain.gain.linearRampToValueAtTime(this.sustain, 
      currentTime + this.decay);
    //this.gain.gain.curve
  } else {
    this.gain.gain.cancelScheduledValues(0);
    this.gain.gain.setValueAtTime(1, 0);
    //this.gain.gain.value = 1;
  }
  return this;
};

AdditiveSynth.prototype.envelope = function (fn)  {
  this.envelope.forEach(function (e, i, A) {
    A[i] = fn(e);    
  });
};

exports.AdditiveSynth = AdditiveSynth;
