var $ = require('jquery-browserify');
require('jqueryuify');
var metro = require('./metronome.js');
var sound = require('./sound.js');

$(function() {
  $('<button id="play">&#9654;</button>').appendTo('#panel');
  $('#play').css('width', 50);
  $('#play').css('color', '#0000FF');
  $('#play').css('text-align', 'center');
  $("button").button()
    .click(function( event ) {
      event.preventDefault();
      if (metro.isPlaying()) {
        $('#play').html('&#9616;&#9616;&nbsp;');
        metro.stop();
        sound.stop();
      } else {
        $('#play').html('&#9654;');
        sound.play();
        metro.play();
      }
    });
  $('#slider').slider({
    value:100,
    min: 0,
    max: 500,
    step: 50
    //slide: function( event, ui ) {
    //  $("#bpm").val($.ui.value );
  }).click(function() {event.preventDefault(); console.log('clicked');});

  //$('<input id="spinner" name="value" />').appendTo('#panel');
  //var spinner = $('#spinner').spinner();
});

//$('<div id="slider">Slider</div>').appendTo('#panel');
$(function() {
  $('<p id="bpm"></p>').appendTo('#panel');
  var bpmSelect = $('#bpm');
  bpmSelect.html(metro.getBPM());
  bpmSelect.css('color', '#FFFFFF');
  bpmSelect.click(function() { 
    bpmSelect.html(metro.setBPM(metro.getBPM() + 5)); 
  });
  
  //$("#bpm").val($("#slider").slider("value") );
});

