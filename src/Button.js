/* 
  Classic toggler, two images that get swapped on mousedown and 
  either back again on mouseup or another mousedown
*/
var Widget = require('./Widget.js');

Button.prototype = Object.create(Widget.prototype);

function Button(args) {

  this.$element = $('<div>') 
    .attr('id', args.id)
    .css({
      width: '25px',
      height: '25px',
      float: 'left'
    });

  this.$container = args.$container;

  this.$element.appendTo( this.$container );

  this.toggle = args.toggle || true;

  this.layer = new Kinetic.Layer();

  this.stage = new Kinetic.Stage({
    container: this.$element.attr('id'),
    width: this.$element.width(),
    height: this.$element.height()
  });

  this.offImage = new Kinetic.Image({
    x: 0,
    y: 0,
    height: this.$element.height(),
    width: this.$element.height(),
    image: this.imageFetch(args.offImage, function () { this.layer.draw(); }),
    stroke: 'black',
    shadowColor: 'black',
    shadowBlur: 2,
    shadowOffset: 1,
    shadowOpacity: 0.8
  });

  this.offFunc = args.offFunc;

  this.onImage = this.offImage.clone({
    image: this.imageFetch(args.onImage, function() { this.layer.draw(); }),
    visible: false
  });

  this.offImage.on( 'mousedown', _.bind( function (event) {
    this.offImage.setVisible(false);
    this.onImage.setVisible(true); 
    this.$element.attr('handle', this.offFunc());
    this.layer.draw();
  }, this));

  this.onFunc = args.onFunc;

  this.onImage.on( 'mousedown', _.bind( function (event) {
    this.onImage.setVisible(false);
    this.offImage.setVisible(true); 
    this.onFunc(this.$element.attr('handle'));
    this.layer.draw();
  }, this));

  this.layer.add(this.onImage);
  this.layer.add(this.offImage);

  this.stage.add(this.layer);

  Widget.call(this);
  window.play = this;
}

Button.prototype.imageFetch = function (src, cb) {
  var img = document.createElement('img');
  img.setAttribute('src', src);
  img.onload = _.bind(cb, this);

  // Seems to get around caching not triggering the onload event
  if (img.complete) {
    cb.call(this);
  }

  return img;
};

module.exports = Button;
