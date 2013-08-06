exports.TRANSITION_TIME = 450;

var gmodel = require('./gridModel.js'),
    Util = require('./Util.js');

function init() {
  $('#grid').children().remove();
  $('rect').off('click mouseenter mouseleave');
  var totalVoices = gmodel.numVoices(), 
    length = 16;

  for (var voice = 0; voice < totalVoices; voice++) {
    var row = $('<section>').addClass('rowContainer');

    for (var cube = 0; cube < length; cube++) {
      var $square = $('<rect sequence>');
      var activeStatus = gmodel.getState(voice, cube);

      //$square.on("click", normalClickFunc);
      row.append($square.attr('col', cube).attr('row', voice)
        .text(gmodel.getNoteFromRow(voice)));
    }

    $('#grid').append(row);
   
  }

  var figureSize = computeFigureSize();
  initGridZoom();
}

function loadModel() {
  var joinCounter = 0;
  //Continues the multinote
  if (joinCounter > 1) {
    joinCounter--;
    fig.addClass('joined')
      .attr('sequence', joinCounter)
      .hover(hoverFunc, hoverFunc);

    //Starts the multinote
  } else if (activeStatus > 1) {
    joinCounter = activeStatus;
    fig.attr('sequence', activeStatus)
      .addClass('active joined')
      .hover(hoverFunc, hoverFunc);

    //Single note
  } else if (activeStatus == 1) {
    fig.addClass('active');

  }
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
  
  $('rect').on( 'mouseenter', function () {
    $(this).addClass('hovering');
    if ( !_.isNaN($(this).seq()) ) {
      $('[sequence="' + $(this).seq() + '"][row="' + $(this).row() + '"]').addClass('slaveHover'); 
    }
  });

  $('rect').on( 'mouseleave', function () {
    $(this).removeClass('hovering');
    if ( !_.isNaN($(this).seq()) ) {
      $('[sequence="' + $(this).seq() + '"]').removeClass('slaveHover'); 
    }
  });

  $('rect').on( 'mousedown', function (event) {
    var joining = true;
    $(this).addClass('almostJoined');

    $('rect').on( 'mouseenter', function (event) {
      if (joining) {
        $(this).addClass('almostJoined');
      }
    });

    var firstSquare = {};
    firstSquare.$ = $('rect.hovering');
    firstSquare.row = firstSquare.$.attr('row');
    firstSquare.col = firstSquare.$.attr('col');
    $(document).off('mouseup');
    $(document).on( 'mouseup', function (event) {
      $('rect.almostJoined').removeClass('almostJoined');
      joining = false;
      var secondSquare = {};
      secondSquare.$ = $('rect.hovering');
      secondSquare.row = secondSquare.$.attr('row');
      secondSquare.col = secondSquare.$.attr('col');
      if (firstSquare.col != secondSquare.col && 
          firstSquare.row == secondSquare.row &&
          !secondSquare.$.hasClass('active') ) {
        var travel = secondSquare.col - firstSquare.col + 1;
        gmodel.updateState(firstSquare.row, firstSquare.col, travel);
        buildSequence(firstSquare.$, travel);
      } else if (firstSquare.col == secondSquare.col && firstSquare.row == secondSquare.row) {
        normalClickFunc.apply(firstSquare.$);
      }


      if (event.button == 1) {
        $('#centerpiece').off('mousemove');
      }
    });

    if (event.button != 1) return;
    var xPos = event.pageX;
    var xOff = xPos - $('#centerpiece').offset().left;
    var yPos = event.pageY;
    var yOff = yPos - $('#centerpiece').offset().top;

    $('#centerpiece').on('mousemove', function (event) {
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

function normalClickFunc() {
  //$(this).addClass('clicked');

  var row = $(this).row();
  var col = $(this).col();

  var freshState = gmodel.getState(row, col) === 1 ? 0 : 1;
  gmodel.updateState(row, col, freshState);
  $(this).addClass('active clicked');

  if ( !_.isNaN($(this).seq()) ) {
    var $multinote = $('[row="' + $(this).row() + '"][' + 'sequence="' + $(this).seq() + '"]'); 
    $('[sequence="' + $(this).seq() + '"]').removeClass('slaveHover'); 
    $multinote.seq('');
    $multinote.removeClass('active joined');
  } else {
    $(this).seq( $(this).col() );
  }

  setTimeout(function ($square) {
    $('.clicked').removeClass('clicked');
  }, exports.TRANSITION_TIME, $(this));
}

function buildSequence($start, travel) {
  $start.addClass('active joined');
  var col = $start.col();
  $start.attr('sequence', col);
  var $cur = $start;
  while (--travel > 0) {
    $cur = $cur.next();
    $cur.addClass('joined');
    $cur.attr('sequence', col);
  }

}

exports.$grab = function(col, row) {
  return $('rect[row="' + row + '"][col="' + col + '"]');
};

exports.init = init;
exports.initGridZoom = initGridZoom;
window.gridInit = init;
