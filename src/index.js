require('./Util.js');
var grid = require('./grid.js'),
    gmodel = require('./gridModel.js');    

$( function () {
  gmodel.initialize();
  grid.initView();
  $('figure').click( function () {
    $(this).addClass('clicked');
    var row = $(this).attr('row');
    var col = $(this).attr('col');
    var freshState = gmodel.getState(row, col) === 1 ? 0 : 1;
    gmodel.updateState(row, col, freshState);
    setTimeout(function (square) {
      $('.clicked').removeClass('clicked');
      $(square).toggleClass('active');
    }, 100, this);
  });
  grid.initGridZoom();
});
