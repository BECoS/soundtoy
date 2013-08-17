var Util = require('./Util.js');

var grid = require('./grid.js'),
    gmodel = require('./gridModel.js'),
    smodel = require('./soundModel.js'),
    panel = require('./panel.js');

/* Entry point to the app */
$( function () {
   
  smodel.init();

  // Add the persistent DOM elements, hiding them if using Jasmine
  elements = [
    $('<div>').attr('id', 'selector').addClass('metal'),

    $('<div>').attr('id', 'bar').addClass('metal').append(
      $('<p>').addClass('instrTitle logo').text('ToneBlaster')),

    $('<div>').attr('id', 'centerpiece').append(
      $('<div>').attr('id', 'grid')),

    $('<div>').attr('id', 'panel').addClass('sideControls metal').append(
      $('<div>').attr('id', 'adsr-container'))
  ];

  smodel.clear();

  if ( $('title').text().match(/^spec/i) ) {
    setupJasmine();
    var $hiddenContainer = $('<div>').addClass('hidden');
    $('body').append($hiddenContainer);
    $hiddenContainer.append(elements);
  } else {
    $('body').append(elements);
  }
  
  // Stops the right-click menu from working
  window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
  };
  
  // Attach important functions to the global Util.dbg for debugging or info
  window.Util.dbg.clear = smodel.clear; 
  window.Util.dbg.initGrid = grid.init; 

  panel.init();
  gmodel.init();
  grid.init();
  smodel.scale();
});

function setupJasmine() {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var reporter = new jasmine.TrivialReporter();

  jasmineEnv.addReporter(reporter);

  jasmineEnv.specFilter = function(spec) {
    return reporter.specFilter(spec);
  };

  jasmineEnv.execute();
}
