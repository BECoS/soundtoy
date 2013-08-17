exports.TRANSITION_TIME = 450;

var gmodel = require('./gridModel.js'),
    Util = require('./Util.js'),
    smodel = require('./soundModel.js');

function rebuildGrid() {
  $('#grid').children().remove();
  $('rect').off('click mouseenter mouseleave');
  var totalVoices = gmodel.numVoices();

  for (var voice = 0; voice < smodel.length(); voice++) {
    var row = $('<section>').addClass('rowContainer');

    for (var cube = 0; cube < smodel.width(); cube++) {
      var $square = $('<rect sequence>');

      row.append($square.attr('col', cube).attr('row', voice)
        .text(gmodel.getNoteFromRow(voice)));
    }

    $('#grid').append(row);
   
  }

}

function init() {
  rebuildGrid();
  initGridZoom();
  $('head').append( 
      $('<meta>')
        .attr('property', 'zoomLevel')
        .attr('content', '16'));
}

function refresh() {
  rebuildGrid();
  initGridZoom();
  loadModel();
}

function property(name, value) {
  if (Util.existy(value)) {
    $('[property="' + name + '"]').attr('content', value);
  }
  return $('[property="' + name + '"]').attr('content');
}

function multinote($square, length) {
  var col = $square.col();
  $square
    .attr('sequence', col)
    .addClass('active joined');
  do {
    $square
      .attr('sequence', col)
      .addClass('joined');
    $square = $square.next();
  } while (--length > 0);
}

function loadModel() {
  for (var row = 0; row < smodel.length(); row++) {
    for (var col = 0; col < smodel.width(); col++) {

      var activeStatus = gmodel.getState(col, row);
      var $square = exports.$grab(col, row);

      if (activeStatus > 1) {
        multinote($square, activeStatus);

      } else if (activeStatus == 1) {
        $square.addClass('active');
      }

    }
  }

}

function computeFigureSize() {
  var containWidth = $('#grid').width();
  var containHeight = $('#grid').height();
  return [containWidth / 16 - 2, containHeight / 16 - 2];
}

function initGridZoom() {
  var shrinkSize = 2;
  var isZooming = false;
  var startingPoint = [ 0, 0 ];

  $(document).off('mousewheel')
    .on('mousewheel', function (event) {
      var zoomLevel = property('zoomLevel');
      isZooming = true;
      setTimeout( function () {
        isZooming = false;
      }, 500);
      startingPoint = [ event.clientX, event.clientY ];
      var gridCenterPoint = $('#grid');
      if (event.originalEvent.wheelDeltaY < 0) {
        if (zoomLevel <= 0) return;
        $('rect').width($('rect').width() - shrinkSize )
          .height($('rect').height() - shrinkSize);
         
        $('.rowContainer').height($('rect').height() + shrinkSize);

        $('rect').css('font-size', zoomLevel-- );
      } else {
        if (zoomLevel >= 64) return;
        $('rect').width($('rect').width() + shrinkSize )
          .height($('rect').height() + shrinkSize );

        $('.rowContainer').height($('rect').height() + shrinkSize);

        $('rect').css('font-size', zoomLevel++ );
      }
      property('zoomLevel', zoomLevel);
    });
  
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
        gmodel.updateState(firstSquare.col, firstSquare.row, travel);
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

function updateState($square) {
  var row = $square.row();
  var col = $square.col();
  if (!$square.hasClass('joined')) {
    var freshState = gmodel.getState(col, row) == 1 ? 0 : 1;
    gmodel.updateState(col, row, freshState);
  } else {
    gmodel.updateState($square.seq(), row, 0);
  }
}

function normalClickFunc() {
  updateState($(this));
  $(this).addClass('clicked');

  if ( !_.isNaN($(this).seq()) ) {
    var $multinote = $('[row="' + $(this).row() + '"][' + 'sequence="' + $(this).seq() + '"]'); 
    $('[sequence="' + $(this).seq() + '"]').removeClass('slaveHover'); 
    $multinote.seq('');
    $multinote.removeClass('active joined');
  } else {
    $(this).seq( $(this).col() ).addClass('active');
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
exports.rebuildGrid = rebuildGrid;
exports.initGridZoom = initGridZoom;
exports.refresh = refresh;
window.gridInit = init;
