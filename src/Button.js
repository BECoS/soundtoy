/* 
  Classic toggler, two images that get swapped on mousedown and 
  either back again on mouseup or another mousedown
*/
var Widget = require('./Widget.js');

Button.prototype = Object.create(Widget.prototype);

function Button(args) {
  this.offImage = args.offImage;
  this.onImage = args.onImage;

  this.offFunc = args.offFunc;
  this.onFunc = args.onFunc;

  this.holdOn = args.holdOn || false;
  Widget.call(this, $element);
}

module.exports = Button;
