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
  this.buildPartials(440, wavetype, 1);
  this.oscs = [];
  this.gain = context.createGainNode(); 
  this.gain.connect(context.destination);
  this.gain.gain.value = 0;
  this.context = context;
  this.envelope = new Float32Array();
  this.envelopeOn = true;
  this.Attack = 0.002;
  this.Decay = 0.5;
  this.Sustain = 1;
  this.Release = 0.0;
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
    this.gain.gain.linearRampToValueAtTime(0, currentTime + this.Release);
    return this;
  } 
  this.gain.gain.value = 0;
  return this;
};

AdditiveSynth.prototype.keyDown = function (time, note) {
  if (time === undefined || time === null) {
    time = 0;
    note = this.lastNote
  } else if (note === undefined || note === null) {
    note = this.lastNote;
  }
  this.gain.gain.cancelScheduledValues(0);
  this.gain.gain.value = 0;
  var freq = this.tuner.classic2Freq(note);
  var currentTime = this.context.currentTime;
  this.oscs.forEach(function(e, i) {
    e.frequency.value = freq * (i + 1);
  });
  if (this.envelopeOn) {
    this.gain.gain.setValueAtTime(0, currentTime);
    this.gain.gain.linearRampToValueAtTime(1, time + this.Attack);
    this.gain.gain.linearRampToValueAtTime(this.Sustain, time + this.Decay);
  } else {
    this.gain.gain.setValueAtTime(1, time);
  //this.gain.gain.value = 1;
  }
  return this;
};
