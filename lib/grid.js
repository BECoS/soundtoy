var gmodel = require('./gridModel.js');

function initView () {
  var totalVoices = gmodel.numVoices();
  var length = 16;
  for (var voice = 0; voice < totalVoices; voice++) {
    var row = $('<section>').addClass('tContainer');
    for (var cube = 0; cube < length; cube++) {
      var activeStatus = gmodel.getState(voice, cube) === 1 ? 'active' : 'inactive'; 
      row.append($('<figure>').addClass(activeStatus +  ' square_' +
        gmodel.getNoteFromRow(voice) + ' col' + cube) 
        .attr('col', cube).attr('row', voice)
        .text(gmodel.getNoteFromRow(voice))
      );
    }
    $('#grid').append(row);
  }
  var figureSize = computeFigureSize();
  //$('figure').width(figureSize[0]);
  //$('figure').height(figureSize[1]);
}

function computeFigureSize() {
  var containWidth = $('#grid').width();
  var containHeight = $('#grid').height();
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
});

function cullColumns() {
  var boundary = computeFigureSize();
  var cols;
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
       
      $('.tContainer').height($('figure').height() + shrinkSize);

      $('figure').css('font-size', zoomLevel-- );
    } else {
      if (zoomLevel === 32) return;
      $('figure').width($('figure').width() + shrinkSize )
        .height($('figure').height() + shrinkSize );

      $('.tContainer').height($('figure').height() + shrinkSize);


      $('figure').css('font-size', zoomLevel++ );
    }
  };
  
  $(document).mouseup( function (e) {
    $('#centerpiece').unbind("mousemove");
  });

  $('figure').mousedown( function (e) {
    var xPos = event.pageX;
    var xOff = xPos - $('#centerpiece').offset().left;
    var yPos = event.pageY;
    var yOff = yPos - $('#centerpiece').offset().top;

    $('#centerpiece').bind("mousemove", function (e) {
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

function initAudio() {
  gmodel.initialize();
}
