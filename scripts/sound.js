/*global window*/
"use strict";

var context = new window.webkitAudioContext();
var gainNode;
var oscillator;
var noise;
var noiseToggle = false;
var toneToggle = false;

var Whitenoise = function (context) {
  var data0, data1, i;
  this.context = context;
  this.node = context.createJavaScriptNode(1024, 1, 2);
  this.node.onaudioprocess = this.process;
  this.prototype.process = function (e) {
    data0 = e.outputBuffer.getChannelData(0);
    data1 = e.outputBuffer.getChannelData(1);
    for (i = 0; i < data0.length; i += 1) {
      data0[i] = ((Math.random() * 2) - 1);
      data1[i] = data0[i];
    }
  };
  this.prototype.connect = function (node) {
    this.node.connect(node);
  };
};

function changeGain(element) {
  gainNode.gain.value = element.value;
}

function changeOscType(element) {
  oscillator.type = element.value;
}

function changeFreq(element) {
  oscillator.frequency.value = element.value;
  //document.getElementById("freq").innerHTML = element.value;
}

function whitenoise() {
  noise.connect(gainNode);
}

exports.audioinit = function audioinit() {
  console.log('audio init');
  oscillator = context.createOscillator();
  oscillator.type = 1;
  gainNode = context.createGainNode();
  gainNode.connect(context.destination);
  gainNode.gain.value = 0.001;
  oscillator.frequency.value = 30;
  noise = new Whitenoise(context);
};
