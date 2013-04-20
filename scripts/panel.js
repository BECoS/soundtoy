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
      width: $('#panel').css('width'),
      height: $('#panel').css('height'), 
  });

  var ctrlLayer = new kinetic.Layer();
  stage.add(ctrlLayer);

  imgpreload(["img/playButtonOff.svg", "img/playButtonOn.svg"], function(images) {
    var playInactive = new kinetic.Image({
      x: 5,
        y: 5,
        height: 58,
        width: 70,
        image: images[0],
    });
    ctrlLayer.add(playInactive);
    ctrlLayer.draw();

    var playActive = playInactive.clone({image: images[1]});

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

  });

});
