const SLICE = 5;
const TRACK_LENGTH_MS = 500;
var TRACK_LENGTH_SLICES = Math.ceil(TRACK_LENGTH_MS / SLICE);

var Scheduler = {};
Scheduler.schedule = [];
var intervalHandler;
var startTime;
var prevSpot;

function Interval(sliceBegin, sliceEnd) {
  this.sliceBegin = sliceBegin;
  this.sliceEnd = sliceEnd;
  this.callbacks = [];
}

Interval.prototype.addTo = function (callback, offset) {
  this.callbacks.push(callback);
};

Interval.prototype.go = function (time) {
  for (var i = 0; i < this.callbacks.length; i++) {
    this.callbacks[i](time);
  }
};

function RegisterReoccuring(interval, callback) {
  var spot = Math.floor((interval % TRACK_LENGTH_MS) / SLICE);
  console.log("Registering Sonic Event at " + spot);
  Scheduler.schedule[spot].addTo(callback);
}

function Start(context, atTime) {
  if (typeof atTime !== "number") {
    atTime = 0;
  } 
  startTime = context.currentTime * 1000;
  prevSpot = 0;
  clearInterval(intervalHandler);
  intervalHandler = setInterval(
      function () {
        var time = context.currentTime * 1000;
        var timeInBetween = (time - startTime);
        var slicesInBetween = Math.ceil(timeInBetween / SLICE);
        //console.log("Previous slice was " + prevSpot);
        //console.log("This slice is " + (prevSpot + slicesInBetween));
        for (var i = prevSpot + 1; i <= prevSpot + slicesInBetween; i++) {
          Scheduler.schedule[i % TRACK_LENGTH_SLICES].go(time);
        }
        startTime = time;
        prevSpot = prevSpot + slicesInBetween;
      }, 0 
  );
}

for (var i = 0; i < TRACK_LENGTH_SLICES; i++) {
  Scheduler.schedule[i] = new Interval(i * SLICE, ((1 + i)  * SLICE));
}

var toggle = 0;
function TestScheduler(context) {
  RegisterReoccuring(50, function () {
    toggle = toggle === 3 ? 0 : toggle + 1; 
    if (toggle === 0 || toggle === 2) {
      masterGain.gain.value = 0;
    } else {
      masterGain.gain.value = 1;
    }
    if (toggle === 1) {
      setFreq(160);
    } else if (toggle === 3) {
      setFreq(80);
    }
  });
  Start(context);
}
    
