var Widget = require('./Widget.js');

ScalePicker.prototype = Object.create(Widget.prototype);

function ScalePicker(scale) {
  var $element = $('<ul class="detachedMenu">').append(
        $('<li>').text('chromatic'),
        $('<li>').text('diatonic'),
        $('<li>').text('lydian'));
 
  Widget.call(this, $element);
 
  $('.currentTray').append( 
      $('<div>')
        .addClass('.scaleMenu')
        .button()
        .on( 'click', function () {
          Widget.attach.call(this, $('body')); 
        })
  );
}


module.exports = ScalePicker;
