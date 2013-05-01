/**/

var model = require('./soundModel.js');

function initialize(rows, columns) {
//TODO: Seperate this module's sequence from the soundModel's
  console.log("gridModel initialized");
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

function updateState(x, y, state) {
  return model.updateState(x, y, state);
}

function isPlaying() {
  return model.isPlaying();
}

function getTime() {
  return model.getTime();
}

function numVoices() {
  return model.numVoices();
}

function numNotes() {
  return model.numNotes();
}

exports.initialize = initialize;
exports.updateModel = updateModel;
exports.getState = getState;
exports.updateState = updateState;
exports.getActiveColumn = getActiveColumn;
exports.isPlaying = isPlaying;
exports.numVoices = numVoices;
exports.numNotes = numNotes;
exports.getTime = getTime;
