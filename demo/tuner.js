function tuner () {
  var SEMINAL_TONE = 440;
  var OCTAVES = 12;
  var INTERVALS = 12;
  var cents = {};
  cents.equalTemperament = 100;

  function buildChromaticScale() {
    var chromatic = [SEMINAL_TONE];
    for (var i = 1; i < OCTAVES * INTERVALS; i++) {
      chromatic[i] = chromatic[i-1] * Math.pow(2,
        cents.equalTemperament/1200);
    }
    for (var i = 1; i < OCTAVES * INTERVALS; i++) {
      chromatic.unshift(chromatic[0] / Math.pow(2, 
        cents.equalTemperament/1200));
    }
    return chromatic;
  }
  var chromatics = buildChromaticScale();
  
  return chromatics;
}

function equalTemp(midi) {
  var offset = midi - 53;
  return 440*Math.pow(2, offset/12);
}



