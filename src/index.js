require('./Util.js');

var grid = require('./grid.js'),
    gmodel = require('./gridModel.js'),
    panel = require('./panel.js');

$( function () {
  gmodel.init();
  grid.init();

  // Stops the right-click menu from working
  window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
  };
  
  //TODO: Somehow it seems to be covering up the grid and preventing
  // clicks/hovering from getting through
  //panel.init();
});
