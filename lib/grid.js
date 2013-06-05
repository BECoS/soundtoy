var gmodel = require('./gridModel.js');

function initView () {
  var totalVoices = gmodel.numVoices();
  var length = 16;
  for (var voice = 0; voice < totalVoices; voice++) {
    var row = "<section class='tContainer'>";
    for (var cube = 0; cube < length; cube++) {
      var activeStatus = gmodel.getState(voice, cube) === 1 ? 'active' : 'inactive'; 
      row += 
        '<figure class="' + activeStatus +  ' square_' + 
        gmodel.getNoteFromRow(voice) + 
        ' col' + cube +
        '" col="' + cube + '" row="' + voice + '">' +
        gmodel.getNoteFromRow(voice) +
        '</figure>';
    }
    row += "</section>";
    $('#grid').append(row);
  }
  var figureSize = computeFigureSize();
  $('figure').css('width',  figureSize[0] + 'px');
  $('figure').css('height',  figureSize[1] + 'px');
}

function computeFigureSize() {
  var containWidth = $('#grid').css('width');
  var containHeight = $('#grid').css('height');
  containWidth = containWidth.match(/\d+/)[0];
  containHeight = containHeight.match(/\d+/)[0];
  return [containWidth / 16 - 2, containHeight / 16 - 2];
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
  initGridZoom();
  $('#panel').draggable();
  $('#panel').toggle();

});

function cullColumns() {
  var boundary = computeFigureSize();
  var cols;

}

function initGridZoom() {
  document.onmousewheel =  function (e) {
    if (e.wheelDeltaY < 0) {
      $('figure').width($('figure').width() - 2 );
      $('figure').height($('figure').height() - 1 );
    } else {
      $('figure').width($('figure').width() + 2 );
      $('figure').height($('figure').height() + 1 );
    }
  };
  $('#centerpiece').dblclick( function (e) {
    console.log('panning enabled');
    var curX = e.pageX, curY = e.pageY;
    $('#centerpiece').mousemove ( function (e) {
      curX = (curX - e.pageX) / 3;
      curY = (curY - e.pageY) / 3;
      console.dir([curX, curY]);
      $('#grid').css('left', curX + 'px'); 
      $('#grid').css('top', curY + 'px'); 
    }); 
    $('#centerpiece').click( function (e) {
      $('#centerpiece').unbind('mousemove');
    });
  });
}

function initAudio() {
  try {
    gmodel.initialize();
  } catch (e) {
    alert("This won't work unless you use a recent version of Chrome or Safari.");
    console.log(e.name);
    console.log(e.message);
  }
}
