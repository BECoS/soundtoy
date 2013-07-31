var smodel = require('./soundModel.js');
var imgpreload = 
require('../node_modules/imgpreload/imgpreload.js').imgpreload;

var myAudioContext = new webkitAudioContext();
var myAudioAnalyser = myAudioContext.createAnalyser();

function addWindowBar() {

  $('#adsr-container').prepend(
    $('<div>').addClass('panelBar').append(
      $('<p>').addClass('instrTitle').text('Additive'),
      $('<p>').addClass('minimize').html('&#8632;')));

  $('.currentTray').append( 
    $('<p>').addClass('minimize hidden instrTitle').html('Additive &#8632;')
  );

  $('.minimize').on( 'click', function (e) {

    $('.currentTray .minimize').toggleClass('hidden');

    if ( $('.currentTray .minimize').hasClass('hidden') ) {
      $('#panel').animate( { top: '40px' }, 600 );   
    } else {
      $('#panel').animate( { top: $(document).height() }, 600 );   
    }

  });
}

function addCurrentTray() {
  $('#selector').append('<div class="currentTray"></div>');
}

function init() {
  myAudioAnalyser.smoothingTimeconstant = 0.85;
  myAudioAnalyser.connect(myAudioContext.destination);
  addCurrentTray();
  addWindowBar();
  var Kinetic = require('../node_modules/kinetic/kinetic.js').Kinetic;
  var stage = new Kinetic.Stage({
    container: 'bar',
    width: $('#bar').width() * 0.9,
    height: $('#bar').height() * 0.9, 
  });

  var ctrlLayer = new Kinetic.Layer();
  var gainLayer = new Kinetic.Layer();
  var vuLayer = new Kinetic.Layer();

  imgpreload(["img/playButtonOff.svg", "img/playButtonOn.svg", "img/stopOff.svg", 
    "img/stopOn.svg", "img/recordOff.svg", "img/recordOn.svg", "img/tempo.svg",
    "img/tempoToggleOff.svg", "img/tempoToggleDown.svg", "img/tempoToggleOn.svg",
    "img/tempoToggleOnDown.svg", "img/gainDial.png"], function(images) {
      var playInactive = new Kinetic.Image({
        x: 0,
        y: 2,
        height: $('#bar').height() * 0.6,
        image: images[0]
      });
      playInactive.setWidth(playInactive.getHeight());

      var stopInactive = playInactive.clone({x: playInactive.getWidth() + 5, image: images[2]});
      var recordInactive = playInactive.clone({x: stopInactive.getX() * 2, image: images[4]});
      var tempo = new Kinetic.Image({
        x: stage.getWidth() - 175,
          y: 0,
          height: $('#bar').height() * 0.7,
          image: images[6]
      });
      var tempoUp = new Kinetic.Image({
        x: tempo.getX() + tempo.getWidth() + 2,
          y: 0,
          height: $('#bar').height() * 0.34,
          width: $('#bar').height() * 0.6,
          image: images[7]
      });
      var tempoDown = tempoUp.clone({y: tempoUp.getHeight() + 1, image: images[8]});
      var gainDial = new Kinetic.Image({
        x: 99,
          image: images[11],
          draggable: true,
          dragBoundFunc: function(pos) {
            var newX;
            if (pos.x <= 99) {
              newX = 99;
            }
            else if (pos.x >= 239) {
              newX = 239;
            }
            else {
              newX = pos.x;
            }
            return {
              x: newX,
              y: this.getAbsolutePosition().y
            };
          }
      });

      ctrlLayer.add(playInactive);
      ctrlLayer.add(stopInactive);
      ctrlLayer.add(recordInactive);
      ctrlLayer.add(tempo);
      ctrlLayer.add(tempoUp);
      ctrlLayer.add(tempoDown);
      ctrlLayer.add(gainDial);
      ctrlLayer.draw();
      stage.add(vuLayer);
      stage.add(gainLayer);
      stage.add(ctrlLayer);      

      var playActive = playInactive.clone({image: images[1]});
      var stopActive = stopInactive.clone({image: images[3]});
      var recordActive = recordInactive.clone({image: images[5]});
      var tempoUpActive = tempoUp.clone({image: images[9]});
      var tempoDownActive = tempoDown.clone({image: images[10]});

      playInactive.createImageHitRegion(function() {
        playInactive.getLayer().drawHit();
      });

      playInactive.on('mousedown', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(playActive);
        ctrlLayer.draw();
        smodel.start();
        mySpectrum = setInterval( function() {drawSpectrum(vuLayer); }, 30);
      });

      playActive.on('mousedown', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(playInactive);
        ctrlLayer.draw();
        smodel.stop();
        //clearInterval(mySpectrum);
      });   

      stopInactive.on('mousedown', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(stopActive);
        smodel.stop();
        ctrlLayer.draw();
      });

      stopActive.on('mouseup', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(stopInactive);
        ctrlLayer.add(playInactive);
        ctrlLayer.draw();
      });

      recordInactive.on('mousedown', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(recordActive);
        ctrlLayer.draw();
      });

      recordActive.on('mousedown', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(recordInactive);
        ctrlLayer.draw();
      });  

      tempoUp.on('mousedown', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(tempoUpActive);
        ctrlLayer.draw();
      });

      tempoUpActive.on('mouseup', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(tempoUp);
        ctrlLayer.draw();
      });

      tempoDown.on('mousedown', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(tempoDownActive);
        ctrlLayer.draw();
      });

      tempoDownActive.on('mouseup', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(tempoDown);
        ctrlLayer.draw();
      });

      //drawGainContainer(gainLayer);

    }); 

  //ADSR CODE
  var adsrStage = new Kinetic.Stage({
    container: 'adsr-container',
    width: 200,
    height: 180
  });

  var lineLayer = new Kinetic.Layer();
  var centerLayer = new Kinetic.Layer();
  var graphLayer = new Kinetic.Layer();

  var cellLayer = new Kinetic.Layer();
  var fillLayer = new Kinetic.Layer();
  var isDown = false;

  // build ATK
  var atkLine = new Kinetic.Line({
    strokeWidth: 3,
      stroke: 'green',
      points: [{
        x: 0,
        y: adsrStage.getHeight() * (3/4)
      }, {
        x: adsrStage.getWidth() / 4,
      y: 0
      }],
  });

  // build DCY
  var dcyLine = new Kinetic.Line({
    strokeWidth: 3,
      stroke: 'orange',
      points: [{
        x: adsrStage.getWidth() / 4,
        y: 0
      }, {
        x: adsrStage.getWidth() / 2,
        y: adsrStage.getHeight() * (3 / 4) - 50
      }],
  });

  // build STN
  var stnLine = new Kinetic.Line({
    strokeWidth: 3,
      stroke: 'lightblue',
      points: [{
        x: adsrStage.getWidth() / 2,
        y: adsrStage.getHeight() * (3 / 4) - 50
      }, {
        x: adsrStage.getWidth() * (3 / 4),
        y: adsrStage.getHeight() * (3 / 4) - 50
      }],
  });

  // build RLS
  var rlsLine = new Kinetic.Line({
    strokeWidth: 3,
      stroke: 'pink',
      points: [{
        x: adsrStage.getWidth() * (3 / 4),
        y: adsrStage.getHeight() * (3 / 4) - 50
      }, {
        x: adsrStage.getWidth(),
        y: adsrStage.getHeight() * (3 / 4)
      }],
  });

  var atkDragger = new Kinetic.Circle({
    x: (atkLine.attrs.points[0].x + atkLine.attrs.points[1].x) / 2,
      y: (atkLine.attrs.points[0].y + atkLine.attrs.points[1].y) / 2,
      radius: 6,
      fill: 'orange',
      draggable: true,
      dragBoundFunc: function(pos) {
        var m = slope(atkLine.attrs.points[0].x, atkLine.attrs.points[1].x, atkLine.attrs.points[0].y, atkLine.attrs.points[1].y);
        var newX;
        if (pos.x > atkLine.attrs.points[1].x) {
          newX = atkLine.attrs.points[1].x;
        }
        else if (pos.x < atkLine.attrs.points[0].x) {
          newX = atkLine.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
  return {
    x: newX,
    y: (newX * m) + yIntercept(atkDragger.getX(), atkDragger.getY(), m)
  };
      }
  });

  var dcyDragger = new Kinetic.Circle({
    x: (dcyLine.attrs.points[0].x + dcyLine.attrs.points[1].x) / 2,
      y: (dcyLine.attrs.points[0].y + dcyLine.attrs.points[1].y) / 2,
      radius: 6,
      fill: 'black',
      draggable: true,
      dragBoundFunc: function(pos) {
        var m = slope(dcyLine.attrs.points[0].x, dcyLine.attrs.points[1].x, dcyLine.attrs.points[0].y, dcyLine.attrs.points[1].y);
        var newX;
        if (pos.x > dcyLine.attrs.points[1].x) {
          newX = dcyLine.attrs.points[1].x;
        }
        else if (pos.x < dcyLine.attrs.points[0].x) {
          newX = dcyLine.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
  return {
    x: newX,
      y: (newX * m) + yIntercept(dcyDragger.getX(), dcyDragger.getY(), m)
  };
      }
  });

  var stnDragger = new Kinetic.Circle({
    x: (stnLine.attrs.points[0].x + stnLine.attrs.points[1].x) / 2,
      y: (stnLine.attrs.points[0].y + stnLine.attrs.points[1].y) / 2,
      radius: 6,
      fill: 'black',
      draggable: true,
      dragBoundFunc: function(pos) {
        var newY;
        if (pos.y < 0) {
          newY = 0;
        }
        else if (pos.y > adsrStage.getHeight() * (3 / 4)) {
          newY = adsrStage.getHeight() * (3 / 4);
        }
        else {
          newY = pos.y;
        }
  return {
    x: this.getAbsolutePosition().x,
      y: newY
  };
      }
  });

  var rlsDragger = new Kinetic.Circle({
    x: (rlsLine.attrs.points[0].x + rlsLine.attrs.points[1].x) / 2,
      y: (rlsLine.attrs.points[0].y + rlsLine.attrs.points[1].y) / 2,
      radius: 6,
      fill: 'black',
      draggable: true,
      dragBoundFunc: function(pos) {
        var m = slope(rlsLine.attrs.points[0].x, rlsLine.attrs.points[1].x, rlsLine.attrs.points[0].y, rlsLine.attrs.points[1].y);
        var newX;
        if (pos.x > rlsLine.attrs.points[1].x) {
          newX = rlsLine.attrs.points[1].x;
        }
        else if (pos.x < rlsLine.attrs.points[0].x) {
          newX = rlsLine.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
  return {
    x: newX,
      y: (newX * m) + yIntercept(rlsDragger.getX(), rlsDragger.getY(), m)
  };
      }
  });

  var atkCell = new Kinetic.Shape({
    drawFunc: function(canvas) {
      var context = canvas.getContext();
      var x = 5;
      var y = adsrStage.getHeight() - 25;
      var width = 40;
      var height = 20;
      var radius = 10;

      context.beginPath();

      // draw top and top right corner
      context.moveTo(x+radius,y);
      context.arcTo(x+width,y,x+width,y+radius,radius);

      // draw right side and bottom right corner
      context.arcTo(x+width,y+height,x+width-radius,y+height,radius); 

      // draw bottom and bottom left corner
      context.arcTo(x,y+height,x,y+height-radius,radius);

      // draw left and top left corner
      context.arcTo(x,y,x+radius,y,radius);

      context.moveTo(x+radius,y);
      context.lineTo(x+radius, y + height);

      context.moveTo(x+radius+10, y);
      context.lineTo(x+radius+10, y + height);

      context.moveTo(x+radius+20, y);
      context.lineTo(x+radius+20, y + height);	

      context.closePath();
      canvas.fillStroke(this);
    },
      stroke: 'black',
      strokeWidth: 1.5
  });

  var dcyCell = atkCell.clone({x: 50});
  var stnCell = dcyCell.clone({x: 100});
  var rlsCell = stnCell.clone({x: 150});

  var atkFill = new Kinetic.Rect({
    x: 5,
    y: adsrStage.getHeight() - 25,
    width: 0,
    height: 20,
    fillLinearGradientStartPoint: [35, 0],
    fillLinearGradientEndPoint: [35, 15],
    fillLinearGradientColorStops: [0, '#39e639', 1, '#00cc00']
  });

  var dcyFill = atkFill.clone({x: 55});
  var stnFill = dcyFill.clone({x: 105});
  var rlsFill = stnFill.clone({x: 155});
  atkFill.setId('atkFill');
  dcyFill.setId('dcyFill');
  stnFill.setId('stnFill');
  rlsFill.setId('rlsFill');

  atkCell.on('mousedown', function() {
    isDown = true;
    fillLayer.drawScene();
  });

  atkCell.on('mouseover', function() {
    this.setShadowEnabled(true);
    this.setShadowColor('#70ed3b');
    this.setShadowBlur(5);
    this.setShadowOffset(0);
    this.setShadowOpacity(1);
    this.getLayer().draw();
  });

  atkCell.on('mouseout', function() {
    isDown = false;
    this.setShadowEnabled(false);
    this.getLayer().draw();
  });				

  atkCell.on('mousemove', function() {
    if (isDown) {
      var mouseXY = adsrStage.getMousePosition();
      var canvasX = mouseXY.x;
      var atkFill = fillLayer.get('#atkFill')[0];
      var canvas = atkCell.getLayer().getCanvas();
      var context = canvas.getContext();
      atkFill.setWidth(canvasX-atkFill.getX());
      fillLayer.draw();
    }					
  });

  atkCell.on('mouseup', function() {
    isDown = false;
  });

  dcyCell.on('mousedown', function() {
    isDown = true;
    fillLayer.drawScene();
  });

  dcyCell.on('mouseover', function() {
    this.setShadowEnabled(true);
    this.setShadowColor('#70ed3b');
    this.setShadowBlur(5);
    this.setShadowOffset(0);
    this.setShadowOpacity(1);
    this.getLayer().draw();
  });

  dcyCell.on('mouseout', function() {
    isDown = false;
    this.setShadowEnabled(false);
    this.getLayer().draw();
  });				

  dcyCell.on('mousemove', function() {
    if (isDown) {

      var mouseXY = adsrStage.getMousePosition();
      var canvasX = mouseXY.x;

      var dcyFill = fillLayer.get('#dcyFill')[0];
      var canvas = this.getLayer().getCanvas();
      var context = canvas.getContext();
      dcyFill.setWidth(canvasX-dcyFill.getX());
      fillLayer.draw();
    }					
  });

  dcyCell.on('mouseup', function() {
    isDown = false;
  });				

  stnCell.on('mousedown', function() {
    isDown = true;
    fillLayer.drawScene();
  });

  stnCell.on('mouseover', function() {
    this.setShadowEnabled(true);
    this.setShadowColor('#70ed3b');
    this.setShadowBlur(5);
    this.setShadowOffset(0);
    this.setShadowOpacity(1);
    this.getLayer().draw();
  });

  stnCell.on('mouseout', function() {
    isDown = false;
    this.setShadowEnabled(false);
    this.getLayer().draw();
  });				

  stnCell.on('mousemove', function() {
    if (isDown) {
      var mouseXY = adsrStage.getMousePosition();
      var canvasX = mouseXY.x;

      var stnFill = fillLayer.get('#stnFill')[0];
      var canvas = this.getLayer().getCanvas();
      var context = canvas.getContext();
      stnFill.setWidth(canvasX-stnFill.getX());
      fillLayer.draw();
    }					
  });

  stnCell.on('mouseup', function() {
    isDown = false;
  });	

  rlsCell.on('mousedown', function() {
    isDown = true;
    fillLayer.drawScene();
  });

  rlsCell.on('mouseover', function() {
    this.setShadowEnabled(true);
    this.setShadowColor('#70ed3b');
    this.setShadowBlur(5);
    this.setShadowOffset(0);
    this.setShadowOpacity(1);
    this.getLayer().draw();
  });

  rlsCell.on('mouseout', function() {
    isDown = false;
    this.setShadowEnabled(false);
    this.getLayer().draw();
  });				

  rlsCell.on('mousemove', function() {
    if (isDown) {
      var mouseXY = adsrStage.getMousePosition();
      var canvasX = mouseXY.x;
      var rlsFill = fillLayer.get('#rlsFill')[0];
      var canvas = this.getLayer().getCanvas();
      var context = canvas.getContext();
      rlsFill.setWidth(canvasX-rlsFill.getX());
      fillLayer.draw();
    }					
  });

  rlsCell.on('mouseup', function() {
    isDown = false;
  });	

  cellLayer.add(atkCell);
  cellLayer.add(dcyCell);
  cellLayer.add(stnCell);
  cellLayer.add(rlsCell);				
  fillLayer.add(atkFill);
  fillLayer.add(dcyFill);
  fillLayer.add(stnFill);
  fillLayer.add(rlsFill);

  centerLayer.add(atkDragger);
  centerLayer.add(dcyDragger);
  centerLayer.add(stnDragger);
  centerLayer.add(rlsDragger);

  adsrStage.add(graphLayer);
  adsrStage.add(lineLayer);
  adsrStage.add(centerLayer);
  adsrStage.add(fillLayer);
  adsrStage.add(cellLayer);

  atkDragger.on('dragstart', (function () {
    atkDragger.getLayer().on('draw', function () { 
      drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
      smodel.attack( ( 100 - atkDragger.getY() ) / 100);
    });
  }));

  dcyDragger.on('dragstart', (function () {
    dcyDragger.getLayer().on('draw', function () {
      drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
      smodel.decay( ( 100 - dcyDragger.getY() ) / 100);
    });
  }));

  stnDragger.on('dragstart', (function () {
    stnDragger.getLayer().on('draw', function () {
      smodel.sustain( ( 100 - stnDragger.getY() ) / 100);
      stnLine.attrs.points[0].y = stnDragger.getY();
      stnLine.attrs.points[1].y = stnDragger.getY();
      dcyLine.attrs.points[1].y = stnDragger.getY();
      rlsLine.attrs.points[0].y = stnDragger.getY();

      var dcySlope = slope(dcyLine.attrs.points[0].x, dcyLine.attrs.points[1].x, dcyLine.attrs.points[0].y, dcyLine.attrs.points[1].y);
      dcyDragger.setY((dcySlope * dcyDragger.getX()) + yIntercept(dcyLine.attrs.points[1].x, atkLine.attrs.points[1].y, dcySlope));
      dcyDragger.dragBoundFunc = function(pos) {
        var newX;
        if (pos.x > dcyLine.attrs.points[1].x) {
          newX = dcyLine.attrs.points[1].x;
        }
        else if (pos.x < dcyLine.attrs.points[0].x) {
          newX = dcyLine.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
    return {
      x: newX,
        y: (newX * dcySlope) + yIntercept(dcyDragger.getX(), dcyDragger.getY(), dcySlope)
    };
      };

      var rlsSlope = slope(rlsLine.attrs.points[0].x, rlsLine.attrs.points[1].x, rlsLine.attrs.points[0].y, rlsLine.attrs.points[1].y);
      rlsDragger.setY((rlsSlope * rlsDragger.getX()) + yIntercept(rlsLine.attrs.points[1].x, stnLine.attrs.points[1].y, rlsSlope));
      rlsDragger.dragBoundFunc = function(pos) {
        var newX;
        if (pos.x > rlsLine.attrs.points[1].x) {
          newX = rlsLine.attrs.points[1].x;
        }
        else if (pos.x < rlsLine.attrs.points[0].x) {
          newX = rlsLine.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
        return {
          x: newX,
            y: (newX * rlsSlope) + yIntercept(rlsDragger.getX(), rlsDragger.getY(), rlsSlope)
        };
      };
      drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
    });
  }));

  rlsDragger.on('dragstart', (function () {
    rlsDragger.getLayer().on('draw', function () {
      drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
      smodel.release( ( 100 - rlsDragger.getY() ) / 100);
    });
  }));

  //end ADSR 

  drawCurves(lineLayer, stem, stem2, stem3, stem4, c6, c7, c8, c9);
  centerLayer.draw();
  drawBackground(graphLayer, 11, 11, 10, "#ccc");  
  clipper(fillLayer); 

  $('#adsr-container').before('<h1 class="instrument">Additive &#43;</h1>');
  $('#adsr-container').append('<!-- Squared ONE --><div class="squaredOne">' + 
      '<input type="checkbox" value="None" id="squaredOne" name="check">' + 
      '</input><label for="squaredOne"></label></div>');

  $('#squaredOne').change(function() {
    invert(centerLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, rlsDragger);
    drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
  });

}

function drawGainContainer(gainLayer) {
  var ctx = gainLayer.getCanvas().getContext();
  var bar_width = 10;
  var width = 150;
  var height = $('#bar').height() * 0.9;

  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < width / 10; j++) {
      ctx.strokeStyle = 'black';
      ctx.strokeRect(100 + (j * 10), (bar_width * i) + 5, bar_width, bar_width); //x,y,xwidth,yheight
    }
  }
}

function drawSpectrum(vuLayer) {
  var ctx = vuLayer.getCanvas().getContext();
  var width = 150;//vuLayer.getCanvas().width;
  var height = $('#bar').height * 0.9;//vuLayer.getCanvas().height;
  var bar_width = 10;

  ctx.clearRect(0, 0, 500, 500);
  var freqByteData = new Uint8Array(myAudioAnalyser.frequencyBinCount);
  myAudioAnalyser.getByteFrequencyData(freqByteData);
  var barCount = Math.round(width / bar_width);
  var averageVolume = getAverageVolume(freqByteData, barCount);
  var correctedVolume;
  if (averageVolume - 60 < 0) {
    correctedVolume = 0;
  }
  else {
    correctedVolume = averageVolume - 95;
  }
  //console.log(averageVolume);
  var grd = ctx.createLinearGradient(100, 2.5, 250, 2.5);

  //lime
  grd.addColorStop(0, '#00ff00');
  //yellow
  grd.addColorStop(0.25, '#ffff00');
  //orange
  grd.addColorStop(0.75, '#ffa500');
  //red
  grd.addColorStop(1, '#ff0000');
  
  //for (var i = 0; i < 2; i++) {
  //  ctx.fillStyle = grd;
  //  ctx.fillRect(100, (bar_width * i) + 2.5, correctedVolume, bar_width);//ctx.fillRect(150, (bar_width * i) + 2.5, averageVolume - 60, bar_width);
  //}
}

function getAverageVolume(freqByteData, barCount) {
  var magnitude = 0;
  var average;

  for (var i = 0; i < barCount; i++) {
    magnitude += freqByteData[i];
  }

  average = magnitude / barCount;
  return average;
}

//ADSR CODE
function drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger) {
  var canvas = lineLayer.getCanvas();
  var context = canvas.getContext();

  canvas.clear();

  // draw quad
  context.beginPath();
  context.moveTo(atkLine.attrs.points[0].x, atkLine.attrs.points[0].y);
  context.quadraticCurveTo(atkDragger.getX(), atkDragger.getY(), atkLine.attrs.points[1].x, atkLine.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(dcyLine.attrs.points[0].x, dcyLine.attrs.points[0].y);
  context.quadraticCurveTo(dcyDragger.getX(), dcyDragger.getY(), dcyLine.attrs.points[1].x, dcyLine.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(stnLine.attrs.points[0].x, stnLine.attrs.points[0].y);
  context.lineTo(stnLine.attrs.points[1].x, stnLine.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(rlsLine.attrs.points[0].x, rlsLine.attrs.points[0].y);
  context.quadraticCurveTo(rlsDragger.getX(), rlsDragger.getY(), rlsLine.attrs.points[1].x, rlsLine.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();
}  

function drawBackground(graphLayer, xcount, ycount, width, color) {
  var canvas = graphLayer.getCanvas();
  var context = canvas.getContext();

  canvas.width = 200;//xcount * width + 1;
  canvas.height = 150;//ycount * width + 1;

  // Create gradients
  var grad = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#398235');
  grad.addColorStop(0.25, '#8ab66b');
  grad.addColorStop(0.5, '#c9de96');
  grad.addColorStop(0.75, '#8ab66b');
  grad.addColorStop(1, '#398235');

  for (var x = 0.5; x < canvas.width; x += width) {
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
  }

  for (var y = 0.5; y < canvas.height; y += width) {
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
  }

  context.fillStyle = grad;
  context.fillRect(0,0,canvas.width, canvas.height);
  context.strokeStyle = color;
  context.stroke();
}   

function invert(centerLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, rlsDragger) {
  //storecoordinate
  var oldY = atkLine.attrs.points[0].y;

  //set the line coordinates to match
  atkLine.attrs.points[0].y = atkLine.attrs.points[1].y;
  atkLine.attrs.points[1].y = oldY;

  dcyLine.attrs.points[0].y = oldY;

  rlsLine.attrs.points[1].y = atkLine.attrs.points[0].y;

  var atkSlope = slope(atkLine.attrs.points[0].x, atkLine.attrs.points[1].x, atkLine.attrs.points[0].y, atkLine.attrs.points[1].y);
  atkDragger.setY((atkSlope * atkDragger.getX()) + yIntercept(atkLine.attrs.points[1].x, atkLine.attrs.points[0].y, atkSlope));
  atkDragger.dragBoundFunc = function(pos) {
    var newX;
    if (pos.x > atkLine.attrs.points[1].x) {
      newX = atkLine.attrs.points[1].x;
    }
    else if (pos.x < atkLine.attrs.points[0].x) {
      newX = atkLine.attrs.points[0].x;
    }
    else {
      newX = pos.x;
    }
    return {
      x: newX,
        y: (newX * atkSlope) + yIntercept(atkDragger.getX(), atkDragger.getY(), atkSlope)
    };
  };

  var dcySlope = slope(dcyLine.attrs.points[0].x, dcyLine.attrs.points[1].x, dcyLine.attrs.points[0].y, dcyLine.attrs.points[1].y);
  dcyDragger.setY((dcySlope * dcyDragger.getX()) + yIntercept(dcyLine.attrs.points[1].x, atkLine.attrs.points[1].y, dcySlope));
  dcyDragger.dragBoundFunc = function(pos) {
    var newX;
    if (pos.x > dcyLine.attrs.points[1].x) {
      newX = dcyLine.attrs.points[1].x;
    }
    else if (pos.x < dcyLine.attrs.points[0].x) {
      newX = dcyLine.attrs.points[0].x;
    }
    else {
      newX = pos.x;
    }
    return {
      x: newX,
        y: (newX * dcySlope) + yIntercept(dcyDragger.getX(), dcyDragger.getY(), dcySlope)
    };
  };

  var rlsSlope = slope(rlsLine.attrs.points[0].x, rlsLine.attrs.points[1].x, rlsLine.attrs.points[0].y, rlsLine.attrs.points[1].y);
  rlsDragger.setY((rlsSlope * rlsDragger.getX()) + yIntercept(rlsLine.attrs.points[1].x, stnLine.attrs.points[1].y, rlsSlope));
  rlsDragger.dragBoundFunc = function(pos) {
    var newX;
    if (pos.x > rlsLine.attrs.points[1].x) {
      newX = rlsLine.attrs.points[1].x;
    }
    else if (pos.x < rlsLine.attrs.points[0].x) {
      newX = rlsLine.attrs.points[0].x;
    }
    else {
      newX = pos.x;
    }
    return {
      x: newX,
        y: (newX * rlsSlope) + yIntercept(rlsDragger.getX(), rlsDragger.getY(), rlsSlope)
    };
  };       
  centerLayer.draw();
}

function yIntercept(x, y, m) {
  var yInt = y - (m * x);
  return yInt;
}

function slope(x1, x2, y1, y2) {
  var m = -1 * ((y2 - y1) / (x2 - x1));
  return m;
} 

function clipper(layer) {
  var x;
  var y = 155;
  var width = 41;
  var height = 20;
  var radius = 10.5;				

  var canvas = layer.getCanvas();
  var context = canvas.getContext();		
  // make a circular clipping region
  context.beginPath();

  // draw top and top right corner
  for (i = 0; i < 4; i++) {
    if (i < 1) {
      x  = 5;
    }
    else {
      x = 5 + (50 * i);
    }
      context.moveTo(x+radius,y);
    context.arcTo(x+width,y,x+width,y+radius,radius);

    // draw right side and bottom right corner
    context.arcTo(x+width,y+height,x+width-radius,y+height,radius); 

    // draw bottom and bottom left corner
    context.arcTo(x,y+height,x,y+height-radius,radius);

    // draw left and top left corner
    context.arcTo(x,y,x+radius,y,radius);
  }

  context.closePath();
  context.clip();			
}

exports.init = init;
