var dbg = true;

var gmodel = require('./gridModel.js');
var $ = require('jquery-browserify');

function initView () {
  var totalVoices = gmodel.numVoices();
  var length = 16;
  for (var voice = 0; voice < totalVoices; voice++) {
    var row = "<section class='tContainer'>";
    for (var cube = 0; cube < length; cube++) {
      var activeStatus = gmodel.getState(voice, cube) === 1 ? 'active' : 'inactive'; 
      row += 
        '<figure class="' + activeStatus +  '" "square_' + gmodel.getNoteFromRow(voice) + 
        '" col="' + cube + '" row="' + voice + '">' +
        gmodel.getNoteFromRow(voice) +
        '</figure>';
    }
    row += "</section>";
    $('#grid').append(row);
  }
  $('figure').css('width',  computeFigureSize() + 'px');
}

function computeFigureSize() {
  var containWidth = $('#grid').css('width');
  containWidth = containWidth.match(/\d+/)[0];
  return containWidth / 16 - 2;
}

$( function () {
  initAudio();
  initView();
  $('figure').click( function () {
    $(this).addClass('clicked');
    var row = $(this).attr('row');
    var col = $(this).attr('col');
    var freshState = gmodel.getState(row, col) === 1 ? 0 : 1;
    gmodel.updateState(row, col, freshState);
    setTimeout(function (square) {
      $('.clicked').removeClass('clicked');
      $(square).toggleClass('active');
    }, 100, this);
  });

});

function initAudio() {
  try {
    gmodel.initialize();
  } catch (e) {
    alert("This won't work unless you use a recent version of Chrome or Safari.");
    console.log(e.name);
    console.log(e.message);
  }
}
