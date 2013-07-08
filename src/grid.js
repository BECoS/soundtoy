var gmodel = require('./gridModel.js');
  
function init() {
  $('#grid').children().remove();
  $('figure').off('click mouseenter mouseleave');
  var totalVoices = gmodel.numVoices(),
    length = 16,
    joinCounter = 0;

  for (var voice = 0; voice < totalVoices; voice++) {
    var row = $('<section>').addClass('rowContainer');

    for (var cube = 0; cube < length; cube++) {
      var fig = $('<figure sequence="0">');
      var activeStatus = gmodel.getState(voice, cube);


      if (activeStatus > 1) {
        joinCounter = activeStatus;
        fig.attr('sequence', activeStatus);
        fig.addClass('active joined');
        fig.hover(hoverFunc, hoverFunc);
        fig.on("click", seqClickFunc);
      } else if (activeStatus == 1) {
        fig.addClass('active');
        fig.on("click", normalClickFunc);
      } else if (--joinCounter > 0) {
        fig.addClass('joined');
        fig.attr('sequence', joinCounter);
        fig.hover(hoverFunc, hoverFunc);
        fig.on("click", seqClickFunc);
      } else {
        fig.on("click", normalClickFunc);
      }

      row.append(fig.attr('col', cube).attr('row', voice)
        .text(gmodel.getNoteFromRow(voice))
      );
    }
    $('#grid').append(row);
  }
  var figureSize = computeFigureSize();
  initGridZoom();
}

function computeFigureSize() {
  var containWidth = $('#grid').width();
  var containHeight = $('#grid').height();
  return [containWidth / 16 - 2, containHeight / 16 - 2];
}

function initGridZoom() {
  var zoomLevel = 16;
  var shrinkSize = 2;
  var isZooming = false;
  var startingPoint = [ 0, 0 ];
  document.onmousewheel = function (event) {
    isZooming = true;
    setTimeout( function () {
      isZooming = false;
    }, 500);
    startingPoint = [ event.clientX, event.clientY ];
    var gridCenterPoint = $('#grid');
    if (event.wheelDeltaY < 0) {
      if (zoomLevel === 0) return;
      $('figure').width($('figure').width() - shrinkSize )
        .height($('figure').height() - shrinkSize);
       
      $('.rowContainer').height($('figure').height() + shrinkSize);

      $('figure').css('font-size', zoomLevel-- );
    } else {
      if (zoomLevel === 32) return;
      $('figure').width($('figure').width() + shrinkSize )
        .height($('figure').height() + shrinkSize );

      $('.rowContainer').height($('figure').height() + shrinkSize);


      $('figure').css('font-size', zoomLevel++ );
    }
  };
  

  $('figure').mousedown( function (event) {
    var firstSquare = {};
    firstSquare.$ = $('figure:hover');
    firstSquare.row = firstSquare.$.attr('row');
    firstSquare.col = firstSquare.$.attr('col');

    $(document).mouseup( function (event) {
      var secondSquare = {};
      secondSquare.row = $('figure:hover').attr('row');
      secondSquare.col = $('figure:hover').attr('col');
      if (firstSquare.row == secondSquare.row) {
        var travel = secondSquare.col - firstSquare.col + 1;
        console.log('Piece is ' + travel + ' long');
        gmodel.updateState(firstSquare.row, firstSquare.col, travel);
        init();
      }

      if (event.button == 1) {
        $('#centerpiece').unbind("mousemove");
      } else if (event.button == 1) {
        console.log("Left at " + $(':hover').attr('row') + $(':hover').attr('col'));
      }
    });

    if (event.button != 1) return;
    var xPos = event.pageX;
    var xOff = xPos - $('#centerpiece').offset().left;
    var yPos = event.pageY;
    var yOff = yPos - $('#centerpiece').offset().top;

    $('#centerpiece').bind("mousemove", function (event) {
      if (event.pageX < xPos) {
        $(this).css( "margin-left", "-=" + (this.offsetLeft + 
          xOff -event.pageX) );
      } else if (event.pageX > xPos) {
        $(this).css( "margin-left", "+=" + (event.pageX - this.offsetLeft -
          xOff));
      } 

      if (event.pageY < yPos) {
        $(this).css( "margin-top", "-=" + (this.offsetTop + 
          yOff -event.pageY) );
      } else if (event.pageY > yPos) {
        $(this).css( "margin-top", "+=" + (event.pageY - this.offsetTop -
          yOff));
      } 
      xPos = event.pageX;
      yPos = event.pageX;
    });
  });
}

// Returns the starting piece in a grouping of quanta that constitute a single note
function grabSequenceStart($seqElement) {
  var $piece = $seqElement; // a piece of the note
  if ( !$piece.hasClass('active')) {
    while ( !$piece.hasClass('active') ) {
      $piece = $piece.prev();
    }
  }
  return $piece; 
}

function doToSequence($piece, func) {
  do {
    func.apply($piece); 
    $piece = $piece.next();
  } while ( parseInt($piece.attr('sequence'), 10) > parseInt($piece.next().attr('sequence'), 10) ||
      $piece.attr('sequence') == "1" );
}

function hoverFunc() {
  var $piece = grabSequenceStart( $(this) );
  var slaveHover = function () { 
    this.toggleClass('slaveHover'); 
  };
  doToSequence($piece, slaveHover);
}

function seqClickFunc() {
  var $piece = grabSequenceStart( $(this) );
  var removeSeq = function () { 
    this.removeClass('active joined slaveHover');
    this.off('click mouseenter mouseleave');
    this.attr('sequence', '0'); 
    this.on('click', normalClickFunc);
  };
  doToSequence($piece, removeSeq);
}

function normalClickFunc() {
  $(this).addClass('clicked');

  var row = $(this).attr('row');
  var col = $(this).attr('col');

  var freshState = gmodel.getState(row, col) === 1 ? 0 : 1;

  // When a square is a piece of a note clicking on it updates
  // the state for only the first note in the sequence
  var updateAsActive = false;
  if ( parseInt($(this).attr('sequence'), 10) === 0 ) {
    gmodel.updateState(row, col, freshState);
    updateAsActive = true;
  }

  setTimeout(function (square) {
    $('.clicked').removeClass('clicked');

    if (updateAsActive) {
      $(square).toggleClass('active');
    } else {
      //$(square).toggleClass('joined');
    }

  }, 450, this);
}

exports.init = init;
exports.initGridZoom = initGridZoom;
window.gridInit = init;
