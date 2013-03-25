/**/

var model = require('./soundModel.js');

var numVoices = 8,
    numNotes = 8;

function initialize(rows, columns) {
//TODO: Seperate this module's sequence from the soundModel's
  model.initialize();
}

function updateModel(x, y, state) {
  model.updateSequence(x, y, state);
}

function getActiveColumn() {
  return model.getActiveColumn();
}

function getState(x, y) {
  return model.getState(x, y);  
}

function isPlaying() {
  return model.isPlaying();
}


exports.initialize = initialize;
exports.updateModel = updateModel;
exports.getState = getState;
exports.getActiveColumn = getActiveColumn;
exports.isPlaying = isPlaying;
exports.numVoices = numVoices;
exports.numNotes = numNotes;
