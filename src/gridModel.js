/**/

var model = require('./soundModel.js');

function init() {
//TODO: Seperate this module's sequence from the soundModel's
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

function getNoteFromRow(row) {
  return model.getNoteFromInstr(row);
}

function totalNotes() {
  return model.numVoices() * model.numNotes();
}

exports.init = init;
exports.getState = getState;
exports.getNoteFromRow = getNoteFromRow;
exports.updateState = updateState;
exports.getActiveColumn = getActiveColumn;
exports.isPlaying = isPlaying;
exports.numVoices = numVoices;
exports.numNotes = numNotes;
exports.totalNotes = totalNotes;
exports.getTime = getTime;
