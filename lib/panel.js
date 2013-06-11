var smodel = require('./soundModel.js');
var imgpreload = 
require('../node_modules/imgpreload/imgpreload.js').imgpreload;

var myAudioContext = new webkitAudioContext();
var myAudioAnalyser = myAudioContext.createAnalyser();

var minimized = false;
function addWindowBar() {
  $('#adsr-container').before('<div class="panelWinBar">' +
    '<p class="instrTitle">' +
    'Additive</p><p class="minimize">&#8632;</p></div>');
  $('.currentTray').append('<span class="minimize hidden">' +
      '&#8632;</span>');
  $('.minimize').click( function (e) {
    $('#panel').toggle('drop up');   
    if (false === (minimized = !minimized)) {
      $('.currentTray .minimize').addClass('hidden');
    } else {
      $('.currentTray .minimize').removeClass('hidden');
    }
  });
  $('#panel').draggable().draggable('disable');  
  $('.panelWinBar').mousedown( function (e) {
    $('#panel').draggable('enable');  
  });
  $('.panelWinBar').mouseup( function (e) {
    $('#panel').draggable('disable');  
  });
}

function addCurrentTray() {
  $('#selector').append('<div class="currentTray"></div>');
}

$(function() {
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
        y: 0,
        height: $('#bar').height() * 0.7,
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
            return {
              x: pos.x,
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
      });

      playActive.on('mousedown', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(playInactive);
        ctrlLayer.draw();
        smodel.stop();
      });   

      stopInactive.on('mousedown', function(event) {
        ctrlLayer.clear();
        ctrlLayer.add(stopActive);
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

      drawGainContainer(ctrlLayer);

    }); 

  //ADSR CODE
  adsrStage = new Kinetic.Stage({
    container: 'adsr-container',
            width: 200,
            height: 200,
  });

  var lineLayer = new Kinetic.Layer();
  var centerLayer = new Kinetic.Layer();
  var barLayer = new Kinetic.Layer();
  var graphLayer = new Kinetic.Layer();

  // build ATK
  var stem = new Kinetic.Line({
    strokeWidth: 3,
      stroke: 'green',
      points: [{
        x: 0,
      y: adsrStage.getHeight() / 2
      }, {
        x: adsrStage.getWidth() / 4,
      y: 0
      }],
  });

  // build DCY
  var stem2 = new Kinetic.Line({
    strokeWidth: 3,
      stroke: 'orange',
      points: [{
        x: adsrStage.getWidth() / 4,
      y: 0
      }, {
        x: adsrStage.getWidth() / 2,
      y: adsrStage.getHeight() / 2 - 50
      }],
  });

  // build STN
  var stem3 = new Kinetic.Line({
    strokeWidth: 3,
      stroke: 'lightblue',
      points: [{
        x: adsrStage.getWidth() / 2,
      y: adsrStage.getHeight() / 2 - 50
      }, {
        x: adsrStage.getWidth() * (3/4),
      y: adsrStage.getHeight() / 2 - 50
      }],
  });

  // build RLS
  var stem4 = new Kinetic.Line({
    strokeWidth: 3,
      stroke: 'pink',
      points: [{
        x: adsrStage.getWidth() * (3/4),
      y: adsrStage.getHeight() / 2 - 50
      }, {
        x: adsrStage.getWidth(),
      y: adsrStage.getHeight() / 2
      }],
  });

  // build draggable (some) connectors

  var c6 = new Kinetic.Circle({
    x: (stem.attrs.points[0].x + stem.attrs.points[1].x) / 2,
      y: (stem.attrs.points[0].y + stem.attrs.points[1].y) / 2,
      radius: 6,
      fill: 'orange',
      draggable: true,
      dragBoundFunc: function(pos) {
        var m = slope(stem.attrs.points[0].x, stem.attrs.points[1].x, stem.attrs.points[0].y, stem.attrs.points[1].y);
        var newX;
        if (pos.x > stem.attrs.points[1].x) {
          newX = stem.attrs.points[1].x;
        }
        else if (pos.x < stem.attrs.points[0].x) {
          newX = stem.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
  return {
    x: newX,
      y: (newX * m) + yIntercept(c6.getX(), c6.getY(), m)
  };
      }
  });

  var c7 = new Kinetic.Circle({
    x: (stem2.attrs.points[0].x + stem2.attrs.points[1].x) / 2,
      y: (stem2.attrs.points[0].y + stem2.attrs.points[1].y) / 2,
      radius: 6,
      fill: 'black',
      draggable: true,
      dragBoundFunc: function(pos) {
        var m = slope(stem2.attrs.points[0].x, stem2.attrs.points[1].x, stem2.attrs.points[0].y, stem2.attrs.points[1].y);
        var newX;
        if (pos.x > stem2.attrs.points[1].x) {
          newX = stem2.attrs.points[1].x;
        }
        else if (pos.x < stem2.attrs.points[0].x) {
          newX = stem2.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
  return {
    x: newX,
      y: (newX * m) + yIntercept(c7.getX(), c7.getY(), m)
  };
      }
  });

  var c8 = new Kinetic.Circle({
    x: (stem3.attrs.points[0].x + stem3.attrs.points[1].x) / 2,
      y: (stem3.attrs.points[0].y + stem3.attrs.points[1].y) / 2,
      radius: 6,
      fill: 'black',
      draggable: true,
      dragBoundFunc: function(pos) {
        var newY;
        if (pos.y < 0) {
          newY = 0;
        }
        else if (pos.y > adsrStage.getHeight() / 2) {
          newY = adsrStage.getHeight() / 2;
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

  var c9 = new Kinetic.Circle({
    x: (stem4.attrs.points[0].x + stem4.attrs.points[1].x) / 2,
      y: (stem4.attrs.points[0].y + stem4.attrs.points[1].y) / 2,
      radius: 6,
      fill: 'black',
      draggable: true,
      dragBoundFunc: function(pos) {
        var m = slope(stem4.attrs.points[0].x, stem4.attrs.points[1].x, stem4.attrs.points[0].y, stem4.attrs.points[1].y);
        var newX;
        if (pos.x > stem4.attrs.points[1].x) {
          newX = stem4.attrs.points[1].x;
        }
        else if (pos.x < stem4.attrs.points[0].x) {
          newX = stem4.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
  return {
    x: newX,
      y: (newX * m) + yIntercept(c9.getX(), c9.getY(), m)
  };
      }
  });

  var atkBar = new Kinetic.Rect({
    x: 5,
      y: (adsrStage.getHeight() / 2) + 10,
      width: adsrStage.getWidth()/4, 
      height: 25,
      fillLinearGradientStartPoint: [0, (adsrStage.getHeight() / 2) + 10],
      fillLinearGradientEndPoint: [50, (adsrStage.getHeight() / 2) + 10],
      fillLinearGradientColorStops: [0, 'red', 1, 'white'],
      stroke: 'black',
      strokeWidth: 1
  });

  var dcyBar = new Kinetic.Rect({
    x: (adsrStage.getWidth()/4) + 1,
      y: (adsrStage.getHeight() / 2) + 10,
      width: adsrStage.getWidth()/4,
      height: 25,
      fillLinearGradientStartPoint: [0, (adsrStage.getHeight() / 2) + 10],
      fillLinearGradientEndPoint: [50, (adsrStage.getHeight() / 2) + 10],
      fillLinearGradientColorStops: [0, 'red', 1, 'white'],       
      stroke: 'black',
      strokeWidth: 1
  });

  var stnBar = new Kinetic.Rect({
    x: 2*(adsrStage.getWidth()/4) + 1,
      y: (adsrStage.getHeight() / 2) + 10,
      width: adsrStage.getWidth()/4,
      height: 25,
      fillLinearGradientStartPoint: [0, (adsrStage.getHeight() / 2) + 10],
      fillLinearGradientEndPoint: [50, (adsrStage.getHeight() / 2) + 10],
      fillLinearGradientColorStops: [0, 'red', 1, 'white'],        
      stroke: 'black',
      strokeWidth: 1
  });

  var rlsBar = new Kinetic.Rect({
    x: 3*(adsrStage.getWidth()/4) + 1,
      y: (adsrStage.getHeight() / 2) + 10,
      width: adsrStage.getWidth()/4,
      height: 25,
      fillLinearGradientStartPoint: [0, (adsrStage.getHeight() / 2) + 10],
      fillLinearGradientEndPoint: [50, (adsrStage.getHeight() / 2) + 10],
      fillLinearGradientColorStops: [0, 'red', 1, 'white'],        
      stroke: 'black',
      strokeWidth: 1
  });

  barLayer.add(atkBar);
  barLayer.add(dcyBar);
  barLayer.add(stnBar);
  barLayer.add(rlsBar);

  centerLayer.add(c6);
  centerLayer.add(c7);
  centerLayer.add(c8);
  centerLayer.add(c9);

  adsrStage.add(graphLayer);
  adsrStage.add(lineLayer);
  adsrStage.add(barLayer);
  adsrStage.add(centerLayer);


  c6.on('dragstart', (function () {
    c6.getLayer().on('draw', function () { 
      drawCurves(lineLayer, stem, stem2, stem3, stem4, c6, c7, c8, c9);
      smodel.attack( ( 100 - c6.getY() ) / 100);
    });
  }));

  c7.on('dragstart', (function () {
    c7.getLayer().on('draw', function () {
      drawCurves(lineLayer, stem, stem2, stem3, stem4, c6, c7, c8, c9);
      smodel.decay( ( 100 - c7.getY() ) / 100);
    });
  }));

  c8.on('dragstart', (function () {
    c8.getLayer().on('draw', function () {
      smodel.sustain( ( 100 - c8.getY() ) / 100);
      stem3.attrs.points[0].y = c8.getY();
      stem3.attrs.points[1].y = c8.getY();
      stem2.attrs.points[1].y = c8.getY();
      stem4.attrs.points[0].y = c8.getY();

      var dcySlope = slope(stem2.attrs.points[0].x, stem2.attrs.points[1].x, stem2.attrs.points[0].y, stem2.attrs.points[1].y);
      c7.setY((dcySlope * c7.getX()) + yIntercept(stem2.attrs.points[1].x, stem.attrs.points[1].y, dcySlope));
      c7.dragBoundFunc = function(pos) {
        var newX;
        if (pos.x > stem2.attrs.points[1].x) {
          newX = stem2.attrs.points[1].x;
        }
        else if (pos.x < stem2.attrs.points[0].x) {
          newX = stem2.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
    return {
      x: newX,
        y: (newX * dcySlope) + yIntercept(c7.getX(), c7.getY(), dcySlope)
    };
      };

      var rlsSlope = slope(stem4.attrs.points[0].x, stem4.attrs.points[1].x, stem4.attrs.points[0].y, stem4.attrs.points[1].y);
      c9.setY((rlsSlope * c9.getX()) + yIntercept(stem4.attrs.points[1].x, stem3.attrs.points[1].y, rlsSlope));
      c9.dragBoundFunc = function(pos) {
        var newX;
        if (pos.x > stem4.attrs.points[1].x) {
          newX = stem4.attrs.points[1].x;
        }
        else if (pos.x < stem4.attrs.points[0].x) {
          newX = stem4.attrs.points[0].x;
        }
        else {
          newX = pos.x;
        }
        return {
          x: newX,
            y: (newX * rlsSlope) + yIntercept(c9.getX(), c9.getY(), rlsSlope)
        };
      };
      drawCurves(lineLayer, stem, stem2, stem3, stem4, c6, c7, c8, c9);
    });
  }));

  c9.on('dragstart', (function () {
    c9.getLayer().on('draw', function () {
      drawCurves(lineLayer, stem, stem2, stem3, stem4, c6, c7, c8, c9);
      smodel.release( ( 100 - c9.getY() ) / 100);
    });
  }));

  //end ADSR 

  drawCurves(lineLayer, stem, stem2, stem3, stem4, c6, c7, c8, c9);
  centerLayer.draw();
  barLayer.draw();
  drawBackground(graphLayer, 11, 11, 10, "#ccc");  

  $('#adsr-container').append('<!-- Squared ONE --><div class="squaredOne">' + 
      '<input type="checkbox" value="None" id="squaredOne" name="check">' + 
      '</input><label for="squaredOne"></label></div>');
  
  $('#squaredOne').change(function() {
    invert(centerLayer, stem, stem2, stem3, stem4, c6, c7, c9);
    drawCurves(lineLayer, stem, stem2, stem3, stem4, c6, c7, c8, c9);
  });

});//end doc ready

function drawGainContainer(kineticLayer) {
  var ctx = kineticLayer.getCanvas().getContext();
  var bar_width = 10;
  var width = 150;
  var height = $('#bar').height() * 0.9;

  for (var i = 0; i < 2; i++) {
    for (var j= 0; j < width / 10; j++) {
      ctx.strokeStyle = 'black';
      ctx.strokeRect(100 + (j* 10), (bar_width * i) + 2.5, bar_width, bar_width); //x,y,xwidth,yheight
      //console.log("the " + j + " value: " + (200 - (j*10)) + ", " + (bar_width*i) + ", " + (height/10) + ", " + (bar_width));
    }
  }
}

function drawSpectrum(kineticLayer) {
  var ctx = kineticLayer.getCanvas().getContext();
  var width = kineticLayer.getCanvas().width;
  var height = kineticLayer.getCanvas().height;
  var bar_width = 10;

  ctx.clearRect(0, 0, width, height);
  var freqByteData = new Uint8Array(myAudioAnalyser.frequencyBinCount);
  myAudioAnalyser.getByteFrequencyData(freqByteData);
  var barCount = Math.round(width / bar_width);
  var averageVolume = getAverageVolume(freqByteData, barCount);
  var grd = ctx.createLinearGradient(0, 2.5, height, 0);

  //lime
  grd.addColorStop(0, '#00ff00');
  //yellow
  grd.addColorStop(0.25, '#ffff00');
  //orange
  grd.addColorStop(0.75, '#ffa500');
  //red
  grd.addColorStop(1, '#ff0000');

  for (var i = 0; i < 2; i++) {
    ctx.fillStyle = grd;
    ctx.fillRect(0, (bar_width * 2) + 2.5, averageVolume - 60, bar_width - 2);
  }
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
function drawCurves(lineLayer, stem, stem2, stem3, stem4, c6, c7, c8, c9) {
  var canvas = lineLayer.getCanvas();
  var context = canvas.getContext();

  canvas.clear();

  // draw quad
  context.beginPath();
  context.moveTo(stem.attrs.points[0].x, stem.attrs.points[0].y);
  context.quadraticCurveTo(c6.getX(), c6.getY(), stem.attrs.points[1].x, stem.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(stem2.attrs.points[0].x, stem2.attrs.points[0].y);
  context.quadraticCurveTo(c7.getX(), c7.getY(), stem2.attrs.points[1].x, stem2.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(stem3.attrs.points[0].x, stem3.attrs.points[0].y);
  context.lineTo(stem3.attrs.points[1].x, stem3.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(stem4.attrs.points[0].x, stem4.attrs.points[0].y);
  context.quadraticCurveTo(c9.getX(), c9.getY(), stem4.attrs.points[1].x, stem4.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();
}  

function drawBackground(graphLayer, xcount, ycount, width, color) {
  var canvas = graphLayer.getCanvas();
  var context = canvas.getContext();

  canvas.width = 200;//xcount * width + 1;
  canvas.height = 200;//ycount * width + 1;

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

function invert(centerLayer, stem, stem2, stem3, stem4, c6, c7, c9) {
  //storecoordinate
  var oldY = stem.attrs.points[0].y;

  //set the stems coordinates to match
  stem.attrs.points[0].y = stem.attrs.points[1].y;
  stem.attrs.points[1].y = oldY;

  stem2.attrs.points[0].y = oldY;

  stem4.attrs.points[1].y = stem.attrs.points[0].y;

  var atkSlope = slope(stem.attrs.points[0].x, stem.attrs.points[1].x, stem.attrs.points[0].y, stem.attrs.points[1].y);
  c6.setY((atkSlope * c6.getX()) + yIntercept(stem.attrs.points[1].x, stem.attrs.points[0].y, atkSlope));
  c6.dragBoundFunc = function(pos) {
    var newX;
    if (pos.x > stem.attrs.points[1].x) {
      newX = stem.attrs.points[1].x;
    }
    else if (pos.x < stem.attrs.points[0].x) {
      newX = stem.attrs.points[0].x;
    }
    else {
      newX = pos.x;
    }
    return {
      x: newX,
        y: (newX * atkSlope) + yIntercept(c6.getX(), c6.getY(), atkSlope)
    };
  };

  var dcySlope = slope(stem2.attrs.points[0].x, stem2.attrs.points[1].x, stem2.attrs.points[0].y, stem2.attrs.points[1].y);
  c7.setY((dcySlope * c7.getX()) + yIntercept(stem2.attrs.points[1].x, stem.attrs.points[1].y, dcySlope));
  c7.dragBoundFunc = function(pos) {
    var newX;
    if (pos.x > stem2.attrs.points[1].x) {
      newX = stem2.attrs.points[1].x;
    }
    else if (pos.x < stem2.attrs.points[0].x) {
      newX = stem2.attrs.points[0].x;
    }
    else {
      newX = pos.x;
    }
    return {
      x: newX,
        y: (newX * dcySlope) + yIntercept(c7.getX(), c7.getY(), dcySlope)
    };
  };

  var rlsSlope = slope(stem4.attrs.points[0].x, stem4.attrs.points[1].x, stem4.attrs.points[0].y, stem4.attrs.points[1].y);
  c9.setY((rlsSlope * c9.getX()) + yIntercept(stem4.attrs.points[1].x, stem3.attrs.points[1].y, rlsSlope));
  c9.dragBoundFunc = function(pos) {
    var newX;
    if (pos.x > stem4.attrs.points[1].x) {
      newX = stem4.attrs.points[1].x;
    }
    else if (pos.x < stem4.attrs.points[0].x) {
      newX = stem4.attrs.points[0].x;
    }
    else {
      newX = pos.x;
    }
    return {
      x: newX,
        y: (newX * rlsSlope) + yIntercept(c9.getX(), c9.getY(), rlsSlope)
    };
  };       

  //drawCurves();
  centerLayer.draw();
}

function yIntercept(x, y, m) {
  var yInt = y - (m * x);
  return yInt;
}

function slope(x1, x2, y1, y2) {
  var m = -1 * ((y2 - y1)/(x2 - x1));
  return m;
} 

