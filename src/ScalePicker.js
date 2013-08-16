function ScalePicker(scale) {
  $('.currentTray').append(
      $('<ul>').append(
        $('<li>').text('chromatic'),
        $('<li>').text('diatonic'),
        $('<li>').text('lydian')));
}

exports.ScalePicker = ScalePicker;
