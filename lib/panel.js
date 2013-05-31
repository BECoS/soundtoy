var $ = require('jquery-browserify');
var smodel = require('./soundModel.js');
var imgpreload = 
  require('../node_modules/imgpreload/imgpreload.js').imgpreload;


$(function() {
  var kinetic = require('../node_modules/kinetic/kinetic.js').Kinetic;
  window.kinetic = kinetic;
  var stage = new kinetic.Stage({
      container: 'bar',
      width: $('#bar').width() / 2,
      height: $('#bar').height() * 0.9, 
  });

  var ctrlLayer = new kinetic.Layer();
  stage.add(ctrlLayer);
  imgpreload(["img/playButtonOff.svg", "img/playButtonOn.svg"], function(images) {
    var playInactive = new kinetic.Image({
        height: $('#bar').height() * 0.7,
        image: images[0],
    });
    window.playInactive = playInactive;
    playInactive.setWidth(playInactive.getHeight());
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
  $('#panel').append('<h1 class="instrument">Additive &#43;</h1>');
});
