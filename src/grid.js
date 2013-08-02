exports.TRANSITION_TIME = 450;

var gmodel = require('./gridModel.js');

function init() {
  $('#grid').children().remove();
  $('rect').off('click mouseenter mouseleave');
  var totalVoices = gmodel.numVoices(),
    length = 16,
    joinCounter = 0;

  for (var voice = 0; voice < totalVoices; voice++) {
    var row = $('<section>').addClass('rowContainer');

    joinCounter = 0; //used for creating a multinote
    for (var cube = 0; cube < length; cube++) {
      var fig = $('<rect sequence="0">');
      var activeStatus = gmodel.getState(voice, cube);

      //Continues the multinote
      if (joinCounter > 1) {
        joinCounter--;
        fig.addClass('joined');
        fig.attr('sequence', joinCounter);
        fig.hover(hoverFunc, hoverFunc);
        //fig.on("click", seqClickFunc);
        fig.on("click", normalClickFunc);
      
      //Starts the multinote
      } else if (activeStatus > 1) {
        joinCounter = activeStatus;
        fig.attr('sequence', activeStatus);
        fig.addClass('active joined');
        fig.hover(hoverFunc, hoverFunc);
        //fig.on("click", seqClickFunc);
        fig.on("click", normalClickFunc);

      //Single note
      } else if (activeStatus == 1) {
        fig.addClass('active');
        fig.on("click", normalClickFunc);

      //No note
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
      $('rect').width($('rect').width() - shrinkSize )
        .height($('rect').height() - shrinkSize);
       
      $('.rowContainer').height($('rect').height() + shrinkSize);

      $('rect').css('font-size', zoomLevel-- );
    } else {
      if (zoomLevel === 32) return;
      $('rect').width($('rect').width() + shrinkSize )
        .height($('rect').height() + shrinkSize );

      $('.rowContainer').height($('rect').height() + shrinkSize);

      $('rect').css('font-size', zoomLevel++ );
    }
  };
  
  $('rect').on( 'mouseenter mouseleave', function () {
    $(this).toggleClass('hovering');
  });

  $('rect').on( 'mousedown', function (event) {
    var firstSquare = {};
    firstSquare.$ = $('rect.hovering');
    firstSquare.row = firstSquare.$.attr('row');
    firstSquare.col = firstSquare.$.attr('col');

    $(document).on( 'mouseup', function (event) {
      var secondSquare = {};
      secondSquare.row = $('rect.hovering').attr('row');
      secondSquare.col = $('rect.hovering').attr('col');
      if (firstSquare.col != secondSquare.col && firstSquare.row == secondSquare.row) {
        var travel = secondSquare.col - firstSquare.col + 1;
        gmodel.updateState(firstSquare.row, firstSquare.col, travel);
        buildSequence(firstSquare.$, travel);
      }

      if (event.button == 1) {
        $('#centerpiece').unbind("mousemove");
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
   while ( parseInt($piece.attr('sequence'), 10) === 
     parseInt($piece.next().attr('sequence'), 10) - 1 ) {

    func.apply($piece); 
    $piece = $piece.next();
  }
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
    //this.on('click', normalClickFunc);
  };
  //removeSeq.apply($piece);
  doToSequence($piece, removeSeq);
}

function normalClickFunc() {
  $(this).addClass('clicked');

  var row = $(this).attr('row');
  var col = $(this).attr('col');

  var freshState = gmodel.getState(row, col) === 1 ? 0 : 1;

  gmodel.updateState(row, col, freshState);

  setTimeout(function (square) {
    $('.clicked').removeClass('clicked');
    $(square).toggleClass('active');
    if ( $(square).seq() > 0 ) {
      $(square).clearSeq();
    } else {
      $(square).attr('sequence', '1');
    }

  }, exports.TRANSITION_TIME, this);
}

function buildSequence($start, travel) {
  $start.addClass('active joined');
  $start.attr('sequence', travel);

  var $cur = $start;
  while (--travel > 0) {
    $cur = $cur.next();
    $cur.addClass('joined');
    $cur.attr('sequence', travel);
  }

}

exports.init = init;
exports.initGridZoom = initGridZoom;
window.gridInit = init;
