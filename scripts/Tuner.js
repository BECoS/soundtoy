function Tuner() {
  this.SEMINAL_TONE = 440;
  this.OCTAVES = 12;
  this.INTERVALS = 12;
  this.cents = 100;
  this.buildChromaticScale();
  return this;
}

Tuner.prototype.buildChromaticScale = function () {
  this.chromatic = [this.SEMINAL_TONE];
  for (var i = 1; i < this.OCTAVES * this.INTERVALS; i++) {
    this.chromatic[i] = this.chromatic[i-1] * Math.pow(2,
      this.cents/1200);
  }
  for (var j = 1; j < this.OCTAVES * this.INTERVALS; j++) {
    this.chromatic.unshift(this.chromatic[0] / Math.pow(2, 
      this.cents/1200));
  }
  return this;
};

Tuner.letterNoteLookup = {
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

Tuner.noteDurationLookup = {
  'whole'             : 4,
  'half'              : 2,
  'quarter'           : 1,
  'eighth'            : 0.5,
  'sixteenth'         : 0.25, 
  'thirty-second'     : 0.125,
  'sixty-fourth'      : 0.0625,
  'one-twenty-eighth' : 0.03125,
};

Tuner.prototype.classic2Seconds = function (noteDuration) {
  return Tuner.noteDurationLookup[noteDuration];
};

Tuner.prototype.classic2Midi = function (note) {
  var letter = (note.match(/[a-gA-G]#?/))[0]; 
  letter = letter.toUpperCase();
  var octave = parseInt((note.match(/[0-9]+/))[0], 10);
  return (12 * (octave + 1)) + Tuner.letterNoteLookup[letter];
};

Tuner.prototype.midi2Freq = function (midi) {
  return this.chromatic[(midi - 69) + this.OCTAVES * this.INTERVALS - 1];
};

Tuner.prototype.classic2Freq = function (note) {
  return this.midi2Freq(this.classic2Midi(note));
};

exports.Tuner = Tuner;
