var Widget = require('./Widget.js');

Meter.prototype = Object.create(Widget.prototype);

function Meter(args) {
  this.audioAnalyzer = audioContext.createAnalyser();
  this.audioAnalyzer.connect(audioContext.destination);
  this.audioAnalyzer.smoothingTimeconstant = 0.85;

  this.$element = $('<div>')
    .attr('id', args.id)
    .css({
      width: '25px',
      height: '25px',
      float: 'left'
    });

  this.$element.appendTo( this.$container );

  this.stage = new Kinetic.Stage({
    container: this.$element.attr('id'),
    width: this.$element.width(),
    height: this.$element.height()
  });

  this.layer = new Kinetic.Layer();
  this.stage.add(this.layer);

  Widget.call(this);
}

Meter.prototype.draw = function () {
  var ctx = this.layer.getCanvas().getContext();
  var bar_width = 10;
  var width = 150;
  var height = $('#bar').height() * 0.9;

  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < width / 10; j++) {
      ctx.strokeStyle = 'black';
      ctx.strokeRect(100 + (j * 10), (bar_width * i) + 2.5, bar_width, bar_width);
    }
  }
};

module.exports = Meter;
