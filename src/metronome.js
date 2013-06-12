var BPM = 120;
var beat = 0;
var beats = {};
var playing = false;
var timerID;
var intervalHandle;

var getBPM = function() { return BPM; };
var getMSPB = function() {
  return 1000 * (1 / (BPM / 60));
};

var play = function() {
  playing = true;
  setBPM(getBPM());
};

var isPlaying = function() {
  return playing ;
};

var stop = function() {
  playing = false;
  advanceBeat();
  clearInterval(timerID);
};

var setBPM = function(newBPM) { 
  BPM = newBPM;
  if (playing) {
    timerID = window.setInterval(advanceBeat, getMSPB());
  }
  return BPM;
};

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
  return beat++;
};

var getBeat = function () { return beat; };
var saySomething = function() { console.log("something"); };

exports.getBeat = getBeat;
exports.setBPM = setBPM;
exports.getBPM = getBPM;
exports.getMSPB = getMSPB;
exports.isRegistered = isRegistered;
exports.register = register;
exports.play = play;
exports.stop = stop;
exports.isPlaying = isPlaying;
