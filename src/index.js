require('./Util.js');

var grid = require('./grid.js'),
    gmodel = require('./gridModel.js'),
    smodel = require('./soundModel.js'),
    panel = require('./panel.js');

/* Entry point to the app */
$( function () {
  gmodel.init();
  grid.init();
  
  // Stops the right-click menu from working
  window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
  };
  
  // Attach important functions to the global Util.dbg for debugging or info
  window.Util.dbg.clear = smodel.clear; 
  window.Util.dbg.initView = grid.init; 

  panel.init();
});
