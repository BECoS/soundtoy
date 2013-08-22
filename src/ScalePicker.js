var Widget = require('./Widget.js');

ScalePicker.prototype = Object.create(Widget.prototype);

function ScalePicker(scale) {
  this.$element = $('<ul class="detachedMenu">').append(
        $('<li>').text('chromatic'),
        $('<li>').text('diatonic'),
        $('<li>').text('lydian'));
 
 
  $('.currentTray').append( 
      $('<div>')
        .addClass('.scaleMenu')
        .button()
        .on( 'click', function () {
          Widget.attach.call(this, $('body')); 
        })
  );

  Widget.call(this);
}


module.exports = ScalePicker;
