var smodel = require('./soundModel.js');
var imgpreload = 
require('../node_modules/imgpreload/imgpreload.js').imgpreload;
//var metronome = require('./metronome.js');

var mySpectrum;

var minimized = false;
var mouseStillDown;

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
  smodel.audioAnalyser.smoothingTimeconstant = 0.85;
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
    "img/tempoToggleOnDown.svg", "img/gainDial.png", "img/base.svg", "img/dial.svg", "img/zero.svg"], function(images) {
      var yPos;
      var playInactive = new Kinetic.Image({
        x: 0,
        y: 0,
        height: $('#bar').height() * 0.7,
        image: images[0],
        stroke: 'black',
        shadowColor: 'black',
        shadowBlur: 2,
        shadowOffset: 1,
        shadowOpacity: 0.8
      });
      playInactive.setWidth(playInactive.getHeight());

      var stopInactive = playInactive.clone({x: playInactive.getWidth() + 5, image: images[2]});

      var recordInactive = playInactive.clone({x: stopInactive.getX() * 2, image: images[4]});

      var tempo = new Kinetic.Image({
        x: stage.getWidth() - 175,
        y: 0,
        height: $('#bar').height() * 0.7,
        image: images[6],
        stroke: 'black',
        shadowColor: 'black',
        shadowBlur: 2,
        shadowOffset: 1,
        shadowOpacity: 0.7
        
      });

      var tempoUp = new Kinetic.Image({
        x: tempo.getX() + tempo.getWidth() + 10,
        y: 0,
        height: $('#bar').height() * 0.34,
        width: $('#bar').height() * 0.6,
        image: images[7],
        stroke: 'black',
        strokeWidth: 0.5,
        shadowColor: 'black',
        shadowBlur: 2,
        shadowOffset: 1,
        shadowOpacity: 0.8
      });

      var tempoDown = tempoUp.clone({y: tempoUp.getHeight() + 2, image: images[8]});

      var gainDial = new Kinetic.Image({
        x: 239,
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

      var hiBase = new Kinetic.Image({
        x: 300,
        y:0,
        image: images[12],
        height: $('#bar').height() * 0.7,
        width: $('#bar').height() * 0.7
        /*shadowColor: 'blue',
        shadowBlur: 2,
        shadowOffset: 1,
        shadowOpacity: 0.7*/
      });

      var hiZero = hiBase.clone({image: images[14], shadowEnabled: false});

      var hiDial  = hiBase.clone({x: 300 + hiBase.getWidth() / 2, y: hiBase.getWidth() / 2, image: images[13], rotationDeg: 0, offset: [hiBase.getWidth() / 2, hiBase.getWidth() / 2], shadowEnabled: false});

      var midBase = hiBase.clone({x: hiBase.getX() + hiBase.getWidth() + 20});
      var midZero = hiZero.clone({x: hiZero.getX() + hiZero.getWidth() + 20});
      var midDial = hiDial.clone({x: hiDial.getX() + hiDial.getWidth() + 20});

      var loBase = midBase.clone({x: midBase.getX() + midBase.getWidth() + 20});
      var loZero = midZero.clone({x: midZero.getX() + midZero.getWidth() + 20});
      var loDial = midDial.clone({x: midDial.getX() + midDial.getWidth() + 20});

      var bpm = new Kinetic.Text({
        x: tempo.getX() + (tempo.getWidth() / 2),
          y: tempo.getY() + 4,
          text: '120',
          fontSize: 22,
          fontFamily: 'Keania One',
          fill: '#FFB3C7',
          shadowColor: 'white',
          shadowBlur: 2,
          shadowOffset: 1,
          shadowOpacity: 0.8
      });

      bpm.setOffset({
        x: bpm.getWidth() / 2
      });


      var playActive = playInactive.clone({image: images[1], visible: false});
      var stopActive = stopInactive.clone({image: images[3], visible: false});
      var recordActive = recordInactive.clone({image: images[5], visible: false});
      var tempoUpActive = tempoUp.clone({image: images[9], visible: false});
      var tempoDownActive = tempoDown.clone({image: images[10], visible: false});

      ctrlLayer.add(playInactive);
      ctrlLayer.add(playActive);
      ctrlLayer.add(stopInactive);
      ctrlLayer.add(stopActive);
      ctrlLayer.add(recordInactive);
      ctrlLayer.add(recordActive);
      ctrlLayer.add(tempo);
      ctrlLayer.add(tempoUp);
      ctrlLayer.add(tempoUpActive);
      ctrlLayer.add(tempoDown);
      ctrlLayer.add(tempoDownActive);
      ctrlLayer.add(gainDial);
      ctrlLayer.add(bpm);
      ctrlLayer.add(hiBase);
      ctrlLayer.add(hiDial);
      ctrlLayer.add(hiZero);
      ctrlLayer.add(midBase);
      ctrlLayer.add(midDial);
      ctrlLayer.add(midZero);
      ctrlLayer.add(loBase);
      ctrlLayer.add(loDial);
      ctrlLayer.add(loZero);
      ctrlLayer.draw();

      stage.add(vuLayer);
      stage.add(gainLayer);
      stage.add(ctrlLayer);

      playInactive.createImageHitRegion(function() {
        playInactive.getLayer().drawHit();
      });

      playInactive.on('mousedown', function(event) {
        playInactive.setVisible(false);
        playActive.setVisible(true);
        smodel.start();
        mySpectrum = setInterval( function() {drawSpectrum(vuLayer); }, 30);
        ctrlLayer.draw();
      });

      playActive.on('mousedown', function(event) {
        playActive.setVisible(false);
        playInactive.setVisible(true);
        smodel.stop();
        clearInterval(mySpectrum);
        ctrlLayer.draw();
        clearSpectrum(vuLayer);
      });   

      stopInactive.on('mousedown', function(event) {
        stopInactive.setVisible(false);
        stopActive.setVisible(true);
        smodel.stop();
        ctrlLayer.draw();
        clearSpectrum(vuLayer);
      });

      stopActive.on('mouseup', function(event) {
        stopActive.setVisible(false);
        stopInactive.setVisible(true);
        playActive.setVisible(false);
        playInactive.setVisible(true);
        ctrlLayer.draw();
      });

      recordInactive.on('mousedown', function(event) {
        recordInactive.setVisible(false);
        recordActive.setVisible(true);
        ctrlLayer.draw();
      });

      recordActive.on('mousedown', function(event) {
        recordActive.setVisible(false);
        recordInactive.setVisible(true);
        ctrlLayer.draw();
      });  

      tempoUp.on('mousedown', function(event) {
        tempoUp.setVisible(false);
        tempoUpActive.setVisible(true);
        mouseStillDown = setInterval(function() {
          updateTempo(1);}, 100);
      });

      tempoUpActive.on('mousedown', function(event) {
        mouseStillDown = setInterval(function() {
          updateTempo(1);}, 100);
      });

      tempoUpActive.on('mouseup mouseout', function(event) {
        tempoUpActive.setVisible(false);
        tempoUp.setVisible(true);
        ctrlLayer.draw();
        clearInterval(mouseStillDown);
      });

      tempoDown.on('mousedown', function(event) {
        tempoDown.setVisible(false);
        tempoDownActive.setVisible(true);
        mouseStillDown = setInterval(function() {
          updateTempo(-1);}, 100);
      });

      tempoDownActive.on('mouseup mouseout', function(event) {
        tempoDownActive.setVisible(false);
        tempoDown.setVisible(true);
        ctrlLayer.draw();
        clearInterval(mouseStillDown);
      });

      gainDial.on('dragstart', (function () {
        gainDial.getLayer().on('draw', function () {
          smodel.gainNode.gain.value = convertScale(gainDial.getX(), 99, 239, 0, 1);
        });
      }));
      
      hiZero.on('mousedown', function(event) {
        yPos = event.pageY;
        mouseStillDown = true;
      });

      hiZero.on('mousemove', function(event) {
        if (mouseStillDown) {
          if (yPos > event.pageY && Math.round(hiDial.getRotationDeg()) > -120) {
            hiDial.rotateDeg(-10);
          }
          else if (yPos < event.pageY && Math.round(hiDial.getRotationDeg()) < 120) {
            hiDial.rotateDeg(10);
          }
          ctrlLayer.draw();
          smodel.hiShelf.gain.value = convertScale(Math.round(hiDial.getRotationDeg()), -120, 120, -10, 10);
          yPos = event.pageY;
        }
      });

      hiZero.on('mouseup mouseout', function(event) {
        mouseStillDown = false;
      });

      midZero.on('mousedown', function(event) {
        yPos = event.pageY;
        mouseStillDown = true;
      });

      midZero.on('mousemove', function(event) {
        if (mouseStillDown) {
          if (yPos > event.pageY && Math.round(midDial.getRotationDeg()) > -120) {
            midDial.rotateDeg(-10);
          }
          else if (yPos < event.pageY && Math.round(midDial.getRotationDeg()) < 120) {
            midDial.rotateDeg(10);
          }
          ctrlLayer.draw();
          smodel.midShelf.gain.value = convertScale(Math.round(midDial.getRotationDeg()), -120, 120, -10, 10);
          yPos = event.pageY;
        }
      });

      midZero.on('mouseup mouseout', function(event) {
        mouseStillDown = false;
      });

      loZero.on('mousedown', function(event) {
        yPos = event.pageY;
        mouseStillDown = true;
      });

      loZero.on('mousemove', function(event) {
        if (mouseStillDown) {
          if (yPos > event.pageY && Math.round(loDial.getRotationDeg()) > -120) {
            loDial.rotateDeg(-10);
          }
          else if (yPos < event.pageY && Math.round(loDial.getRotationDeg()) < 120) {
            loDial.rotateDeg(10);
          }
          ctrlLayer.draw();
          smodel.loShelf.gain.value = convertScale(Math.round(loDial.getRotationDeg()), -120, 120, -10, 10);
          yPos = event.pageY;
        }
      });

      loZero.on('mouseup mouseout', function(event) {
        mouseStillDown = false;
      });

      drawGainContainer(gainLayer);

      function updateTempo(amount) {
        bpm.setText(parseInt(bpm.getText(), 10) + amount);
        smodel.setTimePerBeat(parseInt(bpm.getText(), 10));
        bpm.getLayer().draw();
      }
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
        y: adsrStage.getHeight() * (8 / 9) - 10
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
        y: adsrStage.getHeight()  * (8 / 9) - 10
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

  var atkDragger2 = new Kinetic.Circle({
    x: (atkLine.attrs.points[0].x + atkLine.attrs.points[1].x) / 2,
      y: (atkLine.attrs.points[0].y + atkLine.attrs.points[1].y) / 2,
      radius: 6,
      fill: 'blue'
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
        else if (pos.y > adsrStage.getHeight() * (8 / 9) - 10) {
          newY = adsrStage.getHeight() * (8 / 9) - 10;
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

  // dashed line
  var atkLimit = new Kinetic.Line({
    points: [{
      x: atkLine.attrs.points[1].x,
      y: 0
    }, {
      x: atkLine.attrs.points[1].x,
      y: adsrStage.getHeight() * (8 / 9) - 10
    }],
      stroke: 'black',
      strokeWidth: 2,
      lineJoin: 'round'
    //dashArray: [8, 3],
  });

  var dcyLimit = atkLimit.clone({points: [{x: dcyLine.attrs.points[1].x, y: 0}, {x: dcyLine.attrs.points[1].x, y: adsrStage.getHeight() * (8 / 9) - 10}]});
  var stnLimit = atkLimit.clone({points: [{x: stnLine.attrs.points[1].x, y: 0}, {x: stnLine.attrs.points[1].x, y: adsrStage.getHeight() * (8 / 9) - 10}]});

  var atkCell = new Kinetic.Rect({
    x: 5,
    y: adsrStage.getHeight() - 25,
    width: 40,
    height: 20,
    stroke: 'black'
  });

  var dcyCell = atkCell.clone({x: 55});
  var stnCell = dcyCell.clone({x: 105});

  var imgObj = new Image();
  imgObj.onload = function() {
    var off = true;
    var invertButton = new Kinetic.Image({
      x: adsrStage.getWidth() - 25,
        y: stnCell.getY() - 1,
        image: imgObj
    });
    invertButton.setId('invertButton');
    cellLayer.add(invertButton);
    adsrStage.add(cellLayer);

    invertButton.on('mouseover', function() {
      if (off) {
        invertFill.setFillLinearGradientColorStops([0, '#7A0000', 1, '#640000']);
        invertFill.getLayer().draw();
      }
    });

    invertButton.on('mouseout', function() { 
      if (off) {
        invertFill.setFillLinearGradientColorStops([0, 'gray', 1, 'black']);
        invertFill.getLayer().draw();
      }
    });

    invertButton.on('click', function() {
      if (off) {
        invertFill.setFillLinearGradientColorStops([0, 'red', 1, 'red']);
        invert(centerLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, rlsDragger);
        drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);

        off = false;
      }
      else {
        invertFill.setFillLinearGradientColorStops([0, 'gray', 1, 'black']);
        invert(centerLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, rlsDragger);
        drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
        off = true;
      }
    invertFill.getLayer().draw();
    });
  };
  imgObj.src = "img/warning.svg";

  var invertFill = new Kinetic.Rect({
    x: adsrStage.getWidth() - 25,
      y: stnCell.getY() - 1,
      width: 20,
      height: 20,
      fillLinearGradientStartPoint: [35, 0],
      fillLinearGradientEndPoint: [35, 15],
      fillLinearGradientColorStops: [0, 'gray', 1, 'black']
  });

  var atkFill = new Kinetic.Rect({
    x: 5,
    y: adsrStage.getHeight() - 25,
    width: 40,
    height: 20,
    fillLinearGradientStartPoint: [35, 0],
    fillLinearGradientEndPoint: [35, 15],
    fillLinearGradientColorStops: [0, '#39e639', 1, '#00cc00']
  });

  var dcyFill = atkFill.clone({x: 55});
  var stnFill = dcyFill.clone({x: 105});

  atkFill.setId('atkFill');
  dcyFill.setId('dcyFill');
  stnFill.setId('stnFill');

  atkCell.on('mousedown', function() {
    isDown = true;
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
      atkMovement();
    }					
  });

  atkCell.on('click', function() {
    atkMovement();
  });

  atkCell.on('mouseup', function() {
    isDown = false;
  });

  function atkMovement() {
    var mouseXY = adsrStage.getMousePosition();
    var canvasX = mouseXY.x;
    var atkFill = fillLayer.get('#atkFill')[0];
    var canvas = atkCell.getLayer().getCanvas();
    var context = canvas.getContext();

    if (canvasX-atkFill.getX() <= 0) {
      atkFill.setWidth(0);
    }
    else if(canvasX-atkFill.getX() >= 39.75) {
      atkFill.setWidth(40);
    }
    else {
      atkFill.setWidth(canvasX-atkFill.getX());
    }

    atkLimit.attrs.points[0].x = 50 * (atkFill.getWidth() / 40).toFixed(2);
    atkLimit.attrs.points[1].x = 50 * (atkFill.getWidth() / 40).toFixed(2);
    atkLine.attrs.points[1].x = atkLimit.attrs.points[1].x;
    dcyLine.attrs.points[0].x = atkLimit.attrs.points[1].x;

    var atkSlope = slope(atkLine.attrs.points[0].x, atkLine.attrs.points[1].x, atkLine.attrs.points[0].y, atkLine.attrs.points[1].y);
    var atkYInt = yIntercept(atkLine.attrs.points[1].x, atkLine.attrs.points[0].y, atkSlope);
    var atkX = xValue(atkDragger.getY(), atkSlope, atkYInt);
    if (!isNaN(atkX)) {
      atkDragger.setX(atkX);
    }

    var dcySlope = slope(dcyLine.attrs.points[0].x, dcyLine.attrs.points[1].x, dcyLine.attrs.points[0].y, dcyLine.attrs.points[1].y);
    var dcyYInt = yIntercept(dcyLine.attrs.points[0].x, stnDragger.getY(), dcySlope);
    var dcyX = xValue(dcyDragger.getY(), dcySlope, dcyYInt);
    dcyDragger.setX(dcyX);

    fillLayer.draw();
    centerLayer.draw();
    drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
  }

  dcyCell.on('mousedown', function() {
    isDown = true;
  });

  dcyCell.on('click', function() {
    dcyMovement();
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
      dcyMovement();}					
  });

  dcyCell.on('mouseup', function() {
    isDown = false;
  });				

  function dcyMovement() {
    var mouseXY = adsrStage.getMousePosition();
    var canvasX = mouseXY.x;
    var dcyFill = fillLayer.get('#dcyFill')[0];
    var canvas = dcyCell.getLayer().getCanvas();
    var context = canvas.getContext();

    if (canvasX-dcyFill.getX() <= 0) {
      dcyFill.setWidth(0);
    }
    else if(canvasX-dcyFill.getX() >= 39.75) {
      dcyFill.setWidth(40);
    }
    else {
      dcyFill.setWidth(canvasX-dcyFill.getX());
    }

    var convertedValue = convertScale(100 * (dcyFill.getWidth() / 40).toFixed(2), 0, 100, 50, 100);

    dcyLimit.attrs.points[0].x = convertedValue;
    dcyLimit.attrs.points[1].x = convertedValue;
    dcyLine.attrs.points[1].x = dcyLimit.attrs.points[1].x;
    stnLine.attrs.points[0].x = dcyLimit.attrs.points[1].x;

    var dcySlope = slope(dcyLine.attrs.points[0].x, dcyLine.attrs.points[1].x, dcyLine.attrs.points[0].y, dcyLine.attrs.points[1].y);
    var dcyYInt = yIntercept(dcyLine.attrs.points[0].x, stnDragger.getY(), dcySlope);
    var dcyX = xValue(dcyDragger.getY(), dcySlope, dcyYInt);
    if (!isNaN(dcyX)) {
      dcyDragger.setX(dcyX);
    }

    stnDragger.setX((stnLine.attrs.points[0].x + stnLine.attrs.points[1].x) / 2);

    fillLayer.draw();
    centerLayer.draw();
    drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
  }

  stnCell.on('mousedown', function() {
    isDown = true;
  });

  stnCell.on('mouseover', function() {
    this.setShadowEnabled(true);
    this.setShadowColor('#70ed3b');
    this.setShadowBlur(5);
    this.setShadowOffset(0);
    this.setShadowOpacity(1);
    this.getLayer().draw();
  });

  stnCell.on('click', function() {
    stnMovement();
  });

  stnCell.on('mouseout', function() {
    isDown = false;
    this.setShadowEnabled(false);
    this.getLayer().draw();
  });				

  stnCell.on('mousemove', function() {
    if (isDown) {
      stnMovement();
    }
  });

  stnCell.on('mouseup', function() {
    isDown = false;
  });	

  function stnMovement() {
    var mouseXY = adsrStage.getMousePosition();
    var canvasX = mouseXY.x;

    var stnFill = fillLayer.get('#stnFill')[0];
    var canvas = stnCell.getLayer().getCanvas();
    var context = canvas.getContext();

    if (canvasX-stnFill.getX() <= 0) {
      stnFill.setWidth(0);
    }
    else if(canvasX-stnFill.getX() >= 39.75) {
      stnFill.setWidth(40);
    }
    else {
      stnFill.setWidth(canvasX-stnFill.getX());
    }

    var convertedValue = convertScale(150 * (stnFill.getWidth() / 40).toFixed(2), 0, 150, 100, 150);

    stnLimit.attrs.points[0].x = convertedValue;
    stnLimit.attrs.points[1].x = convertedValue;
    stnLine.attrs.points[1].x = stnLimit.attrs.points[1].x;
    rlsLine.attrs.points[0].x = stnLimit.attrs.points[1].x;

    var stnX = ((stnLine.attrs.points[0].x + stnLine.attrs.points[1].x) / 2);
    stnDragger.setX(stnX);

    var rlsSlope = slope(rlsLine.attrs.points[0].x, rlsLine.attrs.points[1].x, rlsLine.attrs.points[0].y, rlsLine.attrs.points[1].y);
    var rlsYInt = yIntercept(rlsLine.attrs.points[0].x, rlsLine.attrs.points[1].y, rlsSlope);
    var rlsX = xValue(rlsDragger.getY(), rlsSlope, rlsYInt);
    rlsDragger.setX(rlsX);

    fillLayer.draw();
    centerLayer.draw();
    drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
  }

  cellLayer.add(invertFill);
  cellLayer.add(atkCell);
  cellLayer.add(dcyCell);
  cellLayer.add(stnCell);
  fillLayer.add(atkFill);
  fillLayer.add(dcyFill);
  fillLayer.add(stnFill);

  centerLayer.add(atkDragger2);
  centerLayer.add(atkDragger);
  centerLayer.add(dcyDragger);
  centerLayer.add(stnDragger);
  centerLayer.add(rlsDragger);
  centerLayer.add(atkLimit);
  centerLayer.add(dcyLimit);
  centerLayer.add(stnLimit);

  adsrStage.add(graphLayer);
  adsrStage.add(lineLayer);
  adsrStage.add(centerLayer);
  adsrStage.add(fillLayer);
  invertFill.setZIndex(10);

  atkDragger.on('dragstart', (function (event) {
    atkDragger.getLayer().on('draw', function () {
      var one = new quadraticEquation(Math.pow(atkLine.attrs.points[0].x, 2), atkLine.attrs.points[0].x, atkLine.attrs.points[0].y);
      var two = new quadraticEquation(Math.pow(atkLine.attrs.points[1].x, 2), atkLine.attrs.points[1].x, atkLine.attrs.points[1].y);

      var mid1X = midpoint(atkLine.attrs.points[0].x, atkDragger.getX());
      var mid1Y = midpoint(atkLine.attrs.points[0].y, atkDragger.getY());
      var mid2X = midpoint(atkLine.attrs.points[1].x, atkDragger.getX());
      var mid2Y = midpoint(atkLine.attrs.points[1].y, atkDragger.getY());
      var mid3X = midpoint(mid1X, mid2X);
      var mid3Y = midpoint(mid1Y, mid2Y);
      atkDragger2.setX(mid3X);
      atkDragger2.setY(mid3Y);
      //console.log("height " + atkLine.attrs.points[0].y);

      //console.log("mid 3 x" + mid3X);
      //console.log("mid 3 y" + mid3Y);
      //console.log("attacks y " + atkDragger.getY());

      //var three = new quadraticEquation(Math.pow(mid3X, 2), mid3X, mid3Y);
      //atkDragger2.setY(solveEquations(one, two, three, atkDragger2.getX()));
      //console.log("the y " + atkDragger2.getY());
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

  drawCurves(lineLayer, atkLine, dcyLine, stnLine, rlsLine, atkDragger, dcyDragger, stnDragger, rlsDragger);
  centerLayer.draw();
  drawBackground(graphLayer, 11, 11, 10, "#ccc", adsrStage.getHeight() * (8 / 9) - 10);

  $('#adsr-container').before('<h1 class="instrument">Additive &#43;</h1>');
}

function drawGainContainer(gainLayer) {
  var ctx = gainLayer.getCanvas().getContext();
  var bar_width = 10;
  var width = 150;
  var height = $('#bar').height() * 0.9;

  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < width / 10; j++) {
      ctx.strokeStyle = 'black';
      ctx.strokeRect(100 + (j * 10), (bar_width * i) + 2.5, bar_width, bar_width);
    }
  }
}

function drawSpectrum(vuLayer) {
  var ctx = vuLayer.getCanvas().getContext();
  var width = 150;//vuLayer.getCanvas().width;
  var height = $('#bar').height * 0.9;//vuLayer.getCanvas().height;
  var bar_width = 10;

  ctx.clearRect(0, 0, 500, 500);
  var freqByteData = new Uint8Array(smodel.audioAnalyser.frequencyBinCount);
  smodel.audioAnalyser.getByteFrequencyData(freqByteData);
  var barCount = Math.round(width / bar_width);
  var averageVolume = getAverageVolume(freqByteData, barCount);
  var correctedVolume;
  if (averageVolume - 95 < 0) {
    correctedVolume = 0;
  }
  else {
    correctedVolume = averageVolume - 95;
  }
  var grd = ctx.createLinearGradient(100, 2.5, 250, 2.5);

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
    ctx.fillRect(100, (bar_width * i) + 2.5, correctedVolume, bar_width);
  }
}

function clearSpectrum(vuLayer) {
  var ctx = vuLayer.getCanvas().getContext();
  ctx.clearRect(0, 0, 500, 500);
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

function drawBackground(graphLayer, xcount, ycount, width, color, canvasHeight) {
  var canvas = graphLayer.getCanvas();
  var context = canvas.getContext();

  canvas.width = 200;//xcount * width + 1;
  canvas.height = canvasHeight;//ycount * width + 1;

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

function xValue(y, m, b) {
  var x = (y - b) / m;
  return x;
}

function slope(x1, x2, y1, y2) {
  var m = -1 * ((y2 - y1) / (x2 - x1));
  return m;
} 

function convertScale(oldValue, oldMin, oldMax, newMin, newMax) {
  var oldRange = oldMax - oldMin;
  var newRange = newMax - newMin;
  var newValue = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
  return newValue;
}

function midpoint(point1, point2) {
  return ((point1 + point2) / 2);
}

function quadraticEquation(xSqrd, x, y) {
  this.xSqrd =  xSqrd;
  this.x = x;
  this.y = y;
}

function solveEquations(equation1, equation2, equation3, x) {
  var a, b, c;
  //y = ax^2 + bx + c
  //eliminate c with points 1 & 2 and 2 & 3
  equation1.xSqrd *= -1;
  equation1.x *= -1;
  equation1.y *= -1;
  var eqOneTwo = new quadraticEquation(equation1.xSqrd + equation2.xSqrd, equation1.x + equation2.x, equation1.y + equation2.y);
  console.log("oneTwo " + eqOneTwo.y + " " + eqOneTwo.xSqrd + " " + eqOneTwo.x + " ");
  var eqOneTwoCopy = new quadraticEquation(equation1.xSqrd + equation2.xSqrd, equation1.x + equation2.x, equation1.y + equation2.y);

  equation2.xSqrd *= -1;
  equation2.x *= -1;
  equation2.y *= -1;	
  var eqTwoThree = new quadraticEquation(equation2.xSqrd + equation3.xSqrd, equation2.x + equation3.x, equation2.y + equation3.y);
  console.log("TwoThree " + eqTwoThree.y + " " + eqTwoThree.xSqrd + " " + eqTwoThree.x + " ");

  //eliminate b with previous two equations
  var eqOneTwoX = eqOneTwo.x;

  if (eqOneTwoX < 0) {
    eqOneTwo.xSqrd *= eqTwoThree.x;
    eqOneTwo.x *= eqTwoThree.x;
    eqOneTwo.y *= eqTwoThree.x;
  }	
  else {
    eqOneTwo.xSqrd *= -eqTwoThree.x;
    eqOneTwo.x *= -eqTwoThree.x;
    eqOneTwo.y *= -eqTwoThree.x;		
  }

  eqTwoThree.xSqrd *= eqOneTwoX;
  eqTwoThree.x *= eqOneTwoX;
  eqTwoThree.y *= eqOneTwoX;

  console.log("a = " + (eqOneTwo.y + eqTwoThree.y) / (eqOneTwo.xSqrd + eqTwoThree.xSqrd));
  a = (eqOneTwo.y + eqTwoThree.y) / (eqOneTwo.xSqrd + eqTwoThree.xSqrd);
  eqOneTwoCopy.xSqrd *= a;
  if (eqOneTwoCopy.xSqrd < 0) {
    eqOneTwoCopy.y += Math.abs(eqOneTwoCopy.xSqrd);
  }
  else {
    eqOneTwoCopy.y -= Math.abs(eqOneTwoCopy.xSqrd);
  }

  console.log("b = " + (eqOneTwoCopy.y / eqOneTwoCopy.x));
  b = eqOneTwoCopy.y / eqOneTwoCopy.x;

  equation3.xSqrd *= a;
  equation3.x *= b;
  console.log("y " + equation3.y);
  console.log("y " + equation3.xSqrd + equation3.x);
  if (equation3.xSqrd + equation3.x < 0) {
    equation3.y += Math.abs((equation3.xSqrd + equation3.x));
  }
  else {
    equation3.y -= Math.abs(equation3.xSqrd + equation3.x);
  }
  console.log("c = " + (equation3.y));
  c = equation3.y;

  return ((Math.pow(x, 2) * a) + Math.abs((x * b)) + c - 25);
}

exports.init = init;
