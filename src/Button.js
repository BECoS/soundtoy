/* 
  Classic toggler, two images that get swapped on mousedown and 
  either back again on mouseup or another mousedown
*/
var Widget = require('./Widget.js');

Button.prototype = Object.create(Widget.prototype);

function Button(args) {

  this.$element = args.$element;

  this.holdOn = args.holdOn || false;

  this.layer = new Kinetic.Layer();

  this.stage = new Kinetic.Stage({
    container: this.$element.attr('id'),
    width: this.$element.width() * 0.9,
    height: this.$element.height() * 0.9, 
  });

  this.offImage = new Kinetic.Image({
    x: 0,
    y: 0,
    height: args.$element.height() * 0.7,
    width: args.$element.height() * 0.7,
    image: this.imageFetch(args.offImage, function () { this.layer.draw(); }),
    stroke: 'black',
    shadowColor: 'black',
    shadowBlur: 2,
    shadowOffset: 1,
    shadowOpacity: 0.8
  });

  this.offFunc = args.offFunc;

  this.offImage.on( 'mousedown', _.bind( function (event) {
    this.onImage.setVisible(true); 
    this.offImage.setVisible(false);
    this.offFunc();
    this.layer.draw();
  }, this));

  this.onImage = this.offImage.clone({
    image: this.imageFetch(args.onImage, function() { this.layer.draw(); }),
    visible: false
  });

  this.onFunc = args.onFunc;

  this.onImage.on( 'mousedown', _.bind( function (event) {
    this.onImage.setVisible(false);
    this.offImage.setVisible(true); 
    var handle = this.onFunc();
    this.offFunc = function () { this.offFunc( handle ); };
    this.layer.draw();
  }, this));

  this.layer.add(this.offImage);
  this.layer.add(this.onImage);

  this.stage.add(this.layer);

  Widget.call(this);
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
