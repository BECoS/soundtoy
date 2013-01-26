/**/
var metro = require('./metronome.js');
var width = 8;
var height = 8;
var beat = 0;

var getActiveColumn = function () {
  return (metro.getBeat() % 8);  
};

exports.getActiveColumn = getActiveColumn;
