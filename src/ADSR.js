var Widget = require('./Widget.js');

ADSR.prototype = Object.create(Widget.prototype);

function ADSR(args) {

  this.$element = $('<div>')
    .attr('id', args.id)
    .css({
      width: '200px',
      height: '180px',
      float: 'left'
    });

  this.$container = args.$container;

  this.$element.appendTo(this.$container);

  this.stage = new Kinetic.Stage({
    container: this.$element.attr('id'),
    width: this.$element.width(),
    height: this.$element.height()
  });

  this.slopeLayer = new Kinetic.Layer();
  this.dragLayer = new Kinetic.Layer();
  this.graphLayer = new Kinetic.Layer();
  this.cellLayer = new Kinetic.Layer();
  this.fillLayer = new Kinetic.Layer();

  this.atkSlope = new Kinetic.Line({
    points: [{
      x: 0,
    y: this.stage.getHeight() * (8 / 9) - 10
    }, {
      x: this.stage.getWidth() / 4,
    y: 0
    }]
  });

  this.dcySlope = new Kinetic.Line({
    points: [{
      x: this.stage.getWidth() / 4,
    y: 0
    }, {
      x: this.stage.getWidth() / 2,
    y: this.stage.getHeight() * (3 / 4) - 50
    }]
  });

  this.stnSlope = new Kinetic.Line({
    points: [{
      x: this.stage.getWidth() / 2,
    y: this.stage.getHeight() * (3 / 4) - 50
    }, {
      x: this.stage.getWidth() * (3 / 4),
    y: this.stage.getHeight() * (3 / 4) - 50
    }]
  });

  this.rlsSlope = new Kinetic.Line({
    points: [{
      x: this.stage.getWidth() * (3 / 4),
    y: this.stage.getHeight() * (3 / 4) - 50
    }, {
      x: this.stage.getWidth(),
    y: this.stage.getHeight() * (8 / 9) - 10
    }]
  });

  this.atkDragger = new Kinetic.Circle({

    x: (this.atkSlope.attrs.points[0].x + this.atkSlope.attrs.points[1].x) / 2,
    y: (this.atkSlope.attrs.points[0].y + this.atkSlope.attrs.points[1].y) / 2,
    radius: 6,
    fill: 'black',
    draggable: true,
    dragBoundFunc: function(pos) {
      var m = this.slope(this.atkSlope.attrs.points[0].x, this.atkSlope.attrs.points[1].x,
        this.atkSlope.attrs.points[0].y, this.atkSlope.attrs.points[1].y);
      var newX;
      if (pos.x > this.atkSlope.attrs.points[1].x) {
        newX = this.atkSlope.attrs.points[1].x;
      }
      else if (pos.x < this.atkSlope.attrs.points[0].x) {
        newX = this.atkSlope.attrs.points[0].x;
      }
      else {
        newX = pos.x;
      }
  return {
    x: newX,
      y: (newX * m) + yIntercept(this.atkDragger.getX(), this.atkDragger.getY(), m)
  };
    }
  });

  this.dcyDragger = new Kinetic.Circle({
    x: (this.dcySlope.attrs.points[0].x + this.dcySlope.attrs.points[1].x) / 2,
    y: (this.dcySlope.attrs.points[0].y + this.dcySlope.attrs.points[1].y) / 2,
    radius: 6,
    fill: 'black',
    draggable: true,
    dragBoundFunc: function(pos) {
      var m = slope(this.dcySlope.attrs.points[0].x, this.dcySlope.attrs.points[1].x,
        this.dcySlope.attrs.points[0].y, this.dcySlope.attrs.points[1].y);
      var newX;
      if (pos.x > this.dcySlope.attrs.points[1].x) {
        newX = this.dcySlope.attrs.points[1].x;
      }
      else if (pos.x < this.dcySlope.attrs.points[0].x) {
        newX = this.dcySlope.attrs.points[0].x;
      }
      else {
        newX = pos.x;
      }
  return {
    x: newX,
      y: (newX * m) + yIntercept(this.dcyDragger.getX(), this.dcyDragger.getY(), m)
  };
    }
  });

  this.stnDragger = new Kinetic.Circle({
    x: (this.stnSlope.attrs.points[0].x + this.stnSlope.attrs.points[1].x) / 2,
    y: (this.stnSlope.attrs.points[0].y + this.stnSlope.attrs.points[1].y) / 2,
    radius: 6,
    fill: 'black',
    draggable: true,
    dragBoundFunc: function(pos) {
      var newY;
      if (pos.y < 0) {
        newY = 0;
      }
      else if (pos.y > this.stage.getHeight() * (8 / 9) - 10) {
        newY = this.stage.getHeight() * (8 / 9) - 10;
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

  this.rlsDragger = new Kinetic.Circle({
    x: (this.rlsSlope.attrs.points[0].x + this.rlsSlope.attrs.points[1].x) / 2,
    y: (this.rlsSlope.attrs.points[0].y + this.rlsSlope.attrs.points[1].y) / 2,
    radius: 6,
    fill: 'black',
    draggable: true,
    dragBoundFunc: function(pos) {
      var m = slope(this.rlsSlope.attrs.points[0].x, this.rlsSlope.attrs.points[1].x,
        this.rlsSlope.attrs.points[0].y, this.rlsSlope.attrs.points[1].y);
      var newX;
      if (pos.x > this.rlsSlope.attrs.points[1].x) {
        newX = this.rlsSlope.attrs.points[1].x;
      }
      else if (pos.x < this.rlsSlope.attrs.points[0].x) {
        newX = this.rlsSlope.attrs.points[0].x;
      }
      else {
        newX = pos.x;
      }
  return {
    x: newX,
      y: (newX * m) + yIntercept(this.rlsDragger.getX(), this.rlsDragger.getY(), m)
  };
    }
  });

  this.atkLimit = new Kinetic.Line({
    points: [{
      x: this.atkSlope.attrs.points[1].x,
    y: 0
    }, {
      x: this.atkSlope.attrs.points[1].x,
    y: this.stage.getHeight() * (8 / 9) - 10
    }],
    stroke: 'black',
    strokeWidth: 2,
  });

  this.dcyLimit = this.atkLimit.clone({points: [{x: this.dcySlope.attrs.points[1].x, y: 0},
    {x: this.dcySlope.attrs.points[1].x, y: this.stage.getHeight() * (8 / 9) - 10}]});
  this.stnLimit = this.atkLimit.clone({points: [{x: this.stnSlope.attrs.points[1].x, y: 0},
    {x: this.stnSlope.attrs.points[1].x, y: this.stage.getHeight() * (8 / 9) - 10}]});

  this.atkCell = new Kinetic.Rect({
    x: 5, 
    y: this.stage.getHeight() - 25,
    width: 40,
    height:20,
    stroke: 'black'
  });

  this.dcyCell = this.atkCell.clone({x: 55});
  this.stnCell = this.dcyCell.clone({x: 105});

  this.atkFill = new Kinetic.Rect({
    x: 5,
    y: this.stage.getHeight() - 25,
    width: 40,
    height: 20,
    fillLinearGradientStartPoint: [35, 0],
    fillLinearGradientEndPoint: [35, 15],
    fillLinearGradientColorStops: [0, '#39e639', 1, '#00cc00']
  });

  this.dcyFill = this.atkFill.clone({x: 55});
  this.stnFill = this.dcyFill.clone({x: 105});
  
  this.atkDragger.on('dragstart', (function (event) {
    this.atkDragger.getLayer().on('draw', function () {
      /*var one = new quadraticEquation(Math.pow(this.atkSlope.attrs.points[0].x, 2), this.atkSlope.attrs.points[0].x, this.atkSlope.attrs.points[0].y);
      var two = new quadraticEquation(Math.pow(this.atkSlope.attrs.points[1].x, 2), this.atkSlope.attrs.points[1].x, this.atkSlope.attrs.points[1].y);

      var mid1X = midpoint(atkLine.attrs.points[0].x, atkDragger.getX());
      var mid1Y = midpoint(atkLine.attrs.points[0].y, atkDragger.getY());
      var mid2X = midpoint(atkLine.attrs.points[1].x, atkDragger.getX());
      var mid2Y = midpoint(atkLine.attrs.points[1].y, atkDragger.getY());
      var mid3X = midpoint(mid1X, mid2X);
      var mid3Y = midpoint(mid1Y, mid2Y);
      atkDragger2.setX(mid3X);
      atkDragger2.setY(mid3Y);*/
      //console.log("height " + atkLine.attrs.points[0].y);

      //console.log("mid 3 x" + mid3X);
      //console.log("mid 3 y" + mid3Y);
      //console.log("attacks y " + atkDragger.getY());

      //var three = new quadraticEquation(Math.pow(mid3X, 2), mid3X, mid3Y);
      //atkDragger2.setY(solveEquations(one, two, three, atkDragger2.getX()));
      //console.log("the y " + atkDragger2.getY());
      drawCurves(this.slopeLayer, this.atkSlope, this.dcySlope, this.stnSlope, this.rlsSlope, this.atkDragger, this.dcyDragger, this.stnDragger, this.rlsDragger);
      //smodel.attack( ( 100 - atkDragger.getY() ) / 100);
    });
  }));  

  this.cellLayer.add(this.atkCell);
  this.cellLayer.add(this.dcyCell);
  this.cellLayer.add(this.stnCell);

  this.fillLayer.add(this.atkFill);
  this.fillLayer.add(this.dcyFill);
  this.fillLayer.add(this.stnFill);

  this.dragLayer.add(this.atkDragger);
  this.dragLayer.add(this.dcyDragger);
  this.dragLayer.add(this.stnDragger);
  this.dragLayer.add(this.rlsDragger);
  this.dragLayer.add(this.atkLimit);
  this.dragLayer.add(this.dcyLimit);
  this.dragLayer.add(this.stnLimit);

  this.stage.add(this.graphLayer);
  this.stage.add(this.slopeLayer);
  this.stage.add(this.dragLayer);
  this.stage.add(this.fillLayer);
  this.stage.add(this.cellLayer);

  this.drawCurves(this.slopeLayer, this.atkSlope, this.dcySlope, this.stnSlope, this.rlsSlope, this.atkDragger, this.dcyDragger, this.stnDragger, this.rlsDragger);

  Widget.call(this);
}

ADSR.prototype.drawCurves = function (slopeLayer, atkSlope, dcySlope, stnSlope, rlsSlope, atkDragger, dcyDragger, stnDragger, rlsDragger) {
  var canvas = slopeLayer.getCanvas();
  var context = canvas.getContext();

  canvas.clear();

  //draw quad
  context.beginPath();
  context.moveTo(atkSlope.attrs.points[0].x, atkSlope.attrs.points[0].y);
  context.quadraticCurveTo(atkDragger.getX(), atkDragger.getY(), atkSlope.attrs.points[1].x, atkSlope.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(dcySlope.attrs.points[0].x, dcySlope.attrs.points[0].y);
  context.quadraticCurveTo(dcyDragger.getX(), dcyDragger.getY(), dcySlope.attrs.points[1].x, dcySlope.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(stnSlope.attrs.points[0].x, stnSlope.attrs.points[0].y);
  context.lineTo(stnSlope.attrs.points[1].x, stnSlope.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(rlsSlope.attrs.points[0].x, rlsSlope.attrs.points[0].y);
  context.quadraticCurveTo(rlsDragger.getX(), rlsDragger.getY(), rlsSlope.attrs.points[1].x, rlsSlope.attrs.points[1].y);
  context.strokeStyle = 'blue';
  context.lineWidth = 2;
  context.stroke();
};

ADSR.prototype.slope = function (x1, x2, y1, y2) {
  var m = -1 * ((y2 - y1) / (x2 - x1));
  return m;
};

module.exports = ADSR;
