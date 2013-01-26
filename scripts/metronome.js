var BPM = 120;
var beat = 0;
var beats = {};
var getBPM = function() { return BPM; };
var setBPM = function(newBPM) { BPM = newBPM; };
var register = function(beatInterval, callback) {
  beats[beatInterval] = callback; 
};
var isRegistered = function(callback) {
  var keys = Object.keys(beats);
  for (var key = 0; key < keys.length; key++) {
    console.log(keys[key]);
    if (beats[keys[key]] == callback) {
      return true;
    }
  }
  return false;
};

var advance = function() {
  var keys = Object.keys(beats);
  for (var key = 0; key < keys.length; key++) {
    beats[keys[key]]();
  }
};
var advanceBeat = function () {
  return ++beat;
};
var getBeat = function () { return beat; };
var saySomething = function() { console.log("something"); };

window.setInterval(advanceBeat, 500);
//var worker = new Worker('worker.js');
//window.worker = worker;
//window.worker.postMessage(saySomething);
exports.getBeat = getBeat;
exports.setBPM = setBPM;
exports.getBPM = getBPM;
exports.isRegistered = isRegistered;
exports.register = register;
