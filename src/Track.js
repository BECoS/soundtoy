var AdditiveSynth = require('./AdditiveSynth.js').AdditiveSynth;
var Tuner = require('./Tuner.js').Tuner;
var ScalePicker = require('./ScalePicker.js').ScalePicker;

function Track (width, height, context) {
  this.timeSig = 4;
  this.tuner = new Tuner(); 
  
  var tuning = this.tuner.iter(10, 10);
  this.synths = [];
  this.sequence = [];
  var row = (function () {
    var row = [];
    var count = width;
    while (count--) {
      row.push(0);
    }
    return row; 
  })();

  for (var i = height - 1; i >= 0; i--) { 
    this.synths[i] = new AdditiveSynth(2, Util.context, this.tuner, tuning());
    this.sequence[i] = row.slice(0);
  }


  this.length = this.sequence[0].length;
  this.width = this.sequence.length;
  this.scale = new ScalePicker('chromatic');
}

Track.prototype.extend = function (direction) {
  switch (direction) {
    case 'bottom': 
      this.sequence.push( this.sequence.slice(-1) );
      this.synths.push( new AdditiveSynth(2, Util.context, this.tuner, "D5") );
    break;
    case 'right': 
      var self = this;
      this.sequence.forEach( function (element) {
        for (var i = 0; i < self.timeSig; i++) {
          element.push(0);
        }
      });
    break;
  }
};

exports.Track = Track;
