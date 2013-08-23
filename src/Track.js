var AdditiveSynth = require('./AdditiveSynth.js'),
    Tuner = require('./Tuner.js'),
    ScalePicker = require('./ScalePicker.js');

function Track (width, height) {
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
    this.synths[i] = new AdditiveSynth(2, this.tuner, tuning());
    this.sequence[i] = row.slice(0);
  }

  this.length = this.sequence[0].length;
  this.width = this.sequence.length;
  this.scale = new ScalePicker('chromatic');
  this.scale.attach($('.currentTray'));
}

Track.prototype.attachControls = function ($container) {
  this.scale.attach($container);
};

Track.prototype.extend = function (direction) {
  switch (direction) {
    case 'bottom': 
      this.sequence.push( this.sequence.slice(-1) );
      this.synths.push( new AdditiveSynth(2, this.tuner, "D5") );
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

module.exports = Track;
