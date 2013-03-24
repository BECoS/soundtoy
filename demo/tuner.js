function tuner() {
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

var letterNoteLookup = {
  'C'  : 0,
  'C#' : 1,
  'D'  : 2,
  'D#' : 3,
  'E'  : 4,
  'F'  : 5,
  'F#' : 6,
  'G'  : 7,
  'G#' : 8,
  'A'  : 9,
  'A#' : 10,
  'B'  : 11,
};

var noteDurationLookup = {
  'whole'             : 4,
  'half'              : 2,
  'quarter'           : 1,
  'eighth'            : 0.5,
  'sixteenth'         : 0.25, 
  'thirty-second'     : 0.125,
  'sixty-fourth'      : 0.0625,
  'one-twenty-eighth' : 0.03125,
};

function getNoteDurationScale(noteDuration) {
  return noteDurationLookup[noteDuration];
}

function classic2Midi(note) {
  var letter = (note.match(/[a-gA-G]#?/))[0]; 
  letter = letter.toUpperCase();
  var octave = (note.match(/[0-9]+/))[0];
  return (12 * octave) + letterNoteLookup[letter];
}

function midi2Freq(midi) {
  return chromatics[midi + 74];
}

function equalTemp(midi) {
  var offset = midi - 53;
  return 440*Math.pow(2, offset/12);
}



