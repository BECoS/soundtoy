var $ = require('jquery-browserify');
require('jqueryuify');
var smodel = require('./soundModel.js');
var imgpreload = 
  require('../node_modules/imgpreload/imgpreload.js').imgpreload;


$(function() {
  var kinetic = require('../node_modules/kinetic/kinetic.js').Kinetic;
  window.kinetic = kinetic;
  var stage = new kinetic.Stage({
    container: 'panel',
      width: 425,
      height: 300
  });

  var ctrlLayer = new kinetic.Layer();
  stage.add(ctrlLayer);

  imgpreload(["site/img/playButtonOff.svg", "site/img/playButtonOn.svg"], function(images) {
    var playInactive = new kinetic.Image({
      x: 50,
        y: 250,
        height: 58,
        width: 70,
        image: images[0],
    });
    ctrlLayer.add(playInactive);
    ctrlLayer.draw();

    var playActive = playInactive.clone({image: images[1]});

    playActive.createImageHitRegion(function() {
      playActive.getLayer().drawHit();
    });

    playInactive.on('mousedown', function(event) {
      ctrlLayer.removeChildren();
      ctrlLayer.add(playActive);
      ctrlLayer.draw();
    });

    playActive.on('mousedown', function(event) {
      ctrlLayer.removeChildren();
      ctrlLayer.add(playInactive);
      ctrlLayer.draw();
    });   

  });

});
