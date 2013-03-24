/**/

var rows, columns, model;

function initialize(rows, columns) {
  model = new Array(rows);
  model.forEach(function(e, i, A) { 
    e = new Array(rows);
  });
}

function getActive(beat) {
  return model.map(function (e, i, A) {
    if (e[beat] === 1) return i; 
  });
}

function updateModel(x, y, state) {
  model[x][y] = state;
}

exports.initialize = initialize;
exports.getActive = getActive;
