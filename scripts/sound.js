var context = new webkitAudioContext();
var gainNode;
var oscillator;
var noise;
var noiseToggle = false;
var toneToggle = false;    

function audioinit() {
  oscillator = context.createOscillator(),
             oscillator.type = 1;
  gainNode = context.createGainNode(); 
  gainNode.connect(context.destination); 
  gainNode.gain.value = 0.001; 
  oscillator.frequency.value = 30;
  noise = new Whitenoise(context);
}
function tone() {
  oscillator.connect(gainNode);
}
function changeGain(element) {
  gainNode.gain.value = element.value;
}
function changeOscType(element) {
  oscillator.type = element.value;
}
function changeFreq(element) {
  oscillator.frequency.value = element.value;
  document.getElementById("freq").innerHTML = element.value;
}
function whitenoise() {
  noise.connect(gainNode);
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
