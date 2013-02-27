const SQUARE = 1;
const QUANTUM = 10;
const SAW = 2;
const TRIANGLE = 3;
var context = new webkitAudioContext();
var masterGain = context.createGain();
var synthGain = context.createGain();
var lfo = context.createBiquadFilter();

function pitchBuilder(offset) {
  return 440*Math.pow(2, offset/12);
}

function harmonix(fundamental) {
  var tone = {
    freq : fundamental,
    gain : 1,
    type : SAW,
  };
  var partials = [tone];
  for (var i = 1; i < 4; i++) {
    var partial = Object.create(tone);
    partial.freq = partials[i-1].freq * (i + 1);
    partial.gain = partials[i-1].gain / (i + 1);
    partial.type = Math.floor(Math.random()*40) % 4;
    partials.push(partial);
  }
  return partials;
}

function buildSynth(partials, context, masterGain) {
  var synths = [];
  for (var i = 0; i < partials.length; i++) {
    var synth = context.createOscillator();
    synth.type = partials[i].type;
    synth.frequency.value = partials[i].freq;
    synth.gain = context.createGain();
    synth.gain.gain.value = partials[i].gain;
    synth.connect(synth.gain);
    synth.gain.connect(synthGain);
    synths.push(synth);
  }
  return synths;
}

var Whitenoise = function(context) {
  this.context = context;
  this.node = context.createJavaScriptNode(1024, 1, 2);
  this.node.onaudioprocess = this.process;
}

Whitenoise.prototype.process = function(e) {
  var data0 = e.outputBuffer.getChannelData(0);
  var data1 = e.outputBuffer.getChannelData(1);
  for (var i = 0; i < data0.length; i++) {
    data0[i] = ((Math.random() * 2) - 1);
    data1[i] = data0[i];
  }
};

Whitenoise.prototype.connect = function(node) {
  this.node.connect(node);
};

var freqHandle = null;

function moveFreq(delta, interval) {
  clearInterval(freqHandle);
  freqHandle = setInterval(function() {
    synths.forEach(function(e) {
      e.frequency.value += delta;
    });
  }, interval);
}

function moveGain(delta, interval) {
  freqHandle = setInterval(function() {
    synthGain.gain.value += delta;
  }, interval);
}

var wobbleHandle;
function wobble(freq) {
  var delta;
  clearInterval(wobbleHandle);
  wobbleHandle = setInterval(function() {
    synthGain.gain.value = 2 * Math.sin(freq * 2 * Math.PI * context.currentTime); 
  }, QUANTUM);
}

function envelope(drop, interval) {
  synthGain.gain.linearRampToValueAtTime(drop, context.currentTime + interval);
}

function setFreq(freq) {
  clearInterval(freqHandle);
  synths.forEach(function(e, i) {
    e.frequency.value = freq * (i + 1);
  });
}

function setLFOFreq(freq) {
  lfo.frequency.value = freq;
}

function setLFOGain(gain) {
  lfo.gain.value = gain;
}

function setLFOQ(Q) {
  lfo.Q.value = Q;
}

function moveLFOFreq(delta, interval) {
  setInterval(function() { 
    lfo.frequency.value = delta;
  }, interval);
}

function moveLFOQ(delta, interval) {
  setInterval(function() { 
    lfo.Q.value = delta;
  }, interval);
}

function playFreq(freq, length) {
  if (length === undefined) {
    length = 500;
  }
  clearInterval(freqHandle);
  setFreq(freq);
  synthGain.gain.value = 1;
  setTimeout(function () {
    synthGain.gain.value = 0;
  }, length);
}

lfo.type = lfo.BANDPASS;
lfo.frequency.value = 18.343;
lfo.gain.value = 1;
lfo.Q.value = 0.5;
synthGain.connect(lfo);
lfo.connect(masterGain);
var partials = harmonix(80);
var synths = buildSynth(partials, context, lfo);
masterGain.connect(context.destination);
masterGain.gain.value = 1;
synths.forEach(function(e, i, A){ e.noteOn(0);})
